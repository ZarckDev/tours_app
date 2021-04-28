const express = require ('express')

const tourController = require('../controllers/tourController')
const authController = require('../controllers/authController');

const reviewRouter = require('../routes/reviewRoutes');
const bookingRouter = require('../routes/bookingRoutes');

const router = express.Router(); // It's a middleware that is executed before the .get() and others

// Param Middleware function -- ONLY FOR THIS ROUTER
// router.param('id', (req, res, next, val) => {
//     console.log(`Tour id is : ${val}`); // val holds the value of "id" parameter
//     next();
// })
// router.param('id', tourController.checkID); // middleware to check the ID for /:id routes


// reviews
router.use('/:tourId/reviews', reviewRouter) // use the review Router in case of this url
//  /api/v1/tours/:tourId/reviews
router.use('/:tourId/bookings', bookingRouter) // for all bookings of specific tour
//  /api/v1/tours/:tourId/bookings


// ROUTES FOR SPECIFIC API REQUESTS
// run a middleware before getting the tours, in order to define the query in request
router.route('/top-5-cheap')
    .get(
        tourController.aliasTopTours, // build the query for filtering and sort
        tourController.getAllTours // get the tour with Features (query string)
    )


// ROUTES FOR PIPELINE
router.route('/tour-stats')
    .get(tourController.getTourStats)
router.route('/monthly-plan/:year')
    .get(
        authController.protect, // only logged In
        authController.restrictTo('admin', 'lead-guide', 'guide'), // only admin, guide and lead-guide can obtain the montly plan for a year
        tourController.getMonthlyPlan
    )

// Geospacial Queries
router.route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get( tourController.getToursWithin)
// /tours-within/distance/233/center/-40,45/unit/km
// other way /tours-within?distance=233&center=-40,45&unit=km


// distance from a certain point
router.route('/distances/:latlng/unit/:unit')
    .get(tourController.getDistances)


// ROUTES
router.route('/')
    .get(tourController.getAllTours) // all tours are visible to everyone
    .post(
        authController.protect, // only logged In
        authController.restrictTo('admin', 'lead-guide'), // only admin and lead-guide can create a tour
        tourController.createTour
    )

router.route('/:id')
    .get(tourController.getTour) // a tour is visible to everyone
    .patch(
        authController.protect, // only logged In
        authController.restrictTo('admin', 'lead-guide'), // only admin and lead-guide can update a tour -- ISSUE, ALL LEAD-GUIDE CAN MODIFY ANY OTHER TOUR 
        tourController.uploadTourImages,
        tourController.resizeTourImages,
        tourController.updateTour
    )
    .delete(
        authController.protect,  // only logged In
        authController.restrictTo('admin', 'lead-guide'), // only admin and lead-guide can delete a tour
        tourController.deleteTour
    );



module.exports = router;