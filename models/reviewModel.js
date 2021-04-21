const mongoose = require('mongoose');


const reviewSchema = new mongoose.Schema({
    review: {
        type:String,
        required: [true, 'Review cannot be empty']
    },
    rating: {
        type: Number,
        //validators for Number (work for dates too)
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: { // only ref to parent -- in order to not fullfill a tour array of review
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tour', // ref Tour Model
        required: [true, 'Review must belong to a tour']
    },
    user: { // only ref to parent -- in order to not fullfill a user array of review
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // ref User Model (see user.js)
        required: [true, 'Review must belong to a user']
    }
},{ // options for virtuals (not store in database, but we want to show up)
    toJSON: { virtuals: true }, // virtuals to be part when outputing as JSON
    toObject: { virtuals: true }, // virtuals to be part when outputing as Object
})


// Query middleware
reviewSchema.pre(/^find/, function(next) {
    // we can specify what we want to populate
    // this.populate({ 
    //     path: 'tour',
    //     select: '-guides name' // only name
    // }).populate({ //for users
    //     path: 'user',
    //     select: 'name photo' // only name and photo
    // });

    this.populate({ // only user after all because we don't want a chain of populate
        path: 'user',
        select: 'name photo' // only name and photo
    });

    next()
})


const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;