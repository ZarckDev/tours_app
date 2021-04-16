const dotenv = require('dotenv');
// Define the env
dotenv.config({path: './config.env'});

const app = require('./app')

// Here is everything not related with Express

// console.log(app.get('env')) // "development" by default set by Express
// console.log(process.env) // by NodeJS




// START SERVER
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
})