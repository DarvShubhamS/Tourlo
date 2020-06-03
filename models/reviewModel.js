const moongoose = require('mongoose');
const Tour = require('./tourModel')
const reviewSchema = new moongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review cannot be empty']
    },

    rating: {
        type: Number,
        min: 1,
        max: 5
    },

    createdAt: {
        type: Date,
        default: Date.now()

    },
    tour:
    {
        type: moongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Must Belong To Tour']
    }
    ,

    user:
    {
        type: moongoose.Schema.ObjectId,
        ref: 'User',
        require: [true, 'Must Belong To user']
    }





},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

reviewSchema.index({ tour: 1, user: 1 }, { unique: 1 })

reviewSchema.pre(/^find/, function (next) {
    // this.populate({
    //     path: 'tour',
    //     select: 'name'
    // }).populate({
    //     path: 'user',
    //     select: 'name photo'
    // })
    this.populate({
        path: 'user',
        select: 'name photo'
    })
    next()

})

reviewSchema.statics.calcAverageRatings = async function (tourId) {
    //this points to current model

    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },

        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }


    ])

    //console.log(stats)
    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingQuantity: stats[0].nRating,
            ratingAverage: stats[0].avgRating
        })

    }

    else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingQuantity: 0,
            ratingAverage: 0
        })
    }

}

reviewSchema.post('save', function () {
    //this points to curtrent review
    this.constructor.calcAverageRatings(this.tour)

})

reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.rvw = await this.findOne()
    //console.log(this.rvw)
    next()
})

reviewSchema.post(/^findOneAnd/, async function () {
    await this.rvw.constructor.calcAverageRatings(this.rvw.tour)
})
const Review = moongoose.model('Review', reviewSchema)

module.exports = Review