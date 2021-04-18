
const express = require('express');
const morgan = require('morgan'); // Request Logger with details

const AppError = require('./utils/appError');

const globalErrorHandler = require('./controllers/errorController')

const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')

const app = express();


// MIDDLEWARES - for all the routes
console.log(process.env.NODE_ENV)
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

app.use(express.json());

// Define the route for the Public folder to be accessible
app.use(express.static(`${__dirname}/public`))

// middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString(); // if we want the time for every request
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