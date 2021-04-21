const mongoose = require('mongoose');

const Tour = require('./tourModel');


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


reviewSchema.pre(/^find/, function(next) {
    // this.populate({
    //   path: 'tour',
    //   select: 'name'
    // }).populate({
    //   path: 'user',
    //   select: 'name photo'
    // });
  
    this.populate({
      path: 'user',
      select: 'name photo'
    });
    next();
  });
  

//difference between static and methods --> statics is on the Model itself, whil methods is for an INSTANCE of the Model, so on documents
reviewSchema.statics.calcAverageRatings = async function(tourId) {
    // this points to current model (so Review)
    const stats = await this.aggregate([ // same as in tourController
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour', // group by tour
                nRating: { $sum: 1 }, // sum +1 for each review of this tour
                avgRating: { $avg: '$rating'} // put average of "rating" in avgRating
            }
        }
    ]);
    console.log(stats); // it's an array

    // persist the statistics into the Tour
    if(stats.length > 0){
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity:stats[0].nRating,
            ratingsAverage:stats[0].avgRating
        })
    } else { // no reviews anymore
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity:0,
            ratingsAverage:4.5
        })
    }
}

// On CreateReview
// each time a new review is created - calculate stats for the corresponding tour
reviewSchema.post('save', function() {
    // this points to current review
    
    this.constructor.calcAverageRatings(this.tour) // constructor is the Model of this current document - because calcAverageRatings is a method of the Model
})


// On findByIdAndUpdate
// On findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function(next) { // query middleware for updating or deleting a review
    // we store in "this.r", it is a technique to pass the property to the post() query
    this.r = await this.findOne(); // get the review document -- at this point it's the previous state of this review, we are in pre() but we just need the tourId so don't care
    console.log(this.r);
    next();
})

// when the query is finished -- we can finally execute the calculation
reviewSchema.post(/^findOneAnd/, async function() { 
    // await this.findOne() does NOT work here because the query has already been executed, that's why we need a pre()
    // this.r.constructor represents the Model of the 'r' review from "pre()"
    await this.r.constructor.calcAverageRatings(this.r.tour) // thanks to findOne() of pre() query, we have acces to the tourId
})



const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;