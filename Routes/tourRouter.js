const express = require('express');

const tourController = require('../Controllers/tourController')
const auth = require('../Controllers/AuhenticationController')
const reviewRouter = require('../Routes/reviewRouter')
const Router = express.Router();

//post /tour / tour_id / review
//nested routing
// Router.route('/:tourId/reviews')
//     .post(auth.protect,
//         auth.restrictTo('user'),
//         reviewController.Review)

Router.use('/:tourId/reviews', reviewRouter)




// Router.param("id",tourController.checkId)
Router.route('/tour-stats').get(tourController.getTourStat)
Router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan)
Router
    .route('/top-cheap')
    .get(auth.protect,
        auth.restrictTo('admin', 'lead-guide', 'guide'),
        tourController.aliasTopTour, tourController.getAlltours)


Router
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(tourController.getTourWithin)

Router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances)

Router.route('/')
    .get(tourController.getAlltours)
    .post(
        auth.protect,
        auth.restrictTo('admin', 'lead-guide'),
        tourController.PostTour);
Router.route('/:id')
    .get(tourController.getOnetour)
    .patch(auth.protect,
        auth.restrictTo('admin', 'lead-guide'),
        tourController.uploadTourImages,
        tourController.resizeTourImages,
        tourController.updateTour
    )
    .delete(auth.protect,
        auth.restrictTo('admin', 'lead-guide'),
        tourController.DeleteTour)


module.exports = Router;