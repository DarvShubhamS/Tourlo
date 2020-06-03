const crypto = require('crypto')
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'please tell your name']
    },

    email: {
        type: String,
        required: [true, 'please tell your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please Provide a valid email']
    },
    photo: {

        type: String,
        default: 'default.jpg'


    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-tourguide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'You shoudl add password'],
        minlength: [8, 'password must have 8 char'],
        select: false
    },

    confirmpass: {
        type: String,
        required: [true, 'please confirm your password'],
        //only works on save
        validate: {
            validator: function (el) {
                return el === this.password
            },
            message: "Password not the Same"
        }

    },

    passwordChanged: Date,
    passwordrestToken: String,
    passwordresetExpires: Date,
    active: {


        type: Boolean,
        default: true,
        select: false
    }





})
//getting data and save
UserSchema.pre('save', async function (next) {

    //only run if pass modify
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12)

    this.confirmpass = undefined;

    next()

})

UserSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();
    this.passwordChanged = Date.now() - 1000
    next()
})

UserSchema.pre(/^find/, function (next) {
    //this points to current query
    this.find({ active: { $ne: false } })
    next();

})


UserSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword)
}



UserSchema.methods.changedPasswordafter = function (JWTTimestamp) {
    if (this.passwordChanged) {
        const changedTimestamp = parseInt(this.passwordChanged.getTime() / 1000, 10)

        //console.log(changedTimestamp, JWTTimestamp)
        return JWTTimestamp < changedTimestamp
    }
    //false means not changed
    return false
}

UserSchema.methods.createPasswordRestToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex')
    //enctypting and storing the reset token
    this.passwordrestToken =
        crypto.createHash('sha256').update(resetToken).digest('hex')

    //console.log({ resetToken }, this.passwordrestToken)
    this.passwordresetExpires = Date.now() + 10 * 60 * 1000

    return resetToken

}







const User = mongoose.model('User', UserSchema)

module.exports = User