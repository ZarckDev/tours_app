const mongoose = require('mongoose');
const validator = require('validator'); // very useful library for STRING validation


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A name should be mentioned']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: {
        type: String
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password']
    }
})
const User = mongoose.model('User', userSchema);

module.exports = User;