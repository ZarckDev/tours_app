const fs = require('fs')


const toursData = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)) // everytime we save on post request , the server restarts, so we are able to read again this file as the program restarts


exports.checkID = (req, res, next, val) => {
    console.log(`Tour id is : ${val}`); // val holds the value of "id" parameter

    if(req.params.id * 1 > toursData.length){// It's ok because ids are numbers...
        return res.status(404).json({ // return to finish the middlewares journey, good!
            status: 'fail',
            message: 'Invalid ID'
        })
    }
    next();
}


exports.checkBody = (req, res, next) => {
    if(!req.body.name || !req.body.price){
        return res.status(400).json({
            status: 'fail',
            message: 'Missing name or price'
        })
    }
    next();
}


// ROUTES HANDLERS
exports.getAllTours = (req, res) => {
    // console.log(req.requestTime) // from middleware Time
    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        results: toursData.length, // because we send an array
        data:{
            tours: toursData
        }
    })
}

exports.getTour = (req, res) => { // :y?   -> ? for optional param
    const id = req.params.id * 1;// convert to Number

    const tour = toursData.find(el => el.id === id)

    //otherwise
    res.status(200).json({
        status: 'success',
        data:{
            tour: tour
        }
    })

}

exports.createTour = (req, res) => {
    // console.log(req.body);
    const newId = toursData[toursData.length-1].id + 1; // It's ok because ids are numbers...
    const newTour = {...req.body, id: newId};
    
    toursData.push(newTour);
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(toursData), err => {
        res.status(201).json({// created
            status: 'success',
            data: {
                tour: newTour
            }
        }); 
    })
}

exports.updateTour = (req, res) => {
    //not implemented 
    res.status(200).json({
        status: 'success',
        data: {
            tour: '<Updated tour here...>'
        }
    })
}

exports.deleteTour = (req, res) => {
    //not implemented 
    res.status(204).json({ // 204 No Content
        status: 'success',
        data: null // show the ressource we deleted is not enymore here
    })
}