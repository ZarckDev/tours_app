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
    slug: String // for our pre
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


//Middleware on Documents -- allow us to do something before or after an operation on document
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

const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour;
