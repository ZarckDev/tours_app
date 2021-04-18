
const express = require('express');
const morgan = require('morgan'); // Request Logger with details

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
    res.status(404).json({
        status: 'fail',
        message: `Page not Found -- Cannot find ${req.originalUrl}`
    })
})

// export our Express app
module.exports = app;