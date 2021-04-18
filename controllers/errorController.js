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


const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack
    })
}

const sendErrorProd = (err, res) => {
    // operational, trusted error: send message to Client
    if(err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
    } else { // Programming or other unknown error, don't leak error details to the client
        // 1) Log the error to the console
        console.error('ERROR💥 ', err);
        // 2) Send a generic message
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong'
        }); 
    }
    
}


module.exports = (err, req, res, next) => { // this 4 parameters, Express recognize it automatically as Error handling !!!
    err.statusCode = err.statusCode || 500;// get the status code from err sent - 500 as default
    err.status = err.status || 'error'; // status => error or fail from err

    
    if(process.env.NODE_ENV === 'development'){ // errors with details
        sendErrorDev(err, res);
    } else { // production
    // else if(process.env.NODE_ENV === 'production'){  // WEIRD BEHAVIOUR ON WINDOWS
        // nice errors in production
        let error = {...err};

        // Operational errors
        if(err.name === 'CastError') error = handleCastErrorDB(err); // -- wrong id format example
        if(err.code === 11000) error = handleDuplicateFieldsDB(err); // 11000 is MongoDB error code  -- Tour name duplication example
        if(err.name === 'ValidationError')  error = handleValidationErrorDB(err);// Mongoose validation Error
        
        // Operational and non operational (default) errors send
        sendErrorProd(error, res);
    }
}