

// The Error that we should use in all error handling
class AppError extends Error {
    constructor(message, statusCode){
        super(message); // parent constructor with built-in 'message'

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; // statusCode as a String starts with 4 or not
        this.isOperational = true; // be able to test if programming error or not

        Error.captureStackTrace(this, this.constructor) // where the error happened
    }
}

module.exports = AppError;