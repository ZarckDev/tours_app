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


exports.getTourStats = async(req, res) => {
    try{
        // agreggate with all the stages (see MongoDB documentation for aggregation Pipeline)
        const stats = await Tour.aggregate([
            {
                $match: { ratingsAverage: { $gte: 4.5 }} // give all tours with rating > 4.5
            },
            {
                $group: {
                    _id: { $toUpper: '$difficulty'}, //  id for a single stat group -- we can group by this ex: _id: '$difficulty' ==> will group stats by difficulty
                    // _id: null, // null if we want for all the tours
                    // _id: '$ratingsAverage',
                    numTours: { $sum: 1 }, // sum 1 at each aggregation (going through the documents)
                    numRatings: { $sum: '$ratingsQuantity'},
                    avgRating: { $avg: '$ratingsAverage'},
                    avgPrice: { $avg: '$price'},
                    minPrice: { $min : '$price'},
                    maxPrice: { $max : '$price'}
                }
            },
            {
                $sort: { avgPrice : 1} // 1 ---> ascending
            },
            // {
            //     $match: { _id: { $ne: 'EASY'}} // define above
            // }
        ])// here we are getting Tours that are ratings greater than 4.5, grouping some statistics by difficulty, ordering by lowerPrice to HighestPrice, and excluding the EASY group from result -- EXAMPLE

        res.status(200).json({
            status: 'success',
            data: {
                stats
            }
        })
    } catch(err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}