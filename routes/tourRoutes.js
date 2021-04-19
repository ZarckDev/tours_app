const express = require ('express')

const tourController = require('../controllers/tourController')
const authController = require('../controllers/authController');

const router = express.Router(); // It's a middleware that is executed before the .get() and others

// Param Middleware function -- ONLY FOR THIS ROUTER
// router.param('id', (req, res, next, val) => {
//     console.log(`Tour id is : ${val}`); // val holds the value of "id" parameter
//     next();
// })
// router.param('id', tourController.checkID); // middleware to check the ID for /:id routes


// ROUTES FOR SPECIFIC API REQUESTS
// run a middleware before getting the tours, in order to define the query in request
router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours)


// ROUTES FOR PIPELINE
router.route('/tour-stats').get(tourController.getTourStats)
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan)

// ROUTES
router.route('/')
    .get(authController.protect, tourController.getAllTours) // make sure we are authenticated to see this route
    .post(tourController.createTour)

router.route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)//patch to only update a property
    .delete(tourController.deleteTour);

module.exports = router;