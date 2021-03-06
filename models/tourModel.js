const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator'); // very useful library for STRING validation

// const User = require('./userModel')

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        //validators for strings
        maxlength: [40, 'A tour name must have less or equal than 40 characters'],
        minlength: [10, 'A tour name must have more or equal than 10 characters'],
        // plugin the validator library for isAlpha (only letters in name)
        // not very useful in this case
        // validate: { 
        //     validator: function(value) {
        //         //from validator library
        //         return validator.isAlpha(value.split(' ').join('')); // error on spaces
        //     },
        //     message: 'Tour name must only contain characters.'
        //   }
    },
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type:Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        //validator (for string)
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium, or difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        //validators for Number (work for dates too)
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        set: val => val.toFixed(1) // toFixed gives a string, but Mongoose seems to convert to Double
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: {
        type: Number,
        //custom validator -- regular function, we need the "this"
        validate : {
            validator: function(val) {
                // !!!!!!!!! NOT WORKING ON UPDATE !!!!!!!!! ONLY ON NEW
                return val < this.price; // chech if discount is lower than the original price
            },
            message: 'Discount price ({VALUE}) should be below regular price' // thanks to Mongo, we can insert the VALUE
        }
    },
    summary: {
        type:String,
        trim: true, // for string only -- remove white spaces at the beginning and the end
        required: [true, 'A tour must have a description']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(), // Mongo converts automatically to string date
        select: false // when we try to select (in fields limiting), we just hide createdAt
    },
    startDates: [Date],
    slug: String, // for our pre() document middleware
    secretTour: { // for Query middleware
        type: Boolean,
        default: false
    },
    startLocation: { // embedded object
        // GeoJSON for geospatial data
        type: { // subfields
            type: String,
            default: 'Point',
            enum: ['Point'] // one option only
        },
        coordinates: [Number], // longitude first, latitude after in GeoJSON
        address: String,
        description: String
    },
    locations: [ // we could remove the startLocation and set the first location on Day 0
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point'] // one option only
            },
            coordinates: [Number], // longitude first, latitude after in GeoJSON
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User' // ref User Model (see user.js)
        }
    ]
}, {
    toJSON: { virtuals: true }, // virtuals to be part when outputing as JSON
    toObject: { virtuals: true }, // virtuals to be part when outputing as Object
    id: false // remove the additional id created with pre() and post()
});

//for a query specific selector (for example ?price[lt]=1000)
// before we had to go though all the documents
// Use indexes to define price as the order index, this way, we only go through the lowest price first, we get directly the ones needed -- it will be the most requested request by user
// tourSchema.index({price: 1}) // sorting the price index ascending -- single index

// By default when getting all tours -- by default indexes by id
// Index by price < 1000 AND averageRating > 4.7 -- COMPOUND INDEXES
tourSchema.index({price: 1, ratingsAverage: -1}); // price low to high, ratings best to lower
//cost of index is IMPORTANT - BE CAREFUL
// we could use slugy to query a tour
tourSchema.index({ slug: 1 });
// for GeoSpacial query
tourSchema.index({ startLocation: '2dsphere' }); // startLocation should be index as 2dsphere -- accesible on a map

//Index : It's to provide a reasonable level of performance. Without an index, MongoDB has to scan every single document in the collection and perform the calculations to see if it matches the query.


//Virtual Properties -> not stored in Database
tourSchema.virtual('durationWeeks').get(function () {// get because will be created each time we get data from the database
    // regular function because we need the "this" keyword
    return this.duration / 7; // duration in weeks instead of days
}) // we cannot use virtuals in a Query ! Because they are not part of the Database


// Virtual populate (new field reviews in tour) -- EXAMPLE
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',// name of the field in the other model (field tour in reviewSchema)
    localField: '_id' // _id from here (the tourSchema), it is how it is called in "tour" property in reviewSchema , it's the BIND between the two Schema (connection)
})


// DOCUMENTS Middleware -- allow us to do something before or after an operation on document
tourSchema.pre('save', function(next) {// run BEFORE an event on this model (here, before 'save()' and 'create()' in DB) !!!!!!!!! NOT ON UPDATE !!!!!!!!!
    // console.log(this); // this points to the current processed document
    this.slug = slugify(this.name, {lower:true})//new property
    next();
}) 

// tourSchema.pre('save', async function(next) { // Embedding on save (populate) based on the id
//     const guidesPromises = this.guides.map(async id => await User.findById(id)) // guides Promises is an array full of promises
//     //get the result of all promises
//     this.guides = await Promise.all(guidesPromises);

//     next();
// })

// tourSchema.pre('save', function(next) { // we can have multiple pre() for a same "Hook"
//     console.log('Will save document...');
//     next();
// })

// tourSchema.post('save', function(doc, next) {
//     // we have the finished document here
//     console.log(doc);
//     next(); // not really needed but good practice
// })


// QUERY Middleware
// here before any find() -- before executing "const tours = await features.query;" in tour Controler.js
tourSchema.pre(/^find/, function(next) { // all methods that starts with find (findById, findOne...)
// tourSchema.pre('find', function(next) { // query middleware, this points to the query now, not the document
    //secret tours
    this.find({ secretTour: { $ne: true }}) // this is a query object here
    // we don't show the secret tours here
    this.start = Date.now(); // query is a regular object, so we can add properties
    next();
})

// tourSchema.post(/^find/, function(docs, next) { // docs -- all documents returned by the query
//     // console.log(`Query took ${Date.now()-this.start} milliseconds!`);
    
//     // console.log(docs);
//     next();
// })

tourSchema.pre(/^find/, function(next) {
    // we can specify what we want to populate
    this.populate({ // everything will populate the guides
        path: 'guides',
        select: '-__v -passwordChangedAt -passwordResetExpires -passwordResetToken' // remove the "__v" and "passwordChangedAt" from results
    });// Populate can slow down our application (it creates new query), think before use it, good for small application

    next()
})


// AGGREGATION middleware -- before or after an aggregation happens
tourSchema.pre('aggregate', function(next) {
    const firstQuery = Object.keys(this.pipeline()[0]);
    // be sure if we have geoNear, that this is the first one !!!
    if (firstQuery[0] !== '$geoNear') {
        // exclude the secret tours from this aggregation!
        this.pipeline().unshift({ $match: { secretTour: { $ne: true }}}) //add at the beggining of an array
        // this points to the current aggregation object
    } else {
        this.pipeline().splice(1, 0, { $match: { secretTour: { $ne: true } } });
    }
    // console.log(this.pipeline());
    next();
})



const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour;
