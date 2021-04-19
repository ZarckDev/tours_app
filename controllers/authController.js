const { promisify } = require('util')
const jwt = require('jsonwebtoken');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const User = require('../models/userModel');


const signToken = id => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    }); // sign with the user id from DB -- secret should be at least 32charac long, longer is better, as always -- I used 'randomKeygen' generator online
}


exports.signup = catchAsync(async(req, res, next) => { // next is for catchAsync
    // const newUser = await User.create({...req.body}); // DO NOT USE THIS SPREAD, BECAUSE SOMEONE CAN ADD SOMETHING TO THE BODY, like role: "admin", it can be dramatic
    // instead get value by value
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt
    });

    // Use JWT to sign in when user just created (same thing will happen when Sign In)
    const token = signToken(newUser._id)

    res.status(201).json({
        status: 'success',
        token, // give the token to the Client
        data: {
            user: newUser
        }
    })
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
    const token= signToken(user._id);
    res.status(200).json({
        status: 'success',
        token // give the token to the Client
    })
})


exports.protect = catchAsync(async (req, res, next) => {
    let token;
    // 1) Getting incoming token and check if it's there
    // Standard for token is under Authorization header with Bearer in front of the token value
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]; // second element after Bearer
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
    next();
})