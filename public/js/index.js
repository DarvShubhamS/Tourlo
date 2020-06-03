import { login, logout } from './login'
import '@babel/polyfill'
import { displayMaps } from './mapbox'
import { SignUp } from './Signup'
import { updateSetting } from './updateSettings'
import { ForgetPass } from './forgetPass'
import { BookTour } from './stripe'


//DOM ELEMENTS
const mapBox = document.getElementById('map')
const loginForm = document.querySelector('.form--login')
const SignUpForm = document.querySelector('.form--signup')
const userForm = document.querySelector('.form-user-data')
const PassForm = document.querySelector('.form-user-password')
const resetPass = document.querySelector('.form--resetpass')
const buyButton = document.getElementById('book-Tour')

//values
const logoutbttn = document.querySelector('.nav__el--logout')

if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations)
    displayMaps(locations)
}


if (loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault()
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password)

    })

}

if (SignUpForm) {
    SignUpForm.addEventListener('submit', e => {
        e.preventDefault()
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmpass = document.getElementById('cpassword').value;
        SignUp(name, email, password, confirmpass)

    })

}

if (userForm) {
    userForm.addEventListener('submit', e => {
        e.preventDefault()
        const form = new FormData()
        form.append('name', document.getElementById('name').value)
        form.append('email', document.getElementById('email').value)
        form.append('photo', document.getElementById('photo').files[0])
        console.log(form)

        updateSetting(form, 'data')

    })
}
if (PassForm) {
    PassForm.addEventListener('submit', async e => {
        e.preventDefault()
        document.querySelector('.btn--save-password').innerHTML = 'updating'
        const currentPass = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const confirmpass = document.getElementById('password-confirm').value;
        await updateSetting({ currentPass, password, confirmpass }, 'password')
        document.querySelector('.btn--save-password').innerHTML = 'Save Password'
        document.getElementById('password-current').value = ""
        document.getElementById('password').value = ""
        document.getElementById('password-confirm').value = ""


    })
}

if (resetPass) {
    resetPass.addEventListener('submit', e => {
        e.preventDefault()
        const email = document.getElementById('email').value;
        ForgetPass(email)
    })
}

if (buyButton) {
    buyButton.addEventListener('click', e => {
        e.target.textContent = 'Processing....'
        const { tourId } = e.target.dataset
        BookTour(tourId)
    })
}

if (logoutbttn) logoutbttn.addEventListener('click', logout)

