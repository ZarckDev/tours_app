const express = require('express');

//Controller
const viewsController = require('../controllers/viewsController')

const router = express.Router();


router.get('/', viewsController.getOverview)

router.get('/tour/:name', viewsController.getTour)



module.exports = router;