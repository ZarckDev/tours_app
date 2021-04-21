const express = require ('express')

const reviewController = require('../controllers/reviewController')
const authController = require('../controllers/authController');


const router = express.Router({ mergeParams: true }); // get the params from URL defined previously (in tourRoutes for :tourId access)

// FOR THOSE ROUTES :
// POST /tours/246456/reviews
// POST /reviews


// REVIEWS
router.route('/') ///api/v1/tours/:tourId/reviews
    .get(reviewController.getAllReviews) // get all reviews for this tour
    .post(authController.protect, authController.restrictTo('user'), reviewController.createReview) // only user can post a review


module.exports = router