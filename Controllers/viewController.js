const Tour = require('../models/tourModel')
const catchAsync = require('../Utils/catchAsync')
const Apperror = require('../Utils/appError')
const UserModel = require('../models/UserModel')
const Booking = require('../models/bookingModel')
exports.getOverview = catchAsync(async (req, res) => {
    //get all tour data 
    const tours = await Tour.find()
    //build template

    //render that template 
    res.status(200).render('overview', {
        tours
    })
})

exports.getTour = catchAsync(async (req, res, next) => {

    const tour = await Tour.findOne({ slug: req.params.slug }).populate(
        {
            path: 'reviews',
            fields: 'review rating user'
        })

    if (!tour) {
        return next(new Apperror('There is no Tour with that name', 404))
    }

    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour
    })
})

exports.getloginForm = (req, res) => {

    res.status(200).render('login', {
        title: 'Log In Your Account'
    })


}

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Your Account'
    })
}

exports.signUPform = (req, res) => {
    res.status(200).render('signup', {
        title: 'SignUp'
    })
}
//can also do with virtual populate
exports.getmyTours = catchAsync(async (req, res, next) => {
    // find all bookings
    const bookings = await Booking.find({ user: req.user.id })
    //find tours with returned ids
    const tourIds = bookings.map(el => el.tour)
    const tours = await Tour.find({ _id: { $in: tourIds } })

    res.status(200).render('overview', {
        title: 'My Tours',
        tours
    })
})

exports.upadateUserData = async (req, res, next) => {
    const updateduser = await UserModel.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        email: req.body.email
    }, {
        new: true,
        runValidators: true
    })

    res.status(200).render('account', {
        title: 'Your Account',
        user: updateduser
    })
}

exports.resetpass = async (req, res, next) => {
    res.status(200).render('ResetPassTemp', {
        title: 'Forgot Your Pasword',

    })
}
