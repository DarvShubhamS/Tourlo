const AppError = require('../Utils/appError')

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {



    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    console.log("error value................")
    console.log(value);
    const message = `Duplicate Fields value: ${value} , please use another value`
    return new AppError(message, 400)
}

const handleVlidationDB = err => {
    const errors = Object.values(err.errors).map(el => el.message)
    const message = `Invalid Input Data. ${errors.join('. ')}`
    return new AppError(message, 400)

}

const handleWebTokenERR = () => {
    return new AppError('iNVALID Token.Please Log In again', 401)
}
const handleExpToken = () => {
    return new AppError('Session Expired ! Please Log In', 401)
}
const sendErrorDev = (err, req, res) => {
    //API
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            err: err,
            message: err.message,
            stack: err.stack

        })
    }
    //RENDERED WEBSITE
    console.error('ERROR 💥', err);
    return res.status(err.statusCode).render('error', {
        title: "Something Went Wrong",
        msg: err.message
    })


}





// const sendErrorProdct = (err, res) => {
//     if (err.isOperational) {
//         res.status(err.statusCode).json({
//             status: err.status,
//             message: err.message

//         })


//     }

//     //programatic error
//     else {
//         console.error('ERROR', err)
//         res.status(500).json({
//             status: 'error',
//             message: 'something went very wrong'
//         })
//     }

// }

const sendErrorProd = (err, req, res) => {
    // Operational, trusted error: send message to client
    if (req.originalUrl.startsWith('/api')) {
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });

            // Programming or other unknown error: don't leak error details
        }
        // 1) Log error
        console.error('ERROR 💥', err);

        // 2) Send generic message
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        });




    }
    //rendered website
    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: "Something Went Wrong",
            msg: err.message
        })


        // Programming or other unknown error: don't leak error details
    }
    // 1) Log error
    console.error('ERROR 💥', err);

    // 2) Send generic message
    return res.status(err.statusCode).render('error', {
        title: "Something Went Wrong",
        msg: 'Please Try Again Letter'
    })




}




module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'developement') {
        sendErrorDev(err, req, res)
    }

    else if (process.env.NODE_ENV === 'production') {

        let error = { ...err }
        error.message = err.message
        error.message = err.message

        if (error.name === 'CastError') error = handleCastErrorDB(error);
        // if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        // if (error.name === 'ValidationError')
        //   error = handleValidationErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError') error = handleVlidationDB(error);
        if (error.name === 'JsonWebTokenError') error = handleWebTokenERR();
        if (error.name === 'TokenExpiredError') error = handleExpToken();
        sendErrorProd(error, req, res);


    }





}