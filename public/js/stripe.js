const stripe = Stripe('pk_test_BsZN5uIBY3z1NthCHiDIWMGs00YvA7j6wa')
import axios from 'axios'
import { showAlert } from './alert'
export const BookTour = async tourId => {
    try {
        //get checkout session from server api
        const session = await axios(
            `/api/v1/booking/checkout-session/${tourId}`
        )
        //console.log(session)
        //use stripe to create checkout form + process payment
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        })



    } catch (err) {
        //console.log(err)
        showAlert('error', err)
    }

}


