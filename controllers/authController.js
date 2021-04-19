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
        passwordConfirm: req.body.passwordConfirm
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