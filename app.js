
const express = require('express');
const path = require('path')
const morgan = require('morgan'); // Request Logger with details

//Security
const rateLimit = require('express-rate-limit')
//HELMET HTTP header security
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser')
const compression = require('compression')
// const methodOverride = require('method-override'); // for PATCH/PUT/DELETE request that doesnt exists in HTML

const AppError = require('./utils/appError');

const globalErrorHandler = require('./controllers/errorController')

const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const bookingRouter = require('./routes/bookingRoutes')
const viewRouter = require('./routes/viewRoutes')

const app = express();


app.set('view engine', 'pug'); // set pug as template
app.set('views', path.join(__dirname, 'views'))

// Define the route for the Public folder to be accessible (for files in /public requests)
// app.use(express.static(`${__dirname}/public`))
app.use(express.static(path.join(__dirname, 'public')))

// GLOBAL MIDDLEWARES - for all the routes

// Devepment logging
//console.log(process.env.NODE_ENV)
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

//Use helmet to protect HTTP Header
app.use(helmet());// issue with contentSecurityPolicy() which is set by default

// Further HELMET configuration for Security Policy (CSP)
const scriptSrcUrls = [
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://cdnjs.cloudflare.com/",
    "https://js.stripe.com"
];
const styleSrcUrls = [
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
    "https://api.stripe.com"
];
const fontSrcUrls = [
    'fonts.googleapis.com',
    'fonts.gstatic.com'
];
const frameSrcUrls = [
    'https://js.stripe.com',
    'https://hooks.stripe.com'
];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            frameSrc: ["self", ...frameSrcUrls],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

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
app.use(cookieParser())// parse data from cookies, for login token in particular
//Setting Express to parse body for HTML post request (if not, empty body...)
app.use(express.urlencoded({extended: true, limit: '10kb'})); // for account example form post

//Setting for method override
// app.use(methodOverride('_method'));

// Clean the data (using sanitization) again NoSQL query injection
app.use(mongoSanitize())

// Data sanitization against XSS
app.use(xss())
// TODO (MAYBE) with sanitize-html package instead of xss-clean package like Jonas (4 years old...)

// Prevent parameter pollution (clean the query string in the url, using the last one if repetition)
app.use(hpp({ // whitelist some parameters
    whitelist: [
        'duration', // we can ask for multiple duration ?duration=5&duration=9
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
}))

// compression
app.use(compression()); // compress all text sent to the client


// Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString(); // if we want the time for every request
    // console.log(req.headers);
    // console.log(req.cookies);
    next();
})


// ROUTES - middlewares for specific routes
app.use('/', viewRouter);
//API
app.use('/api/v1/tours', tourRouter) // for this specific route - MOUNTING the router
app.use('/api/v1/users', userRouter) // for this specific route - MOUNTING the router
app.use('/api/v1/reviews', reviewRouter) // reviews in tours route
app.use('/api/v1/bookings', bookingRouter) // reviews in tours route


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