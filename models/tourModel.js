const mongoose = require('mongoose')
const slugigy = require('slugify')
const validator = require('validator')
const User = require('./UserModel')
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxlength: [40, 'A tour name must have less or equal and 40 char'],
        minlength: [10, 'must have more than 10'],
        // validate: [validator.isAlpha, 'tour must only contain char']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour Must have duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'Must have Max Group']
    },
    difficulty: {
        type: String,
        required: [true, 'Must have Difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Diff is either easy medium or difficult'
        }
    },
    ratingAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1'],
        max: [5, 'Rating must be below 5'],
        set: val => Math.round(val * 10) / 10
    },
    ratingQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A Price Must have a name']
    },
    discount: {
        type: Number,
        validate: {

            validator: function (val) {

                return val < this.price
            },
            message: 'DISCOUNT {{VALUE}} MUST BE LESS THAN PRICE'
        }

    },

    summary: {
        type: String,
        trim: true,
        required: [true, 'Must have summary']

    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'tour must have required image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },

    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],

    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'


        }
    ]

}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// tourSchema.index({ price: 1 })
tourSchema.index({ price: 1, ratingAverage: -1 })
tourSchema.index({ slug: 1 })
tourSchema.index({ startLocation: '2dsphere' })



tourSchema.virtual('duration-weeks').get(function () {
    return this.duration / 7;
})
//virtual populate
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
})
//document middleware runs before save command and .create
tourSchema.pre('save', function (next) {
    // console.log(this)
    this.slug = slugigy(this.name, { lower: true });
    next();
})

// tourSchema.pre('save', async function (next) {
//     const guidesPromises = this.guides.map(async id => await User.findById(id))

//     this.guides = await Promise.all(guidesPromises)
//     next()
// })

tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v'

    })
    next()
})
tourSchema.post('save', function (doc, next) {
    console.log(doc)

    next();
})

//query middlware
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } })
    next();
})

//aggre middleware
// tourSchema.pre('aggregate', function (next) {
//     this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//     console.log(this.pipeline());

//     next();
// })

const Tour = mongoose.model('Tour', tourSchema);


module.exports = Tour;