const stripe = require('stripe')(process.env.STRIPE_SECRETKEY) // direct pass the secret key
//Model
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel')
const User = require('../models/userModel')
//Utils
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')

// Factory
const factory = require('./handlerFactory');
const User = require('../models/userModel');

exports.getCheckoutSession = catchAsync(async(req, res, next) => {
    const { tourId } = req.params;

    // 1) Get the currently booked tour
    const tour = await Tour.findById(tourId)
    let url = `${req.protocol}://localhost:3000`;
    if (process.env.NODE_ENV === 'production') {
        url = `${req.protocol}://${req.get('host')}`;
    }

    // 2) Create checkout session
    const session = await stripe.checkout.sessions.create({
        //about the session
        payment_method_types: ['card'],
        mode: 'payment',
        // success_url: `${url}/?tour=${tourId}&user=${req.user.id}&price=${tour.price}`, // query string NOT SECURE, JUST TEMPORARY FOR LOCALHOST -- EVERYONE COULD CALL IT THROUGH THE CHECKOUT PROCESS
        success_url: `${url}/my-tours`,
        cancel_url: `${url}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: tourId, // pass the data from the session
        //about the product
        line_items: [
            {
                name: `${tour.name} Tour`,
                description: tour.summary,
                images: ['https://www.natours.dev/img/tours/tour-1-cover.jpg'], // just a placeholder, we need a live image, so not possible to put localhost image
                amount: tour.price * 100, // multiply by 100 because price is in CENTS
                currency: 'usd',
                quantity: 1
            },
        ],
    });

    // 3) Create session as response
    res.status(200).json({
        status: 'success',
        session
    })
})

// exports.createBookingCheckout = catchAsync(async(req, res, next) => {
//     // This is only TEMPORARY, UNSECURE: everyone can make bookings without paying!
//     const {tour, user, price} = req.query; // query string from success checkout

//     if(!tour || !user || !price) return next(); // next middleware in Home route ('/')

//     await Booking.create({tour, user, price});

//     // redirect to the url WITHOUT the query string
//     res.redirect(req.originalUrl.split('?')[0]); // remove the query string
// })

const createBookingCheckout = async session => {
    // tour is in session, thanks to client_reference_id we specified
    const tour = session.client_reference_id;
    // we also have the user email in session
    const user = (await User.findOne({ email: session.customer_email })).id;
    const price = session.line_items[0].amount / 100; // back in $ dollars

    await Booking.create({tour, user, price});
}


//Stripe webhook checkout
exports.webhookCheckout = (req, res, next) => {
    const signature = req.headers['stripe-signature'];

    let event;

    try {
        // req.body here is in RAW form, that's why we put the declaration in app.js before everything
        event = stripe.webhooks.constructEvent(
            req.body, 
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch(err) {
        return res.status(400).send(`Webhook error: ${err.message}`)
    }

    if(event.type === 'checkout.session.complete') // event type webhook defined in Stripe dashboard
        createBookingCheckout(event.data.object)

    res.status(200).json({ received: true })
}


// API
exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);