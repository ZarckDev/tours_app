var jwt = require('jsonwebtoken');

const catchAsync = require('../utils/catchAsync');

const User = require('../models/userModel');



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
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    }); // sign with the user id from DB -- secret should be at least 32charac long, longer is better, as always -- I used 'randomKeygen' generator online

    res.status(201).json({
        status: 'success',
        token, // give the token to the Client
        data: {
            user: newUser
        }
    })
})