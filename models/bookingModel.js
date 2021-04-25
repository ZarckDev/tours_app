const mongoose = require('mongoose')

const bookingSchema = mongoose.Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Booking must belong to a tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Booking must belong to a user']
    },
    price: { // because may changed in the futur, so we don't take the one from tour
        type: Number,
        required:[true, 'Booking must have a price']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    paid: { // for paid in place, instead of online
        type: Boolean,
        default: true
    }
})

// populate tour and user automatically when there is a query
bookingSchema.pre(/^find/, function (next){
    this.populate('user').populate({path: 'tour', select: 'name'})
    next();
})


const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;