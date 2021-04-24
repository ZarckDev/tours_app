
//Utils
const APIFeatures = require('../utils/apiFeatures')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')


const getCollectionName = (Model) => {
    let {
      collection: { collectionName },
    } = Model;
   
    // Convert to singular
    collectionName = collectionName.slice(0, -1);
    return collectionName;
  };


// generic delete one document handler
exports.deleteOne = Model => 
    catchAsync(async(req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);

        // if we want the collection name
        const collectionName = getCollectionName(Model);

        if(!doc) {
            return next(new AppError(`No ${collectionName} found with that ID`, 404))
        }

        res.status(204).json({ // 204 No Content
            status: 'success',
            data: null // show the ressource we deleted is not anymore here
        })
    })

exports.updateOne = Model =>
    catchAsync(async(req, res, next) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, {...req.body}, {
            new: true, // return the new document into "tour"
            runValidators: true // on update we check the Schema, default is false
        });

        // if we want the collection name
        const collectionName = getCollectionName(Model);

        if(!doc) {
            return next(new AppError(`No ${collectionName} found with that ID`, 404))
        }

        res.status(200).json({
            status: 'success',
            data: {
                [collectionName]: doc
            }
        })

    })

exports.createOne = Model =>
    catchAsync(async(req, res, next) => {
        const doc = await Model.create({...req.body});

        // if we want the collection name
        const collectionName = getCollectionName(Model);
        
        res.status(201).json({// created
            status: 'success',
            data: {
                [collectionName]: doc
            }
        }); 
    })


exports.getOne = (Model, populateOptions) =>
    catchAsync(async(req, res, next) => {
        // we can specify what we want to populate or not
        let query = Model.findById(req.params.id);
        if(populateOptions) query = query.populate(populateOptions)

        const doc = await query;

        
        // .populate({  /// ADDED IN QUERY MIDDLEWARE INSTEAD (IN TOURMODEL), TO BE USE BY DEFAULT IN ALL FIND QUERY
        //     path: 'guides',
        //     select: '-__v -passwordChangedAt' // remove the "__v" and "passwordChangedAt" from results
        // });// Populate can slow down our application (it creates new query), think before use it, good for small application

        // if we want the collection name
        const collectionName = getCollectionName(Model);

        if(!doc) {
            return next(new AppError(`No ${collectionName} found with that ID`, 404))
        }

        // otherwise
        res.status(200).json({
            status: 'success',
            data:{
                [collectionName]: doc
            }
        })
    })

exports.getAll = Model => 
    catchAsync(async(req, res, next) => {

        // To allow for nested GET reviews on tour (small hack for Get All Reviews)
        let filter = {}
        // In case we want all the reviews, but for a specific Tour
        if(req.params.tourId) filter = { tour: req.params.tourId}; // from url
        // otherwise find all reviews

        // EXECUTE QUERY
        const features = new APIFeatures(Model.find(filter), req.query) // Tour.find() to give a Query, important for operations inside methods !
        features.filter().sort().limitFields().paginate(); // we manipulate the query if there are any specific query
        const docs = await features.query;
        // const docs = await features.query.explain(); // show statistics details of the operation

        // if we want the collection name
        const collectionName = getCollectionName(Model);

        res.status(200).json({
            status: 'success',
            results: docs.length, // because we send an array
            data:{
                [collectionName]: docs
            }
        })

    })