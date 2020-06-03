const Tour = require('../models/tourModel')
const fs = require('fs')
const APIFeatures = require('../Utils/apiFeatures')
const catchAsync = require('../Utils/catchAsync')
const AppError = require('../Utils/appError')
const factory = require('./handlerFactory')
const multer = require('multer')
const sharp = require('sharp')
//const tours = JSON.parse(fs.readFileSync("../starter/dev-data/data/tours-simple.json"))

// exports.checkId = (req, res, next, val) => {
//     if (req.params.id * 1 > tours.length) {
//         return res.status(404).json({
//             status: "fail",
//             message: "invalid ID"
//         })
//     }

//     next();
// }


// exports.checkBody = (req, res, next) => {
//     if (!req.body.name || req.body.price) {
//         return res.status(404).json({
//             status: "fail",
//             message: "Invalid"
//         })
//     }

//     next()
// }
const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
    //if image return true else return false
    if (file.mimetype.startsWith('image')) {
        cb(null, true)
    }

    else {
        cb(new AppError('Please Upoad Only Image File', 400), false)
    }
}
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter

})


exports.uploadTourImages = upload.fields(
    [
        {
            name: 'imageCover',
            maxCount: 1

        },
        {
            name: 'images',
            maxCount: 3
        }])

exports.resizeTourImages = catchAsync(async (req, res, next) => {
    //console.log(req.files)
    if (!req.files.imageCover || !req.files.images) return next()
    //proces cover image
    const imageCoverName = `tour-${req.params.id}-${Date.now()}-cover.jpg`
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${imageCoverName}`)
    req.body.imageCover = imageCoverName
    //processes images
    req.body.images = []
    await Promise.all(req.files.images.map(async (file, index) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${index + 1}.jpg`
        await sharp(file.buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/tours/${filename}`)

        req.body.images.push(filename)

    }))

    next()
})
exports.aliasTopTour = (req, res, next) => {
    req.query.limit = '5'
    req.query.sort = '-ratingsAverage.price'
    req.query.fields = 'name,price,ratingAverage,summary,difficulty'
    next()

}


exports.getAlltours = factory.getAll(Tour)
exports.getOnetour = factory.getOne(Tour, { path: "reviews" })

exports.PostTour = factory.createOne(Tour)
exports.updateTour = factory.updateOne(Tour)

exports.DeleteTour = factory.deleteOne(Tour)
// exports.DeleteTour = catchAsync(async (req, res) => {

//     const tour = await Tour.findByIdAndDelete(req.params.id, (err) => {
//         if (err) return err
//     })

//     if (!tour) {
//         return next(new AppError('no Tour Find with that id', 404))
//     }
//     res.status(204).json({
//         status: "success",
//         data: {
//             tour: null
//         }
//     })

// })


exports.getTourStat = catchAsync(async (req, res) => {

    const stats = await Tour.aggregate([
        {
            $match: { ratingAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: '$difficulty',
                numTours: { $sum: 1 },
                numRating: { $sum: '$ratingQuantity' },
                avgrating: { $avg: '$ratingAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: 'price' }
            }
        },
        {
            $sort: { avgPrice: 1 }
        }
    ])

    res.status(200).json({
        status: "success",
        data: {
            stats
        }
    })





})

exports.getMonthlyPlan = catchAsync(async (req, res) => {

    const year = req.params.year * 1; //2021
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),

                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tour: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: { numTourStarts: 1 }
        }, {
            $limit: 12
        }

    ])


    res.status(200).json({
        status: "success",
        data: {
            plan
        }
    })


})
///tours-within/:distance/center/:latlng/unit/:unit
exports.getTourWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params
    const [lat, long] = latlng.split(',')
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1
    if (!lat || !long) {
        next(new AppError('Please Provide latitde and longitude', 400))
    }
    const tours = await Tour.find({
        startLocation: { $geoWithin: { $centerSphere: [[long, lat], radius] } }
    })

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours
        }
    })
})


exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params
    const [lat, long] = latlng.split(',')

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001

    if (!lat || !long) {
        next(new AppError('Please Provide latitde and longitude', 400))
    }

    const distance = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [long * 1, lat * 1]
                },

                distanceField: 'distance',
                distanceMultiplier: multiplier
            }


        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }


    ])

    res.status(200).json({
        status: 'success',
        data: {
            data: distance
        }
    })



})