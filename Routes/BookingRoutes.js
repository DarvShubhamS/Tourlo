const express = require('express')
const BookingController = require('../Controllers/BookingController')
const AuthController = require('../Controllers/AuhenticationController')
const Router = express.Router()

Router.use(AuthController.protect)
Router.get('/checkout-session/:tourId',
    BookingController.getCheckoutSession)




Router.use(AuthController.restrictTo('admin', 'lead-guide'))
Router.route('/').get(BookingController.getAllBooking).post(BookingController.createBooking)
Router.route('/:id')
    .get(BookingController.getBooking)
    .patch(BookingController.updateBooking)
    .delete(BookingController.deleteBooking)

module.exports = Router