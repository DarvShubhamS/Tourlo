const fs = require('fs')
const Tour = require('../../models/tourModel')
const ReviewM = require('../../models/reviewModel')
const UsersM = require('../../models/UserModel')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config({ path: '../../config.env' })
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(con => {
    console.log("DB CONNECTION SUCCESSFUL");
});


//Read Json File 
const tours = JSON.parse(fs.readFileSync('./tours.json', 'utf-8'));
const users = JSON.parse(fs.readFileSync('./users.json', 'utf-8'));
const reviews = JSON.parse(fs.readFileSync('./reviews.json', 'utf-8'));


//Import Data into Database

const importData = async () => {
    try {
        await Tour.create(tours)
        await ReviewM.create(reviews)
        await UsersM.create(users, { validateBeforeSave: false })
        console.log('Data Successfully Loaded')
        process.exit();


    } catch (err) {
        console.log(err)
    }



}



//Delete All Data FROM DB

const deleteData = async () => {
    try {
        await Tour.deleteMany()
        await ReviewM.deleteMany()
        await UsersM.deleteMany()
        console.log('Data Successfully Deleted')
        process.exit()


    } catch (err) {
        console.log(err)
    }
}

if (process.argv[2] == '--import') {
    importData()
}
else if (process.argv[2] == '--delete') {
    deleteData()
}

console.log(process.argv)