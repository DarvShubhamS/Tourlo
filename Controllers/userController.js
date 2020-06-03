const User = require('../models/UserModel')
const catchAsync = require('../Utils/catchAsync')
const AppError = require('../Utils/appError')
const factory = require('./handlerFactory')
const multer = require('multer')
const sharp = require('sharp')

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users')
//     },
//     filename: (req, file, cb) => {
//         const extention = file.mimetype.split('/')[1]
//         //filename user-userid-currenttime.extenstion
//         cb(null, `user-${req.user.id}-${Date.now()}.${extention}`)
//     }
// })

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

exports.uploadUserphoto = upload.single('photo')


exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    ///if no file is uploaded
    if (!req.file) return next()

    //if file is uploaded

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`
    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`)

    next()

})



const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el]
    })
    return newObj
}

exports.getAllusers = factory.getAll(User)

exports.updateMe = catchAsync(async (req, res, next) => {
    // console.log(req.file)
    // console.log(req.body)
    // create err if user updates pass
    if (req.body.password || req.body.confirmpass) {
        return next(new AppError('Cannot Update Password Use Update Password Route', 400))
    }
    //if not update user doc 

    //also filter unwated user
    const filteredbody = filterObj(req.body, 'name', 'email')
    if (req.file) filteredbody.photo = req.file.filename
    const updatesuser = await User.findByIdAndUpdate(req.user.id, filteredbody, {
        new: true,
        runValidators: true
    })



    res.status(200).json({
        status: "success",
        data: {
            user: updatesuser
        }
    })
})

exports.createuser = (req, res) => {

}

exports.getUser = factory.getOne(User)
exports.updateUsers = factory.updateOne(User)
exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false })

    res.status(204).json({
        status: 'succees',
        data: null
    })

})

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id
    next()
}

exports.deleteUser = factory.deleteOne(User)

