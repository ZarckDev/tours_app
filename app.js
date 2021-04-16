const fs = require('fs')
const express = require('express');
const morgan = require('morgan'); // Request Logger with details

const app = express();

//1. MIDDLEWARES
app.use(morgan('dev'));
app.use(express.json());

//Create a middleware -- each middleware have access to req and res (going through all the pipeline)
// Apply to every single request -- POSITION IS IMPORTANT
app.use((req, res, next) => {
    console.log('Hello from the middleware ✌');
    next();
})

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString(); // if we want the time for every request
    next();
})

const toursData = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)) // everytime we save on post request , the server restarts, so we are able to read again this file as the program restarts

//2. ROUTES HANDLERS
const getAllTours = (req, res) => {
    // console.log(req.requestTime) // from middleware Time
    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        results: toursData.length, // because we send an array
        data:{
            tours: toursData
        }
    })
}

const getTour = (req, res) => { // :y?   -> ? for optional param
    const id = req.params.id * 1;// convert to Number

    const tour = toursData.find(el => el.id === id)

    if(!tour){
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID'
        })
    }
    //otherwise
    res.status(200).json({
        status: 'success',
        data:{
            tour: tour
        }
    })

}

const createTour = (req, res) => {
    // console.log(req.body);
    const newId = toursData[toursData.length-1].id + 1; // It's ok because ids are numbers...
    const newTour = {...req.body, id: newId};
    
    toursData.push(newTour);
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(toursData), err => {
        res.status(201).json({// created
            status: 'success',
            data: {
                tour: newTour
            }
        }); 
    })
}

const updateTour = (req, res) => {
    //not implemented 
    if(req.params.id *1 > toursData.length){
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID'
        })
    }
    res.status(200).json({
        status: 'success',
        data: {
            tour: '<Updated tour here...>'
        }
    })
}

const deleteTour = (req, res) => {
    //not implemented 
    if(req.params.id *1 > toursData.length){
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID'
        })
    }
    res.status(204).json({ // 204 No Content
        status: 'success',
        data: null // show the ressource we deleted is not enymore here
    })
}


const getAllUsers = (req, res) => {
    // internal server error -- not implemented
    res.status(500).json({
        status: 'error',
        message: "This route is not yet defined!"
    })
}
const getUser = (req, res) => {
    // internal server error -- not implemented
    res.status(500).json({
        status: 'error',
        message: "This route is not yet defined!"
    })
}
const createUser = (req, res) => {
    // internal server error -- not implemented
    res.status(500).json({
        status: 'error',
        message: "This route is not yet defined!"
    })
}
const updateUser = (req, res) => {
    // internal server error -- not implemented
    res.status(500).json({
        status: 'error',
        message: "This route is not yet defined!"
    })
}
const deleteUser = (req, res) => {
    // internal server error -- not implemented
    res.status(500).json({
        status: 'error',
        message: "This route is not yet defined!"
    })
}


// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);
// app.get('/api/v1/tours/:id', getTour);
// //patch to only update a property
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

//3. ROUTES
const tourRouter = express.Router(); // It's a middleware
app.use('/api/v1/tours', tourRouter) // for this specific route - MOUNTING the router
// app.route('/api/v1/tours')
//     .get(getAllTours)
//     .post(createTour)
tourRouter.route('/')
    .get(getAllTours)
    .post(createTour)
// HERE THE CYCLE IS FINISHED so only the middleware above will be executed, not below

// POSITION IS IMPORTANT -- for the following routes, we have all the middleware before executed
// app.use((req, res, next) => {
//     console.log('Hello from the 2nd middleware ✌');
//     next();
// })

tourRouter.route('/:id')
    .get(getTour)
    .patch(updateTour)//patch to only update a property
    .delete(deleteTour);

const userRouter = express.Router(); // It's a middleware
app.use('/api/v1/users', userRouter) // for this specific route - MOUNTING the router

userRouter.route('')
    .get(getAllUsers)
    .post(createUser);

userRouter.route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser)

//4. START SERVER
const port = 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
})