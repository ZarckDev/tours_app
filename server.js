const dotenv = require('dotenv');
// Define the env
dotenv.config({path: './config.env'});

const mongoose = require('mongoose')

const app = require('./app')


const DB_URL = process.env.MONGODB_URL.replace('<password>', process.env.MONGODB_PWD);
mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(conn => console.log('DB connection successful'))
//TODO Add  catch




// START SERVER
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
})

