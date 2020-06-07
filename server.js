const mongoose = require('mongoose')

const dotenv = require('dotenv')
process.on('uncaughtException', err => {
    console.log(err.name, err.message)
    console.log('uncaught exception shutting down ');
    process.exit(1)
})
dotenv.config({ path: './config.env' })
const app = require('./app')
// console.log(process.env);
const port = process.env.PORT || 3000;
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(con => {
    console.log("DB CONNECTION SUCCESSFUL");
});



const server = app.listen(port, () => {
    console.log(`App Running on Port ${port}`)
});

process.on('unhadledRejection', err => {
    console.log(err)
    console.log('unhandled rejection shutting down ');
    server.close(() => {
        process.exit(1);


    })
    //abrupt way



})









