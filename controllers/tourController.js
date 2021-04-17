//Model
const Tour = require('../models/tourModel');
//Utils
const APIFeatures = require('../utils/apiFeatures')


// ROUTES HANDLERS SPECIFIC API REQUESTS
// Top 5 middleware
exports.aliasTopTours = (req, res, next) => {
    //limit=5&sort=-ratingsAverage,price
    //pre-filling the request query :
    req.query.limit = '5';
    req.query.sort='-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty'; // define some fields to show
    next();
}

 

// ROUTES HANDLERS
exports.getAllTours = async(req, res) => {
    try {  

        // EXECUTE QUERY
        const features = new APIFeatures(Tour.find(), req.query) // Tour.find() to give a Query, important for operations inside methods !
        features.filter().sort().limitFields().paginate(); // we manipulate the query if there are any specific query
        const tours = await features.query;


        res.status(200).json({
            status: 'success',
            results: tours.length, // because we send an array
            data:{
                tours
            }
        })
    } catch(err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}

exports.getTour = async(req, res) => { 
    const { id } = req.params;
    try{
        const tour = await Tour.findById(id);
        // Tour.findOne({ _id: req.params.id })

        res.status(200).json({
            status: 'success',
            data:{
                tour
            }
        })
    } catch(err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }

}

exports.createTour = async(req, res) => {
    try {
        //const NewTour = new Tour({})
        // await newTour.save()
        const newTour = await Tour.create({...req.body});
        
        res.status(201).json({// created
            status: 'success',
            data: {
                tour: newTour
            }
        }); 
    } catch(err) {
        res.status(400).json({
            status: 'fail',
            message: err
        })
    }
}

exports.updateTour = async(req, res) => {
    const { id } = req.params;
    try{
        const tour = await Tour.findByIdAndUpdate(id, {...req.body}, {
            new: true, // return the new document into "tour"
            runValidators: true // on update we check the Schema, default is false
        });
        // Tour.findOne({ _id: req.params.id })

        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        })
    } catch(err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}

exports.deleteTour = async(req, res) => {
    const { id } = req.params;
    try{
        await Tour.findByIdAndDelete(id);

        res.status(204).json({ // 204 No Content
            status: 'success',
            data: null // show the ressource we deleted is not enymore here
        })
    } catch(err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }  
}