const express = require('express');

const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

const router = express.Router();



router.route('/')
    .get(reviewController.getAllReviews) // get all reviews for this tour
    .post(authController.protect, authController.restrictTo('user'), reviewController.createReview) // only user can post a review


module.exports = router;