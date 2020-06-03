const express = require('express');
const userController = require('../Controllers/userController')
const Authcontrol = require('../Controllers/AuhenticationController')


const Router = express.Router();


Router.post('/signup', Authcontrol.signup)
Router.post('/login', Authcontrol.login)
Router.get('/logout', Authcontrol.logout)
Router.get('/me', Authcontrol.protect, userController.getMe, userController.getUser)
Router.post('/forgetpass', Authcontrol.forgetPassword)
Router.patch('/resetPassword/:token', Authcontrol.restpass)

//this middleware will run protect for all routes as all are middleware
Router.use(Authcontrol.protect)

Router.patch('/updatepass', Authcontrol.updatePass)
Router.patch('/updateUser',
    userController.uploadUserphoto,
    userController.resizeUserPhoto,
    userController.updateMe)
Router.delete('/deleteMe', userController.deleteMe)

Router.use(Authcontrol.restrictTo('admin'))

Router.route('/')
    .get(userController.getAllusers)
    .post(userController.createuser)

Router.route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUsers)
    .delete(userController.deleteUser)


module.exports = Router;