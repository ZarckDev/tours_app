const express = require('express');

//Controller
const viewsController = require('../controllers/viewsController')
const authController = require('../controllers/authController') // for test

const router = express.Router();

// Apply the chech login to all views (to show signup or not)
router.use(authController.isLoggedIn);

router.get('/', viewsController.getOverview)
router.get('/tour/:name', viewsController.getTour)

router.get('/login', viewsController.getLoginForm)




module.exports = router;