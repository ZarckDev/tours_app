const express = require('express');

//Controller
const viewsController = require('../controllers/viewsController')
const authController = require('../controllers/authController') 
const bookingController = require('../controllers/bookingController')

const router = express.Router();

// authController.isLoggedIn --> Apply the chech login to all views (TO SHOW signup or not) -- FOR NON PROTECTED ROUTES


//createBookingCheckout temporary, it's in "/"   route because when we success a payment booking, we are redirected to the home route, it is at this point that we register the booking in the databse
router.get('/', authController.isLoggedIn, viewsController.getOverview)
router.get('/tour/:name', authController.isLoggedIn, viewsController.getTour)
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm)
router.get('/me', authController.protect, viewsController.getAccount)

router.get('/my-tours', authController.protect, viewsController.getMyTours)

// THIS FUNCTION IS FOR FORM SUBMITTED DIRECTLY FROM HTML -- EXAMPLE WHEN WE DON'T HAVE AN API
// router.patch('/submit-user-data', authController.protect, viewsController.updateUserData) -- with method-override
router.post('/submit-user-data', authController.protect, viewsController.updateUserData)




module.exports = router;