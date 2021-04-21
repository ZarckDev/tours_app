//Model
const User = require('../models/userModel');
//Utils
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

// Factory
const factory = require('./handlerFactory')


const filterObj = (obj, ...allowedfields) => {
    const newObj = {}
    //loop through the object
    Object.keys(obj).forEach(el => {
        if(allowedfields.includes(el)) newObj[el] = obj[el]
    })
    return newObj;
}

// ROUTES HANDLERS


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

// just set to inative, not delete from DB
exports.deleteMe = catchAsync(async(req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {active: false})

    res.status(204).json({
        status: 'success',
        data: null
    })
})

exports.createUser = (req, res) => {
    // internal server error -- not implemented
    res.status(500).json({
        status: 'error',
        message: "This route is not yet defined! Please use /signup instead"
    })
}

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User); // no populate option
// Do NOT Update passwords with this
exports.updateUser = factory.updateOne(User); // only Admin
exports.deleteUser = factory.deleteOne(User); // only Admin
// exports.deleteUser = (req, res) => {
//     // internal server error -- not implemented
//     res.status(500).json({
//         status: 'error',
//         message: "This route is not yet defined!"
//     })
// }