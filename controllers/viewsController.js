
//Utils
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const User = require('../models/userModel')
const Tour = require('../models/tourModel')
const Booking = require('../models/bookingModel')


// EXAMPLE OF GENERIC ALERT HANDLE -- PUT IN THE QUERY STRING (can be added to all views route if we want instead of managed by front-end JS)
exports.alerts = (req, res, next) => {
    const { alert } = req.query;
    if(alert === 'booking'){ // only for booking here, as an example
        res.locals.alert = "Your booking was successful! Please check your email for a confirmation. If your booking doesn't show up here immediately, please come back later."
    }

    next();
}


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

exports.getSignupForm = (req, res) => {
    res.status(200).render('signup', {
        title: `Sign up`
    })
}

exports.getForgotPasswordForm = (req, res) => {
    if(!res.locals.user){ // only if no user connected we can access to this page
        res.status(200).render('forgotPassword', {
            title: 'Request a new password'
        })
    } else {
        res.redirect('/')
    }
}

exports.getresetPasswordForm = (req, res) => {
    if(!res.locals.user){ // only if no user connected we can access to this page
        const { token, email } = req.query;
        const passwordQuery = `${token}&${email}`
        res.status(200).render('resetPassword', {
            title: 'Set your new password',
            passwordQuery
        })
    } else {
        res.redirect('/')
    }
}

exports.getAccount = (req, res) => {
    // user is in locals thanks to protect middleware (findById is there)
    // available in res.locals.user from protect
    res.status(200).render('profileSettings', {
        title: `Your account`,
        url: req.originalUrl
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

    res.status(200).render('profileSettings', {
        title: `Your account`,
        user: updatedUser,
        url: req.originalUrl
    })
})


exports.getMyTours = catchAsync(async(req, res, next) => { // or virtual populate on Tours
    // 1) Find all bookings
    const bookings = await Booking.find({ user: req.user.id })

    // 2) Find tours with the returned IDs
    const tourIds = bookings.map(el => el.tour); // et an array of tours
    const tours = await Tour.find({ _id: { $in: tourIds}}); // select all tours that have an Id which is in the tourIds array

    res.status(200).render('myBookings', { // 'overview page, maybe change to new account view
        title: 'My Tours',
        tours,
        url: req.originalUrl
    })
})