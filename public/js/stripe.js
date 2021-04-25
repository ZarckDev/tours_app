// Create an instance of the Stripe object with your publishable API key


const checkoutButton = document.getElementById("book-tour");

const bookTour = async (tourId) => {
    const stripe = Stripe("pk_test_51IjpxeA7ippmNpJAYXNM9k5mbTi2nqCm7O1eSmoLJCGkUSFXjU5orBuxxsAagK37DgWjrdK6845P7NQSMWV5DjQI00eQT8JyR2");

    try{
        // 1) Get checkout session from endpoint API
        const session = await axios(`http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`)

        // 2) Create checkout form + charge credit card
        await stripe.redirectToCheckout({ sessionId: session.data.session.id }); // session coming from getCheckoutSession() in bookingController.
    } catch(err) {
        // console.log(err)
        alert('error', err)
    }
    
}




if(checkoutButton){
    checkoutButton.addEventListener("click", e => {
        e.target.textContent = 'Processing...'
        // data-tour-id automatically converted to tourId (replace dash automatically) -- > so same name
        const {tourId} = e.target.dataset;
        bookTour(tourId)
    })
}
