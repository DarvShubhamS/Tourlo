import axios from 'axios'
import { showAlert } from './alert'
//type is either pass or data
export const updateSetting = async (data, type) => {

    try {
        const url = type === 'password' ?
            '/api/v1/users/updatepass' :
            '/api/v1/users/updateUser'
        const res = await axios({
            method: "PATCH",
            url,
            data
        })

        if (res.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} updated successfully`)
            window.setTimeout(() => {
                location.assign('/me')
            }, 1000)
        }

    }
    catch (err) {

        showAlert('error', err.response.data.message)

    }


}