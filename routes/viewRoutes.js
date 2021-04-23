const express = require('express');

//Controller
const viewsController = require('../controllers/viewsController')
const authController = require('../controllers/authController') // for test

const router = express.Router();

// authController.isLoggedIn --> Apply the chech login to all views (TO SHOW signup or not) -- FOR NON PROTECTED ROUTES

router.get('/', authController.isLoggedIn, viewsController.getOverview)
router.get('/tour/:name', authController.isLoggedIn, viewsController.getTour)
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm)
router.get('/me', authController.protect, viewsController.getAccount)

// THIS FUNCTION IS FOR FORM SUBMITTED DIRECTLY FROM HTML -- EXAMPLE WHEN WE DON'T HAVE AN API
// router.patch('/submit-user-data', authController.protect, viewsController.updateUserData) -- with method-override
router.post('/submit-user-data', authController.protect, viewsController.updateUserData)




module.exports = router;