
//Model
const Tour = require('../models/tourModel');




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
        // results: toursData.length, // because we send an array
        // data:{
        //     tours: toursData
        // }
    })
}

exports.getTour = (req, res) => { // :y?   -> ? for optional param
    const id = req.params.id * 1;// convert to Number

    // const tour = toursData.find(el => el.id === id)

    // //otherwise
    // res.status(200).json({
    //     status: 'success',
    //     data:{
    //         tour: tour
    //     }
    // })

}

exports.createTour = (req, res) => {
    res.status(201).json({// created
        status: 'success',
        // data: {
        //     tour: newTour
        // }
    }); 
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