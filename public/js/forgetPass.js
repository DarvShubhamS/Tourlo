import axios from 'axios'
import { showAlert } from './alert'

export const ForgetPass = async (email) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/forgetpass',
            data: {
                email
            }
        })
        if (res.data.status === 'success') {
            showAlert('success', 'Reset Email Sent Successfully')

        }
    }

    catch (err) {
        showAlert('error', err.response.data.message)
    }
}