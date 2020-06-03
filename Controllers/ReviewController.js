const Review = require('../models/reviewModel')
const CatchAsync = require('../Utils/catchAsync')
const Apperror = require('../Utils/appError')
const factory = require('./handlerFactory')

exports.setTourUserIds = (req, res, next) => {
    //Allow nested route
    if (!req.body.tour) req.body.tour = req.params.tourId
    //get user id from protect middleware
    if (!req.body.user) req.body.user = req.user.id

    next()
}

exports.Review = factory.createOne(Review)

exports.getReview = factory.getAll(Review)
exports.getOneReview = factory.getOne(Review)
exports.deleteReview = factory.deleteOne(Review)
exports.UpdateReview = factory.updateOne(Review)
