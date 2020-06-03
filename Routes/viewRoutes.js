const viewController = require('../Controllers/viewController')
const express = require('express')
const authController = require('../Controllers/AuhenticationController')
const Router = express.Router()
const BookingController = require('../Controllers/BookingController')


Router.get('/',
    BookingController.createBookingCheckout,
    authController.isLoggedIn,
    viewController.getOverview)
Router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour)
Router.get('/login', authController.isLoggedIn, viewController.getloginForm)
Router.get('/signup', authController.isLoggedIn, viewController.signUPform)
Router.get('/me', authController.protect, viewController.getAccount)
Router.get('/my-tours', authController.protect, viewController.getmyTours)
Router.post('/submit-user-data', authController.protect, viewController.upadateUserData)
Router.get('/forgotpassword', viewController.resetpass)
module.exports = Router