const express = require ('express')

const tourController = require('../controllers/tourController')

const router = express.Router(); // It's a middleware that is executed before the .get() and others

// Param Middleware function -- ONLY FOR THIS ROUTER
// router.param('id', (req, res, next, val) => {
//     console.log(`Tour id is : ${val}`); // val holds the value of "id" parameter
//     next();
// })
// router.param('id', tourController.checkID); // middleware to check the ID for /:id routes


// ROUTES
router.route('/')
    .get(tourController.getAllTours)
    .post(tourController.createTour)

router.route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)//patch to only update a property
    .delete(tourController.deleteTour);

module.exports = router;