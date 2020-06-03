const catchAsync = require('../Utils/catchAsync')
const AppError = require('../Utils/appError')
const APIFeatures = require('../Utils/apiFeatures')
exports.deleteOne = Model => catchAsync(async (req, res, next) => {

    const doc = await Model.findByIdAndDelete(req.params.id, (err) => {
        if (err) return err
    })

    if (!doc) {
        return next(new AppError('no document Find with that id', 404))
    }
    res.status(204).json({
        status: "success",
        data: null
    })

})


exports.updateOne = Model => catchAsync(async (req, res, next) => {

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    if (!doc) {
        return next(new AppError('no Document Find with that id', 404))
    }
    res.status(200).json({
        status: "success",
        data: {
            doc
        }
    })

})

exports.createOne = Model => catchAsync(async (req, res) => {

    const doc = await Model.create(req.body);
    res.status(201).json({
        status: 'success',

        data: {
            data: doc
        }
    })






    // console.log(req.body)
    // const newId = tours[tours.length - 1].id + 1;
    // const newTour = Object.assign({ id: newId }, req.body)
    // tours.push(newTour);
    // fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {



})

exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id)
    if (popOptions) query = query.populate(popOptions)
    const doc = await query

    // const tour = tours.find(el => el.id === id)

    if (!doc) {
        return next(new AppError('no document Find with that id', 404))
    }
    res.status(200).json({
        status: 'success',
        result: doc.length,
        data: {
            doc
        }
    })

})

exports.getAll = Model => catchAsync(async (req, res) => {

    //Build Quey
    //1)Filtering
    // const queyObj = { ...req.query }
    // const excludeFields = ['page', 'sort', 'limit', 'fields']
    // excludeFields.forEach(el => delete queyObj[el])
    // console.log(req.query, queyObj)
    // // const tours = await Tour.find().where('duration').equals(5)
    // //2)Advanced filtering
    // let queyStr = JSON.stringify(queyObj);
    // //GTE ,GT,LT,LTE
    // queyStr = queyStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
    // console.log(JSON.parse(queyStr))
    // let query = Tour.find(JSON.parse(queyStr))
    //3)Sorting
    // if (req.query.sort) {
    //     const sortBy = req.query.sort.split(',').join(' ')
    //     query = query.sort(sortBy)
    // }

    // else {
    //     query = query.sort('-createdAt')
    // }

    //4)Fields
    // if (req.query.fields) {
    //     const fields = req.query.fields.split(',').join(' ');
    //     query = query.select(fields)
    // } else {
    //     query = query.select('-__v')

    // }

    //4)Pagination 
    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 100;
    // const skip = (page - 1) * limit
    // query = query.skip(skip).limit(limit)

    // if (req.query.page) {
    //     const numTours = await Tour.countDocuments();
    //     if (skip >= numTours) throw new Error('This page doesnt Exist')


    // }

    //allow for nested get reviews on tour
    let filter = {}
    if (req.params.tourId) filter = { tour: req.params.tourId }

    //Execute Query
    const features = new APIFeatures(Model.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    // const doc = await features.query.explain();
    const doc = await features.query;



    // const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().Pagination();
    // const tours = await features.query
    //send response
    res.status(200).json({
        status: 'success',
        result: doc.length,
        data: {
            data: doc
        }
    })

})


