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
    .post(authController.protect, authController.restrictTo('user'), reviewController.setTourUserIds, reviewController.createReview) // only user can post a review

    // setTourUserIds to get the tour id and the user id whether it's in the body or in the params URL


router.route('/:id') // /api/v1/reviews/:id
    .get(reviewController.getReview)
    .patch(reviewController.updateReview)
    .delete(reviewController.deleteReview)


module.exports = router