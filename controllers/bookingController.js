const stripe = require('stripe')(process.env.STRIPE_SECRETKEY) // direct pass the secret key
//Model
const Tour = require('../models/tourModel');
//Utils
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')

// Factory
const factory = require('./handlerFactory')

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
        success_url: `${url}/`,
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