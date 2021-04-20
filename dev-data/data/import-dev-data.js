const dotenv = require('dotenv');
// Define the env
dotenv.config({path: './config.env'});

const mongoose = require('mongoose')
const fs = require('fs');
const Tour = require('../../models/tourModel');



const DB_URL = process.env.MONGODB_URL.replace('<password>', process.env.MONGODB_PWD);
mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(conn => console.log('DB connection successful'))


// READ JSON File
// const tours = fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8');
const tours = fs.readFileSync(`${__dirname}/tours.json`, 'utf-8');
//CONVERT TO JAVASCRIPT OBJECT
const toursObj = JSON.parse(tours)

// IMPORT DATA INTO DB
const importData = async() => {
    try{
        await Tour.create(toursObj) // creat accepts an array, perfect
        console.log('Data successfully loaded!');
    }catch(err){
        console.log(err);
    }
    process.exit(); // aggressive way of closing
}

// DELETE ALL DATA FROM COLLECTION
const deleteData = async() => {
    try{
        await Tour.deleteMany()
        console.log('Data successfully deleted!');
    }catch(err){
        console.log(err);
    }
    process.exit(); // aggressive way of closing
}

if(process.argv[2] === '--import'){
    importData();
} else if(process.argv[2] === "--delete"){
    deleteData();
}


// console.log(process.argv);

// node ./dev-data/data/import-dev-data.js --import
// node ./dev-data/data/import-dev-data.js --delete