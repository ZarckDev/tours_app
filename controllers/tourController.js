//Model
const Tour = require('../models/tourModel');
//Utils
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')

// Factory
const factory = require('./handlerFactory')

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
exports.getAllTours = factory.getAll(Tour)


exports.getTour = factory.getOne(Tour, { path: 'reviews' });

exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour); // passing the model
// exports.deleteTour = catchAsync(async(req, res, next) => {
//     const { id } = req.params;
//     const tour = await Tour.findByIdAndDelete(id);

//     if(!tour) {
//         const err = new AppError('No tour found with that ID', 404)
//         return next(err)
//     }

//     res.status(204).json({ // 204 No Content
//         status: 'success',
//         data: null // show the ressource we deleted is not enymore here
//     })
// })


exports.getTourStats = catchAsync(async(req, res, next) => {

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

})

// Get the amount of tours per month for a specific year
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1 ; // convert to Number

    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates' // separates the tour by startDates (on document for each date!)
        },
        {
            $match: {
                startDates: { // between the first day of the year and the last day
                    $gte: new Date(`${year}-01-01`),// mongo is perfect for working with dates
                    $lte: new Date(`${year}-12-31`) 
                }
            }
        },
        {
            // group what we want to show
            //https://docs.mongodb.com/manual/reference/operator/aggregation/
            $group: {
                _id:{ $month: '$startDates'}, //by Month ! Thanks to the $month aggregation operator, mongo extract the month from date!!
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' } // creates an array with name field
            }
        },
        {
            $addFields: { month: '$_id' } // add the month field
        },
        {
            //get rid of _id now
            $project: {
                _id: 0 // _id no longer shows up
            }
        },
        {
            $sort: { numTourStarts: -1 } //sort by the number of Tours (starting with the highest amount of tours)
        },
        {
            $limit: 12 // show only 6 documents ( not useful here, but example )
        }
    ])

    res.status(200).json({
        status: 'success',
        data: {
            plan
        }
    })
})


//router.route('/tours-within/:distance/center/:latlng/unit/:unit',....
// /tours-within/233/center/34.111745,-118.113491/unit/km
exports.getToursWithin = catchAsync(async(req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(','); // get separates values (destructuring)

    if(!distance || !unit){
        return next(new AppError('Please provide distance and unit', 400))
    }

    //to radiant - divided by the radius of the earth
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1; // else for "km"


    if(!lat || !lng){
        return next(new AppError('Please provide latitude and longitude in the format lat,lng', 400))
    }

    // to do geospacial queries, we need to add an index to startLocation
    const tours = await Tour.find({ 
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } 
    });

    console.log(distance, lat, lng, unit);
    
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours
        }
    })
})

exports.getDistances = catchAsync(async(req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(','); // get separates values (destructuring)

    if(!lat || !lng || !unit){
        return next(new AppError('Please provide the correct parameters', 400))
    }
    
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001 // same as /1000 for km (but we want in meter here)
    // 1m = 0.000621371 mil
    
    const distances = await Tour.aggregate([
        {
            // geoNear always need to be the first field, need a geospacial index (startLocation)
            $geoNear: { // error, not the first cause of pre(aggregate in tourModel
                near: {
                    type: 'Point',
                    coordinates: [lng *1, lat*1] //convert to number
                },
                distanceField: 'distance', // add the 'distance' field to tours
                distanceMultiplier: multiplier
            }
        },
        {
            $project: { // names that the fields we want to keep
                distance: 1,
                name:1
            }
        }
    ])



    res.status(200).json({
        status: 'success',
        data: {
            data: distances
        }
    })
    
})