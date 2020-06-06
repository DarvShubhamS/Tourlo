const express = require('express');
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const path = require('path')
const AppError = require('./Utils/appError')
const globalErrorHanadler = require('./Controllers/errorController')
const tourRouter = require('./Routes/tourRouter');
const userRouter = require('./Routes/userRouter');
const reviewRouter = require('./Routes/reviewRouter')
const viewRouter = require('./Routes/viewRoutes')
const bookingsRouter = require('./Routes/BookingRoutes')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const compression = require('compression')

//start express app
const app = express();

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

//serving static file
app.use(express.static(path.join(__dirname, 'public')))
//global middleware
//security http
app.use(helmet())



app.use(morgan('dev'))
//body parser reading data from req.body
//parses data from cookie

//parses data from url
app.use(express.json({
    limit: '10kb'


}))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(cookieParser())

//data sanitization agaisnt no sql query injection
app.use(mongoSanitize())


//against xss
app.use(xss({
    whitelist: [
        'duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price'
    ]
}))

//prevent param pollution
app.use(hpp())

//serving static file
app.use(express.static(path.join(__dirname, 'public')))

// app.get('/', (req,res) => {
//         res.status(200).json({message:'Hello  From Server',
//     app:'Nators'})
// });

// app.post('/',(req,res) => {
//     res.send('you can post')
// })
app.use(compression())


//test middleware
app.use((req, res, next) => {
    //console.log("Hello from Middleware");
    next();
})

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
})

app.use(cors({ credentials: true, origin: true }));
//set limiter
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too Many Request from this App Try after hour'

})

app.use('/api', limiter)






//routes handler Mounting
app.use('/', viewRouter)
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/review', reviewRouter)
app.use('/api/v1/booking', bookingsRouter)
//middleware to handle 
app.all('*', (req, res, next) => {
    // res.status(404).json({
    //     status: 'fail',
    //     message: `cant find ${req.originalUrl} on server`
    // })

    // const err = new Error("errr a gaya")
    // err.status = 'fail';
    // err.statusCode = 404;


    next(new AppError(`cant find ${req.originalUrl} on server`, 404));
})

app.use(globalErrorHanadler)
// app.get('/api/v1/tours', getAlltours)
// app.get('/api/v1/tours/:id', getOnetour)
// app.post('/api/v1/tours', PostTour)
// app.patch('/api/v1/tours/:id', updateTour)
// app.delete('/api/v1/tours/:id', DeleteTour)


//routes


//start server
module.exports = app;

