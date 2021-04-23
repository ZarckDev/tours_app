const express = require('express');

//Controller
const viewsController = require('../controllers/viewsController')
const authController = require('../controllers/authController') // for test

const router = express.Router();


router.get('/', viewsController.getOverview)
router.get('/tour/:name', authController.protect, viewsController.getTour)

router.get('/login', viewsController.getLoginForm)



module.exports = router;