const express = require('express')
const ReviewController = require('../Controllers/ReviewController')
const Authenticate = require('../Controllers/AuhenticationController')
const ReviewRouter = express.Router({ mergeParams: true })
ReviewRouter.use(Authenticate.protect)

ReviewRouter.route('/')
    .post(Authenticate.restrictTo('user'), ReviewController.setTourUserIds, ReviewController.Review)
    .get(ReviewController.getReview)


ReviewRouter.route('/:id')
    .get(ReviewController.getOneReview)
    .delete(Authenticate.restrictTo('user', 'admin'), ReviewController.deleteReview)
    .patch(Authenticate.restrictTo('user', 'admin'), ReviewController.UpdateReview)
module.exports = ReviewRouter