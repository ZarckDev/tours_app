const mongoose = require('mongoose');
const slugify = require('slugify')

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true
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
        required: [true, 'A tour must have a difficulty']
    },
    ratingsAverage: {
        type: Number,
        default: 4.5
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: Number,
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
    }
}, {
    toJSON: { virtuals: true }, // virtuals to be part when outputing as JSON
    toObject: { virtuals: true }, // virtuals to be part when outputing as Object
    id: false // remove the additional id created with pre() and post()
});


//Virtual Properties -> not stored in Database
tourSchema.virtual('durationWeeks').get(function () {// get because will be created each time we get data from the database
    // regular function because we need the "this" keyword
    return this.duration / 7; // duration in weeks instead of days
}) // we cannot use virtuals in a Query ! Because they are not part of the Database


// DOCUMENTS Middleware -- allow us to do something before or after an operation on document
tourSchema.pre('save', function(next) {// run BEFORE an event on this model (here, before 'save()' and 'create()' in DB)
    // console.log(this); // this points to the current processed document
    this.slug = slugify(this.name, {lower:true})//new property
    next();
}) 

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

tourSchema.post(/^find/, function(docs, next) { // docs -- all documents returned by the query
    console.log(`Query took ${Date.now()-this.start} milliseconds!`);
    
    // console.log(docs);
    next();
})


// AGGREGATION middleware -- before or after an aggregation happens
tourSchema.pre('aggregate', function(next) {
    // exclude the secret tours from this aggregation!
    this.pipeline().unshift({ $match: { secretTour: { $ne: true }}}) //add at the beggining of an array
    console.log(this.pipeline());
    // this points to the current aggregation object
    next();
})


const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour;
