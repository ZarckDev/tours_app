
//Utils
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const User = require('../models/userModel')
const Tour = require('../models/tourModel')
const Booking = require('../models/bookingModel')


exports.getOverview = catchAsync(async(req, res, next) => {
    // 1) Get tour data from collection
    const tours = await Tour.find();

    // 2) Build template
    // 3) Render that template using our data from 1)
    res.status(200).render('overview', {
        title: `All Tours`,
        tours
    })
})

exports.getTour = catchAsync(async(req, res, next) => {
    // 1) Get the data, for the requested tour (need reviews and guides)
    const { name } = req.params;
    
    const tour = await Tour.findOne({ slug: name }).populate({
        path: 'reviews',
        select: 'review rating user'
    })

    if(!tour) {
        return next(new AppError('There is no tour with that name', 404))
    }

    // 2) Build template
    // 3) Render template using data from 1)
    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour
    })
})


exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: `Log into you account`
    })
}

exports.getAccount = (req, res) => {
    // user is in locals thanks to protect middleware (findById is there)
    // available in res.locals.user from protect
    res.status(200).render('account', {
        title: `Your account`
    })
}

// THIS FUNCTION IS FOR FORM SUBMITTED DIRECTLY FROM HTML -- EXAMPLE WHEN WE DON'T HAVE AN API
exports.updateUserData = catchAsync(async(req, res, next) => {
    // console.log('UPDATING USER: ', req.body)
    // password handle separately, because we can't use findByIdAndUpdate, it will not run ou save() middleware for encryption
    const updatedUser = await User.findByIdAndUpdate(req.user.id, { // specify field to avoid malicious additional input data
        name: req.body.name,
        email: req.body.email
    },
    {
        new: true, // return the new user
        runValidators: true
    });

    res.status(200).render('account', {
        title: `Your account`,
        user: updatedUser
    })
})


exports.getMyTours = catchAsync(async(req, res, next) => { // or virtual populate on Tours
    // 1) Find all bookings
    const bookings = await Booking.find({ user: req.user.id })

    // 2) Find tours with the returned IDs
    const tourIds = bookings.map(el => el.tour); // et an array of tours
    const tours = await Tour.find({ _id: { $in: tourIds}}); // select all tours that have an Id which is in the tourIds array

    res.status(200).render('overview', { // 'overview page, maybe change to new account view
        title: 'My Tours',
        tours
    })
})