
//Model
const Tour = require('../models/tourModel');



// ROUTES HANDLERS
exports.getAllTours = async(req, res) => {
    try {
        const tours = await Tour.find();

        res.status(200).json({
            status: 'success',
            results: tours.length, // because we send an array
            data:{
                tours
            }
        })
    } catch(err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}

exports.getTour = async(req, res) => { 
    const { id } = req.params;
    try{
        const tour = await Tour.findById(id);
        // Tour.findOne({ _id: req.params.id })

        res.status(200).json({
            status: 'success',
            data:{
                tour
            }
        })
    } catch(err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }

    // //otherwise
    // res.status(200).json({
    //     status: 'success',
    //     data:{
    //         tour: tour
    //     }
    // })

}

exports.createTour = async(req, res) => {
    try {
        //const NewTour = new Tour({})
        // await newTour.save()
        const newTour = await Tour.create({...req.body});
        
        res.status(201).json({// created
            status: 'success',
            data: {
                tour: newTour
            }
        }); 
    } catch(err) {
        res.status(400).json({
            status: 'fail',
            message: err
        })
    }
}

exports.updateTour = async(req, res) => {
    const { id } = req.params;
    try{
        const tour = await Tour.findByIdAndUpdate(id, {...req.body}, {
            new: true, // return the new document into "tour"
            runValidators: true // on update we check the Schema, default is false
        });
        // Tour.findOne({ _id: req.params.id })

        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        })
    } catch(err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}

exports.deleteTour = async(req, res) => {
    const { id } = req.params;
    try{
        await Tour.findByIdAndDelete(id);

        res.status(204).json({ // 204 No Content
            status: 'success',
            data: null // show the ressource we deleted is not enymore here
        })
    } catch(err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }  
}