const multer = require('multer')
//Model
const User = require('../models/userModel');
//Utils
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

// Factory
const factory = require('./handlerFactory')


// UPLOAD IMAGE -- MULTER
const multerStorage = multer.diskStorage({// in our file system
    destination: (req, file, cb) => {
        cb(null, 'public/img/users');
    },
    filename: (req, file, cb) => {
        // user-<id>-<timestamp>.jpeg
        const ext = file.mimetype.split('/')[1]; // mimetype:'image/jpeg'
        cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
    }
}) 

const multerFilter = (req, file, cb) => {
    //work for all kind of file we want to upload. here we want image
    if(file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb(new AppError('Not an image! Please upload only images', 400), false)
    }
}

// upload define settings
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
}) 

exports.uploadUserPhoto = upload.single('photo'); //middleware, single file with name of the field 'photo' 



const filterObj = (obj, ...allowedfields) => {
    const newObj = {}
    //loop through the object
    Object.keys(obj).forEach(el => {
        if(allowedfields.includes(el)) newObj[el] = obj[el]
    })
    return newObj;
}


//based on the current user logged In -- a simple middlware for getOne
exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next()
}


// 'user' can update some fields (name, email) -- not in the same route/ place as update password
exports.updateMe = catchAsync(async(req, res, next) => {
    console.log(req.file) // from multer upload previous middleware
    console.log(req.body)

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