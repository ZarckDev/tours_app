
//Model
const { query } = require('express');
const Tour = require('../models/tourModel');


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
        //1a) FILTERING
        // by destructuring, if they are there, the will be set in corresponding variable and not taken under consideration after
        const { page, sort, limit, fields, ...queryObj } = req.query;

        //1b) ADVANCED FILTERING
        // /api/v1/tours?difficulty=easy&duration[gte]=5
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`) // match one of the gte, gt, lte, lt words -- "\b" to match the EXACT words, g for multiple times possible

        
        // need to be set in a query variable if we want to chain, because await will take consideration of the first return Promise
        let query = Tour.find(JSON.parse(queryStr)); // query ==> Query Object with all the methods related (see mongoose documentation under "Query")


         //2) SORTING
         // ex : /api/v1/tours?sort=price
         // ex 2 : /api/v1/tours?sort=-price   => descending order
        if(sort) {
            // ordering in case there is a tie -- same value
            // /api/v1/tours?sort=price,ratingsAverage
            // sort('price ratingsAverage') // add a second field
            const sortBy = sort.split(',').join(' '); // replace with space for mongoose

            query = query.sort(sortBy)
        } else { // user does not specify sort string
            query = query.sort('-createdAt') // sort anyway with last created first // !!!!!!! Cause problem in page & limit !!!!!!!! Because everything as the same time and date
        }


        //3) FIELD LIMITING
        // ex : /api/v1/tours?fields=name,duration,difficulty,price
        // ex 2 : /api/v1/tours?fields=-name,-duration  (everything excepts name and duration)
        if(fields) {
            const selectedFields = fields.split(',').join(' ');
            // wait for 'name duration ...'
            query = query.select(selectedFields)
        } else {
            // if we don't have the fields, just do not show the '__v' in the API.
            query = query.select('-__v'); // We take everything excepts "__v" field thanks to the "-"
        }


        //4) PAGINATION (when 1000 documents for example)
        // ex: /api/v1/tours?page=2&limit=10  ==> displaying page nb 2 with 10 documents max per page
        // in this case =>  1-10: page 1, 11-20: page 2, 21-30: page 3 .....
        const pageNb = page * 1 || 1; // convert to number || page 1 by default -- we by default limit, if one day we have 1000 documents...
        const limitSet = limit * 1 || 100; // 100 documents limit by page by default
        const skipValue = (pageNb - 1) * limitSet;
        // query = query.skip(10).limit(10); // skip amount of results that will be skiped
        query = query.skip(skipValue).limit(limitSet);


        if(page) {
            const numTours = await Tour.countDocuments(); // returns the number of document Promise
            if(skipValue >= numTours ) throw new Error('This page does not exist') // goes directly to the catch block
        }

        //ex : 5 best ratings & cheapest tour
        //  /api/v1/tours?limit=5&sort=-ratingsAverage,price


        // EXECUTE QUERY
        const tours = await query;


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

    // //otherwise
    // res.status(200).json({
    //     status: 'success',
    //     data:{
    //         tour: tour
    //     }
    // })

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