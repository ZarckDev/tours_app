//Model
const Tour = require('../models/tourModel');
const Review = require('../models/reviewModel');
//Utils
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')



exports.getAllReviews = catchAsync(async(req, res, next) => {
    // EXECUTE QUERY
    const reviews = await Review.find(); 

    res.status(200).json({
        status: 'success',
        results: reviews.length, // because we send an array
        data:{
            reviews
        }
    })

})


exports.createReview = catchAsync(async(req, res, next) => {
    
    // Allow nested routes - we can still specify the tour and the user ids
    // If tour is not mention in the body, get it from url
    if(!req.body.tour) req.body.tour = req.params.tourId; // from url
    if(!req.body.user) req.body.user = req.user.id; // access to user because we are logged in at this point
    
    const newReview = await Review.create({...req.body});

    res.status(201).json({
        status: 'success',
        data:{
            review: newReview
        }
    })

})