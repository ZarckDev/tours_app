
const express = require('express');
const morgan = require('morgan'); // Request Logger with details

//Security
const rateLimit = require('express-rate-limit')
//HELMET HTTP header security
const helmet = require('helmet');

const AppError = require('./utils/appError');

const globalErrorHandler = require('./controllers/errorController')

const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')

const app = express();


// GLOBAL MIDDLEWARES - for all the routes

// Devepment logging
console.log(process.env.NODE_ENV)
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

//Use helmet to protect HTTP Header
app.use(helmet());// issue with contentSecurityPolicy() which is set by default

//limite the requests (if atttacks -- Brute force)
const limiter = rateLimit({
    max: 100, // 100 requests - to adapt to the application
    window: 60 * 60 * 1000, // per 1 hour
    message: 'Too many requests from this IP, please try again in an hour!'
})
app.use('/api', limiter) // all routes that starts with '/api'

// Body parser, reading data from body into req.body
app.use(express.json({ // options to limit the amount of data sent in the body for SECURITY
    limit: '10kb' // limit of 10k bytes
}));

// Define the route for the Public folder to be accessible
app.use(express.static(`${__dirname}/public`))

// Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString(); // if we want the time for every request
    // console.log(req.headers);
    
    next();
})


// ROUTES - middlewares for specific routes
app.use('/api/v1/tours', tourRouter) // for this specific route - MOUNTING the router
app.use('/api/v1/users', userRouter) // for this specific route - MOUNTING the router


// Unknown route middleware handler
// all for all the verbs(get, post, patch...)
app.all('*', (req, res, next) => {
    const err = new AppError(`Cannot find ${req.originalUrl} in this server!`, 404);
    next(err); // pass the err in next -- express will now that this is an error!
    // skip all the middleware to go directly to the Error handle
})


// Handle all errors in one place !
app.use(globalErrorHandler)

// export our Express app
module.exports = app;