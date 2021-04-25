const dotenv = require('dotenv');
const path = require('path')
// Define the env
dotenv.config({path: './config.env'});

const mongoose = require('mongoose')

//UNCAUGHT EXCEPTION - something that does not exists for eample -- should be on top of everything
process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...')
    console.log(err.name, err.message);
    // We need to crash the app, if not, unclean state
    process.exit(1);

})
// console.log(x) // test for uncaught exception


const app = require('./app')

const DB_URL = process.env.MONGODB_URL.replace('<password>', process.env.MONGODB_PWD);
mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(conn => console.log('DB connection successful'))
//TODO Add  catch - Unhandled Promise rejection if we don't manage error of MongoDB
// We could add catch() BUT better to generally manage the "Unhandled" rejection" as global event -- SEE BELOW ( maybe better to add catch alors)




// START SERVER
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    // console.log(`App running on port ${port}...`);
})

// SHOULD WE USE THE HANDLE BELOW ? OR MANAGING ERRORS AT THE RIGHT SPOTS

// HANDLE UNHANDLED REJECTION -- Example: bad authentification connection MongoDB
process.on('unhandledRejection', err => { // any Promise rejection is handled here
    console.log('UNHANDLED REJECTION! 💥 Shutting down...')
    console.log(err.name, err.message);
    // close safely the server
    server.close(() => { // finish all the request pending before exiting 
        process.exit(1); // shutdown anyway - 1 Uncaught exception (0 for success)
    })
})


//SIGTERM SIGNAL FROM HEROKU -- to cause a program to stop running from heroku -- we need to shutdown safely -- every 24h heroku shutdown the app.
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => { // still handle the pending requests if there are some
        console.log('💥 Process terminated!');
    })
})