import axios from 'axios'
import { showAlert } from './alert'
export const SignUp = async (name, email, password, confirmpass) => {

    try {
        const res = await axios({
            method: 'POST',
            url: 'http://localhost:3000/api/v1/users/signup',
            data: {
                name,
                email,
                password,
                confirmpass
            }
        })
        if (res.data.status === 'success') {
            showAlert('success', 'Signed Up In Successfully')
            window.setTimeout(() => {
                location.assign('/login')
            }, 1000)
        }



    }

    catch (err) {
        showAlert('error', err.response.data.message)
    }


}

