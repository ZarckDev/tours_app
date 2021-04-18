

module.exports = (err, req, res, next) => { // this 4 parameters, Express recognize it automatically as Error handling !!!
    console.log(err.stack); // show where the error happened

    const { statusCode = 500, status = 'error', message } = err; 
    // get the status code from err sent - 500 as default
    // status => error or fail from err
    // get the message from err

    res.status(statusCode).json({
        status,
        message 
    })

}