const { promisify } = require('util')
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const User = require('../models/userModel');


const signToken = id => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    }); // sign with the user id from DB -- secret should be at least 32charac long, longer is better, as always -- I used 'randomKeygen' generator online
}

const createSendToken = (user, statusCode, res) => { // login token
    const token= signToken(user._id);

    //store in a cookie
    const cookieOptions ={
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000), // convert days to milliseconds
        httpOnly: true, // cannot be accessed or modified in any way by the Browser !! (avoid cross site scripting attacks XSS)
    }
    // only sent on encrypted connection (HTTPS) -- in dev we are not in HTTPS
    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true
    res.cookie('jwt', token, cookieOptions)

    // just remove the password from the output.
    user.password = undefined

    res.status(statusCode).json({
        status: 'success',
        token, // give the token to the Client
        data: {
            user
        }
    })
}

exports.signup = catchAsync(async(req, res, next) => { // next is for catchAsync
    // const newUser = await User.create({...req.body}); // DO NOT USE THIS SPREAD, BECAUSE SOMEONE CAN ADD SOMETHING TO THE BODY, like role: "admin", it can be dramatic
    // instead get value by value
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role
    });

    // Use JWT to sign in when user just created (same thing will happen when Sign In)
    createSendToken(newUser, 201, res)
})


exports.login = catchAsync(async(req, res, next) => {
    const { email, password } = req.body;

    // 1) check if email and password exists
    if(!email || !password){
        return next(new AppError('Please provide email and password', 400))
    }

    // 2) check if user exists && password correct
    // password as select: false in model, so not showing by default, we need to explicitely select the field needed from DB ("+" is for initially false selected)
    const user = await User.findOne({ email: email}).select('+password');

    if(!user || !(await user.correctPassword(password, user.password))) { // both so don't give any indice to the attacker -- check password only if user exists, that's why user check first
        return next(new AppError('Incorrect email or password', 401))
    }

    // 3) If everything is ok, send token to client
    createSendToken(user, 200, res)
})


//For rendered pages -- ONLY -- Not supposed to protect route
exports.isLoggedIn = async (req, res, next) => {

    if(req.cookies.jwt){
        try {
        // cookie from browser
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)
        
            // 2) user still exists
            const currentUser = await User.findById(decoded.id);
            if(!currentUser){
                return next()
            }
    
            // 4) Check if user changed password after the token was issued (if password changed, give a new web token on login)
            // see userModel for method in userSchema
            if(currentUser.changedPasswordAfter(decoded.iat)){ // iat for "issued at", when the token was delivered
                return next()
            }
    
    
            // THESE IS A LOGGED IN USER
            res.locals.user = currentUser // set the user in the locals
            return next();
        } catch (err) {
            return next(); // no logged in user
        }
    }
    
    // no JWT cookie -- no logged in user
    next();
}

exports.logout = (req, res) => {
    //delete the cookie immediately by setting time to the past
    // res.cookie('jwt', 'null', { expires: new Date(Date.now() -10 * 1000), httpOnly: true});
    res.clearCookie('jwt')
    res.status(200).json({ status: 'success'})
}


exports.protect = catchAsync(async (req, res, next) => {
    let token;
    // 1) Getting incoming token and check if it's there
    // Standard for token is under Authorization header with Bearer in front of the token value
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]; // second element after Bearer
    } else if(req.cookies.jwt && req.cookies.jwt !== 'loggedout'){
        token = req.cookies.jwt; // cookie from browser
    }

    if(!token){ // no token sent --> no logged in
        return next(new AppError('You are not logged in! Please login to get access.', 401))
    }
    
    // 2) Verification of incoming token (compare signature)
    // not return a promise by default so set Promise in order to use async using built-in Node util package --> Promisify jwt.verify() function, calls it with the arguments, then await the results
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    // manage errors in errorController.js -- will not continue the following if error thanks to errorController
    // invalid webtoken --> JsonWebTokenError
    // token expires, we change the time to test in .env --> TokenExpiredError

    // 3) Check if user still exists (user can be removed from DB but still have the token in its browser -- our someone stole the token in the meantime)
    // decoded contains the id of the user because we generated the token with that id
    const currentUser = await User.findById(decoded.id);
    if(!currentUser){
        return next(new AppError('The user belonging to this token does no longer exist', 401))
    }

    // 4) Check if user changed password after the token was issued (if password changed, give a new web token on login)
    // see userModel for method in userSchema
    if(currentUser.changedPasswordAfter(decoded.iat)){ // iat for "issued at", when the token was delivered
        return next(new AppError('User recently changed password! Please log in again.', 401))
    }


    // GRANT ACCESS TO PROTECTED ROUTE -- EVRYTHING ABOVE WENT WELL
    // put the user data on the request for the next journey
    req.user = currentUser;
    res.locals.user = currentUser // set the user in the locals
    next();
})

//In order to get argument, wrap a function with the arguments to return the normal middleware function
// ...roles puts arguments in an array
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        //roles ['admin', 'lead-guide']
        // req comes from previous middleware, so protect() with the user inside
        if(!roles.includes(req.user.role)){// One of the roles (from arguments) in not included as role from current User --> set an permission error
            return next(new AppError('You do not have permission to perform this action', 403))
        }
        // otherwise we allow access to the next middleware
        next();
    }
}


exports.forgotPassword = catchAsync(async(req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email })
    if(!user){ // no user found
        return next(new AppError('There is no user with email address', 404))
    }

    // 2) Generate the random token (nothing to do with JSon Web Token)
    // token that will identify the user when reaching the New Password page (it's like a temporary password) -- still do not store the plain token in database, hash it
    // see userModel for the Schema method
    const resetToken = user.createPasswordResetToken();
    //need to save in database
    await user.save({validateBeforeSave: false}); // disable the validation because we only update the passwordResetToken and passwordResetExpires here (we would have error not mentioning email and password if not) - because we don't have the password, we forgot it !

    // 3) Send it to user's email
    // url for click to request a new password
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}&${req.body.email}` // add email to make sure of unicity (if someone else managed to generate the same token...)

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL} \nIf you didn't forget your password, please ignore this email.`

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message
        })

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        })
    } catch(err) {// we want to do more than just send an error, so custom try...catch here
        user.createPasswordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false});

        return next(new AppError('There was an error sending the email. Try again later', 500))
    }
})

exports.resetPassword = catchAsync(async(req, res, next) => {

    //  1) Get user based on the token
    // encrypt in order to compare with the encrypted token in DB
    // in params, URL looks like this : /api/v1/users/resetPassword/db41106f266acee32759feb86a56fa4691047f01d0a78d332c8328a6da356cbc
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    console.log(hashedToken);
    

    //the token is the only thing right now that can identify the user
    const foundUser = await User.findOne({ email: req.params.email, passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } }) // also check if toekn as not yet expires
    
    // 2) If token has not expired, and there is user, set new password
    if(!foundUser){ // no user found with this token, or token has expired
        return next(new AppError('Token is invalid or has expired', 400))
    }
    // otherwise, if everything is ok
    foundUser.password = req.body.password;
    foundUser.passwordConfirm = req.body.passwordConfirm;
    // reset token
    foundUser.passwordResetToken = undefined; 
    foundUser.passwordResetExpires = undefined;
    await foundUser.save(); // we want to validate here fro model (passwordConfirm === password)

    // 3) update changedPasswordAt property for the user

    // 4) Log the user in, send JWT
    createSendToken(foundUser, 200, res)
})


// Logged in User that wants to update its password
exports.updatePassword = catchAsync(async(req, res, next) => {
    // 1) Get the user from the collection
    // We are logged in, so we already have our user in the request (coming from protect middleware)
    const user = await User.findById(req.user.id).select('+password'); // get the user with the password

    // 2) Check if the POSTed password is correct (old password)
    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Your curretn password is wrong', 401))
    }

    // 3) If so, update the password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    await user.save(); // pre.save() functions in userModel will hash, and the other one, set the passwordChangedAt.

    //WE DON'T USE findByIdAndUpdate() because our pre.save() will not work, for hasing password
    // AND ALSO, The validator in model for passwordConfirm WILL NOT WORK (Only on save() and create())

    // 4) Log user in automatically, send JWT
    createSendToken(user, 200, res)
})