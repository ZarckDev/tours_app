const mongoose = require('mongoose')

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true
    },
    rating: {
        type: Number,
        default: 4.5
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    }
});
const Tour = mongoose.model('Tour', tourSchema)


module.exports = Tour;


//// testTour.save().then(doc => { // save() returns a Promise
//     console.log(doc);
// }).catch(err => console.log('💥 Error saving the document'));