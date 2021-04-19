//Model
const User = require('../models/userModel');
//Utils
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')


// ROUTES HANDLERS
exports.getAllUsers = catchAsync(async(req, res) => {
    // internal server error -- not implemented
    const users = await User.find();

    res.status(200).json({
        status: 'success',
        results: users.length, // because we send an array
        data:{
            users
        }
    })
})

exports.getUser = (req, res) => {
    // internal server error -- not implemented
    res.status(500).json({
        status: 'error',
        message: "This route is not yet defined!"
    })
}
exports.createUser = (req, res) => {
    // internal server error -- not implemented
    res.status(500).json({
        status: 'error',
        message: "This route is not yet defined!"
    })
}
exports.updateUser = (req, res) => {
    // internal server error -- not implemented
    res.status(500).json({
        status: 'error',
        message: "This route is not yet defined!"
    })
}
exports.deleteUser = (req, res) => {
    // internal server error -- not implemented
    res.status(500).json({
        status: 'error',
        message: "This route is not yet defined!"
    })
}