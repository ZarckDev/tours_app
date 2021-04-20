//Model
const User = require('../models/userModel');
//Utils
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')


const filterObj = (obj, ...allowedfields) => {
    const newObj = {}
    //loop through the object
    Object.keys(obj).forEach(el => {
        if(allowedfields.includes(el)) newObj[el] = obj[el]
    })
    return newObj;
}

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

// 'user' can update some fields (name, email) -- not in the same route/ place as update password
exports.updateMe = catchAsync(async(req, res, next) => {
    // 1) Create error if user POSTs password data
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('This route is not for password update. Please use /updateMyPassword', 400)) // bad request
    }

    //  2) Filtered out unwanted fields
    // some fields will not change, so if we use save() the validators will through us an error
    // so use findByIdAndUpdate
    // we don't want to pass the body, because the user could send body.role: 'admin' ....
    // only contains mail or name, we need to filter the body
    const filteredBody = filterObj(req.body, 'name', 'email');
    //  3) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new:true, // return the updated document
        runValidators:true // run the validator (validate the email we changed it)
    })

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
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