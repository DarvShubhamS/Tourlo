const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const User = require('../models/UserModel')
const catchAsync = require('../Utils/catchAsync')
const AppError = require('../Utils/appError')
const Email = require('../Utils/Email')
const crypto = require('crypto')
const sighnToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

const createAndsendToken = (user, statuscode, res) => {

    const token = sighnToken(user._id)
    const CookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
        httpOnly: true
    }
    if (process.env.NODE_ENV === 'production') CookieOptions.secure = true

    res.cookie('jwt', token, CookieOptions)
    user.password = undefined;

    res.status(statuscode).json({
        status: "success",
        token: token,
        data: {

            user
        }

    })
}

exports.signup = catchAsync(async (req, res, next) => {

    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmpass: req.body.confirmpass,




    })
    const url = `${req.protocol}://${req.get('host')}/me`
    console.log(url)
    await new Email(newUser, url).sendWelcome()

    // const token = sighnToken({ id: newUser._id })
    createAndsendToken(newUser, 201, res)
    // res.status(201).json({
    //     status: "success",
    //     token: token,
    //     data: {

    //         user: newUser
    //     }

    // })

})

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body
    // check if email and pass exist
    if (!email || !password) {
        return next(new AppError('Please Provide Id and Password', 400))
    }

    //check if user exist and pass is correct
    const user = await User.findOne({ email }).select('+password')




    if (!user || !await (user.correctPassword(password, user.password))) {
        return next(new AppError('User or Password Not Correct', 401))
    }

    //if everything of send to
    createAndsendToken(user, 200, res)
    // const token = sighnToken(user._id);
    // res.status(200).json({
    //     status: 'success',
    //     token
    // })
})


exports.protect = catchAsync(
    async (req, res, next) => {
        // get jwt token and check if its exists
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1]
        } else if (req.cookies.jwt) {
            token = req.cookies.jwt
        }

        if (!token) {
            return next(new AppError('You Are not logged in Please log in', 401))
        }
        // console.log(token)
        //validate the token
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
        // console.log(decoded)

        //check if user still exist
        const CurrentUser = await User.findById(decoded.id)
        if (!CurrentUser) {
            return next(new AppError('The User no longer exists', 401))
        }
        //check if user changed password after jwt was issues
        if (CurrentUser.changedPasswordafter(decoded.iat)) {
            return next(new AppError('Recently changed Password Log in again', 401))
        }
        //rant ACCESS TO PROTECTED rOUTE
        req.user = CurrentUser
        res.locals.user = CurrentUser;
        next();


    })
//only for rendered pages no errors
exports.isLoggedIn = catchAsync(async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            // 1) verify token
            const decoded = await promisify(jwt.verify)(
                req.cookies.jwt,
                process.env.JWT_SECRET
            );

            // 2) Check if user still exists
            const CurrentUser = await User.findById(decoded.id);
            if (!CurrentUser) {
                return next();
            }

            // 3) Check if user changed password after the token was issued
            if (CurrentUser.changedPasswordafter(decoded.iat)) {
                return next();
            }

            // THERE IS A LOGGED IN USER RES.LOCALS MAKE DATA AVAILABLE TO OUR VIEW
            res.locals.user = CurrentUser;
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
});

//logout
exports.logout = (req, res) => {
    res.cookie('jwt', 'logged out', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    })

    res.status(200).json({
        status: 'success'
    })
}

//Authorization

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You Don Not Have Permission', 403))
        }
        next()
    }

}

exports.forgetPassword = catchAsync(async (req, res, next) => {
    // Get User based on Email
    const user = await User.findOne({ email: req.body.email })

    if (!user) {
        return next(new AppError('User Not Found', 404))
    }
    //generate random token
    const resetToken = user.createPasswordRestToken()
    await user.save({ validateBeforeSave: false })

    // send it back as email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
    // const message = `Forgot your password?submit patch request to ${resetURL}.\n If you didnt forget please forget your password`
    try {
        // await sendEmail({
        //     email: user.email,
        //     subject: 'Your Password Reset Token(valid for 10 mins)',
        //     message
        // })

        await new Email(user, resetURL).sendPassRest()
        res.status(200).json({
            status: 'success',
            message: 'Token Sent To Mail'
        })

    } catch (err) {
        user.passwordrestToken = undefined
        user.passwordresetExpires = undefined
        await user.save({ validateBeforeSave: false })
        return next(new AppError('there was error sending email'), 500)
    }

})
exports.restpass = catchAsync(async (req, res, next) => {
    //get user based on token
    const hashedtoken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({ passwordrestToken: hashedtoken, passwordresetExpires: { $gt: Date.now() } })




    //set new password if token not expired or there is user
    if (!user) {
        return next(new AppError('Tken is invalid or expired', 400))
    }

    user.password = req.body.password
    user.confirmpass = req.body.confirmpass
    user.passwordrestToken = undefined
    user.passwordresetExpires = undefined
    await user.save()

    //update changepasswordAt proprty



    //log user in send json web token
    createAndsendToken(user, 200, res)
    // const token = sighnToken(user._id)

    // res.status(201).json({
    //     status: "success",
    //     token: token

    // })

})


exports.updatePass = catchAsync(async (req, res, next) => {
    // get user from collection
    const user = await User.findById(req.user.id).select('+password')
    //check if posted pass is correct
    if (!await (user.correctPassword(req.body.currentPass, user.password))) {
        return next(new AppError('Password Not Correct', 401))
    }
    //if pass is correct update pass
    user.password = req.body.password
    user.confirmpass = req.body.confirmpass
    await user.save()

    //login user send json web token
    // const token = sighnToken(user._id)
    createAndsendToken(user, 200, res)
    // res.status(201).json({
    //     status: "success",
    //     token: token

    // })
})

