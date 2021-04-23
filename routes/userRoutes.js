const express = require('express');


const userController = require('../controllers/userController')
const authController = require('../controllers/authController')



const router = express.Router(); // It's a middleware

// ROUTES FOR AUTH
router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.get('/logout', authController.logout)

// ROUTES FOR FORGOT PASSWORD
router.post('/forgotPassword', authController.forgotPassword)
router.patch('/resetPassword/:token&:email', authController.resetPassword) // we pass the reset password token to identify the user


// WHEN LOGGED IN -- user is in req thanks to protect

// Protect ALL ROUTES AFTER THIS MIDDLEWARE -- need to be logged In
router.use(authController.protect) 

//routes
router.patch('/updateMyPassword', authController.updatePassword) // protect ensure we are logged in and so put the user in the request object
router.get('/me', userController.getMe, userController.getUser)// protect set the req.user, getMe put the user as a param id to fake the getUser
router.patch('/updateMe', userController.uploadUserPhoto, userController.updateMe) // new  middleware will put the file in the req object
router.delete('/deleteMe', userController.deleteMe)


// Restrict all following routes to ADMIN
router.use(authController.restrictTo('admin'))

//routes
router.route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

router.route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);


module.exports = router;