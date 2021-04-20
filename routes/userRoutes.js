const express = require('express');

const userController = require('../controllers/userController')
const authController = require('../controllers/authController')

const router = express.Router(); // It's a middleware


// ROUTES FOR AUTH
router.post('/signup', authController.signup)
router.post('/login', authController.login)

// ROUTES FOR FORGOT PASSWORD
router.post('/forgotPassword', authController.forgotPassword)
router.post('/resetPassword', authController.resetPassword)

// ROUTES
router.route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

router.route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);


module.exports = router;