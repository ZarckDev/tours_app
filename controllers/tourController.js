//Model
const Tour = require('../models/tourModel');
//Utils
const APIFeatures = require('../utils/apiFeatures')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')


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
exports.getAllTours = catchAsync(async(req, res, next) => {
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

})



exports.getTour = catchAsync(async(req, res, next) => {
    const { id } = req.params;
    const tour = await Tour.findById(id);

    if(!tour) {
        const err = new AppError('No tour found with that ID', 404)
        return next(err)
    }
    // otherwise
    res.status(200).json({
        status: 'success',
        data:{
            tour
        }
    })
})

exports.createTour = catchAsync(async(req, res, next) => {
    //const NewTour = new Tour({})
    // await newTour.save()
    const newTour = await Tour.create({...req.body});
    
    res.status(201).json({// created
        status: 'success',
        data: {
            tour: newTour
        }
    }); 
})

exports.updateTour = catchAsync(async(req, res, next) => {
    const { id } = req.params;

    const tour = await Tour.findByIdAndUpdate(id, {...req.body}, {
        new: true, // return the new document into "tour"
        runValidators: true // on update we check the Schema, default is false
    });

    if(!tour) {
        const err = new AppError('No tour found with that ID', 404)
        return next(err)
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    })

})

exports.deleteTour = catchAsync(async(req, res, next) => {
    const { id } = req.params;
    const tour = await Tour.findByIdAndDelete(id);

    if(!tour) {
        const err = new AppError('No tour found with that ID', 404)
        return next(err)
    }

    res.status(204).json({ // 204 No Content
        status: 'success',
        data: null // show the ressource we deleted is not enymore here
    })
})


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