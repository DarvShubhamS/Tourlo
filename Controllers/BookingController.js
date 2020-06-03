const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Tour = require('../models/tourModel')
const catchAsync = require('../Utils/catchAsync')
const AppError = require('../Utils/appError')
const factory = require('./handlerFactory')
const Booking = require('../models/bookingModel')
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    //find tour with specific id we wanna buy
    const tour = await Tour.findById(req.params.tourId)


    //create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        //defining data about product details ,properties already defined by strip
        line_items: [
            {
                name: `${tour.name} Tour`,
                description: tour.summary,
                // images: [],
                amount: tour.price * 100,
                currency: 'INR',
                quantity: 1

            }
        ]

    })


    //send session to a client
    res.status(200).json({
        status: 'success',
        session
    })

})

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
    //anyone can make booking without paying
    const { tour, user, price } = req.query
    //console.log(req.query)
    if (!tour && !user && !price) return next()
    await Booking.create({ tour, user, price })
    res.redirect(req.originalUrl.split('?')[0])
})

exports.createBooking = factory.createOne(Booking)
exports.getBooking = factory.getOne(Booking)
exports.getAllBooking = factory.getAll(Booking)
exports.updateBooking = factory.updateOne(Booking)
exports.deleteBooking = factory.deleteOne(Booking)
