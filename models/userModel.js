const mongoose = require('mongoose');
const validator = require('validator'); // very useful library for STRING validation
const argon2 = require('argon2');


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
        minlength: 8,
        select: false // no show in any output on find
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function(el){
                //return true or false
                return el === this.password; // only works on save() or create() !!!!!!!!!!!!!
                // for this reason, even when we will update, we will use save()
            },
            message: 'Passwords are not the same!'
        }
    }
})

// pre save document middleware for password
userSchema.pre('save', async function(next) {
    // only when password changes (not email or name or whatever)
    if(!this.isModified('password')) return next(); // check the password field change or not

    try{
        const hash = await argon2.hash(this.password); // JONAS USE BCRYPT, BUT NOT RECOMMENDED FOR NEWLY DESIGN -- SALT ??
        this.password = hash;

        this.passwordConfirm = undefined; // delete paswordConfirm -- Maybe use virtuals for password Confirm as we never use it from Database !! ==> Should do that
        next();
    } catch(e) {
        console.log('Error hashing the password')
    }

})


//Instance method -- available on all document of user model
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await argon2.verify(userPassword, candidatePassword)
}

const User = mongoose.model('User', userSchema);

module.exports = User;