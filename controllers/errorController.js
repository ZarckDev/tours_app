const { collection } = require('../models/tourModel');
const AppError = require('../utils/appError');


const handleCastErrorDB = err => {
    // handle value set in the wrong format
    const message = `Invalid ${err.path}: ${err.value}`
    return new AppError(message, 400); // Bad request
}

const handleDuplicateFieldsDB = err => {
    const value = Object.values(err.keyValue)[0];
    const message = `Duplicate field value: ${value}. Use another value.`;
    return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
    // array of all error messages for now
    // Object.values are the objects inside err.errors ==> return only the message
    const errors = Object.values(err.errors).map(el => el.message)

    const message = `Invalid input data: ${errors.join('. ')}`; // separate by ". " the messages
    return new AppError(message, 400);
}

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401)

const handleJWTExpired = () => new AppError('Your token has expired! Please log in again.', 401)


const sendErrorDev = (err, req, res) => {

    if(req.originalUrl.startsWith('/api')){ // if error on our API
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            error: err,
            stack: err.stack
        })
    } 
    // Otherwise
    // on rendering
    console.error('ERROR💥 ', err);
    res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message
    })
    
}

const sendErrorProd = (err, req, res) => {

    //FOR THE API
    if(req.originalUrl.startsWith('/api')){
        // operational, trusted error: send message to Client
        if(err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            })
        } 
        //otherwise
        // Programming or other unknown error, don't leak error details to the client
        // 1) Log the error to the console
        console.error('ERROR💥 ', err);
        // 2) Send a generic message
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong'
        }); 
        
    } 
    // Otherwise
    // FOR PRODUCTION RENDERING WEBSITE
    if(err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message
        })
    } 
    //otherwise
    // Programming or other unknown error, don't leak error details to the client
    // 1) Log the error to the console
    console.error('ERROR💥 ', err);
    // 2) Send a generic message
    res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: 'Please try again later'
    })

}


module.exports = (err, req, res, next) => { // this 4 parameters, Express recognize it automatically as Error handling !!!
    err.statusCode = err.statusCode || 500;// get the status code from err sent - 500 as default
    err.status = err.status || 'error'; // status => error or fail from err

    
    if(process.env.NODE_ENV === 'development'){ // errors with details
        sendErrorDev(err, req, res);
    } else { // production
    // else if(process.env.NODE_ENV === 'production'){  // WEIRD BEHAVIOUR ON WINDOWS
        // nice errors in production
        let error = {...err}; 
        error.message = err.message; // need this for Production

        // Operational errors -- only in PRODUCTION
        if(err.name === 'CastError') error = handleCastErrorDB(err); // -- wrong id format example
        if(err.code === 11000) error = handleDuplicateFieldsDB(err); // 11000 is MongoDB error code  -- Tour name duplication example
        if(err.name === 'ValidationError')  error = handleValidationErrorDB(err);// Mongoose validation Error
        if(err.name === 'JsonWebTokenError') error = handleJWTError(); // Token error in verify when accessing a protected route for example
        if(err.name === 'TokenExpiredError') error = handleJWTExpired(); // When the token of the user expired, and try to access a protected route with this old token
        
        // Operational and non operational (default) errors send
        sendErrorProd(error, req, res);
    }
}