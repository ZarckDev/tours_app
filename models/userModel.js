const mongoose = require('mongoose');
const validator = require('validator'); // very useful library for STRING validation
const argon2 = require('argon2');
const crypto = require('crypto');


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
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'], // different kind of users
        default: 'user' // user by default
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
    },
    passwordChangedAt: Date, // last time password changed
    passwordResetToken: String,
    passwordResetExpires: Date
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

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    // this always points to the current document here
    if(this.passwordChangedAt){ // if there is a history of password changes
        //convert passwordChangedAt to milliseconds, convert to second (/1000) in order to compare with JWT iat , base 10
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

        return JWTTimestamp < changedTimestamp; // if we changed the password after the token was issued, return (true); Otherwise the token is still valid (false)
    }
    
    // False means NEVER changed
    return false;
}

userSchema.methods.createPasswordResetToken = function() {
    // Does not need to be as Cryptographic strong as the login token
    // So we can use the crypto built-in module
    const resetToken = crypto.randomBytes(32).toString('hex')
    // Do not store the plain token in database, hash it (no need for Argon2 for this temp password)
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    console.log({resetToken}, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 min

    return resetToken; // we don't send the encrypted one to the user, because it does not make any sense to send encrypted from DB -- encrypted is only for DataBase if someone acces the database!
}

const User = mongoose.model('User', userSchema);

module.exports = User;