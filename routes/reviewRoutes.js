const express = require ('express')

const reviewController = require('../controllers/reviewController')
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');


const router = express.Router({ mergeParams: true }); // get the params from URL defined previously (in tourRoutes for :tourId access)

// FOR THOSE ROUTES :
// POST /tours/246456/reviews
// POST /reviews


// Protect ALL ROUTES AFTER THIS MIDDLEWARE -- need to be logged In
router.use(authController.protect) 


// REVIEWS
router.route('/') ///api/v1/tours/:tourId/reviews
    .get(reviewController.getAllReviews) // get all reviews for this tour
    .post( 
        authController.restrictTo('user'), // only user can post a review
        reviewController.setTourUserIds,  // for nested routes with tour Id or not
        // Create review only for user that booked the tour -- pre('save') better than middleware
        reviewController.createReview) 

    // setTourUserIds to get the tour id and the user id whether it's in the body or in the params URL




router.route('/:id') // /api/v1/reviews/:id
    .get(reviewController.getReview)
    .patch(
        authController.restrictTo('user', 'admin'), // only the user and admin can modify a review
        reviewController.updateReview
    )
    .delete(
        authController.restrictTo('user', 'admin'),// only the user and admin can delete a review
        reviewController.deleteReview
    )


module.exports = router