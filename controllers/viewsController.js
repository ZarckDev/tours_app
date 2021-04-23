
//Utils
const catchAsync = require('../utils/catchAsync')

const Tour = require('../models/tourModel')


exports.getOverview = catchAsync(async(req, res, next) => {
    // 1) Get tour data from collection
    const tours = await Tour.find();

    // 2) Build template
    // 3) Render that template using our data from 1)
    res.status(200).render('overview', {
        title: `All Tours`,
        tours
    })
})

exports.getTour = catchAsync(async(req, res, next) => {
    // 1) Get the data, for the requested tour (need reviews and guides)
    const { name } = req.params;
    const tour = await Tour.findOne({ slug: name }).populate({
        path: 'reviews',
        select: 'review rating user'
    })

    // 2) Build template
    console.log(tour)

    // 3) Render template using data from 1)
    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour
    })
})


exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: `Log into you account`
    })
}