//Model
const Review = require('../models/reviewModel');
//Utils
// const catchAsync = require('../utils/catchAsync')

// Factory
const factory = require('./handlerFactory')


exports.setTourUserIds = (req, res, next) => {
    // Allow nested routes - we can still specify the tour and the user ids
    // If tour is not mention in the body, get it from url
    if(!req.body.tour) req.body.tour = req.params.tourId; // from url
    if(!req.body.user) req.body.user = req.user.id; // access to user because we are logged in at this point
    next();
}

exports.getAllReviews = factory.getAll(Review); // now we can use features for reviews
exports.getReview = factory.getOne(Review); // no populate option
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review); // pass the Model