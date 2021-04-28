const express = require ('express')

const bookingController = require('../controllers/bookingController')
const authController = require('../controllers/authController');


const router = express.Router({ mergeParams: true }); // get the params from URL defined previously (in tourRoutes for :tourId access or for userId) 

// protect all following routes
router.use(authController.protect)

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession)


// Admin or lead-guide only
router.use(authController.restrictTo('admin', 'lead-guide'));


//  api/v1/tours/:tourId/bookings
// OR api/v1/bookings

router.route('/')
    .get(bookingController.getAllBookings)
    .post(
        bookingController.setTourUserIds,
        bookingController.createBooking)

router.route('/:id')
    .get(bookingController.getBooking)
    .patch(bookingController.updateBooking)
    .delete(bookingController.deleteBooking)

module.exports = router