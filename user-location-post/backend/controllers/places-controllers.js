const fs = require('fs');

const { validationResult } = require('express-validator')
const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const mongoose = require('mongoose');
const Place = require('../models/place');
const User = require('../models/user');

const getPlaceById = async (req, res,next) => {
    const placeId = req.params.pid;
    let place;
    try {
        place = await Place.findById(placeId).exec();
    } catch (err) {
        const error = new HttpError('Something went wrong could not find a place', 500);
        return next(error);
    }
    if(!place){
        const error = new HttpError('Could not find a place for the provided id.', 404);
        return next(error);
    }
    res.status(200).json( { place: place.toObject({getters: true}) } );
};

const getPlacesByUserId = async (req, res, next)=> {
    const userId = req.params.uid;
    // let places;
    let userWithPlaces;
    try {
        // places = await Place.find({creator: userId});
        userWithPlaces = await User.findById(userId).populate('places')
    } catch (err){
        const error = new HttpError('Fetching places failed, please try again...', 500);
        return next(error); 
    }
    // if(!places && places.length === 0){
        if(!userWithPlaces || userWithPlaces.places.length === 0){
        return next(new HttpError('Could not find a place for the provided user id.', 404));
     }
    // res.status(200).json({ places: places.map(place => place.toObject({getters: true})) });
    res.status(200).json({ places: userWithPlaces.places.map(place => place.toObject({getters: true})) });

};

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors)
        return next(new HttpError('Invalid input Data: '+ JSON.stringify(errors),422));
    }
    const {title, description, address, creator} = req.body;

    let coordinates;
    let createdPlace;
    try{
       coordinates = await getCoordsForAddress(address); 
    

    createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: req.file.path,
        creator
    });

    const user = await User.findById(creator);

    if(!user) return next(new HttpError('Invalid User Id provided to add place.', 404));
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({session: sess});
    user.places.push(createdPlace);
    await user.save({session: sess});
    await sess.commitTransaction();
    } catch (err) {
        console.log(err);
        const error = new HttpError('Place creation failed. Please try again...', 500)
        return next(error);
    }

    res.status(201).json({place: createdPlace})
};

const updatePlaceById = async (req, res, next) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors)
        return next(new HttpError('Invalid input Data: '+ JSON.stringify(errors),422));
    }
    const {title, description} = req.body;
    const  placeId = req.params.pid;
    let place;
    try{
        place = await Place.findById(placeId);
    }catch (err){
        const error = new HttpError('Something went wrong. Please try again later...', 500);
        return next(error);
    }
    
    place.title = title;
    place.description = description;

    try {
        await place.save();
    } catch (err) {
        const error = new HttpError('Something went wrong. Could not update place.', 500);
        return next(error);
    }

    res.status(200).json({place: place.toObject({getters: true})});
};

const deletePlaceById = async (req, res, next) => {
    const  placeId = req.params.pid;
    let place;
    try {
        place = await Place.findById(placeId).populate('creator');

        if(!place){
            return next(new HttpError('Could not find a place for the provided id.', 404));
        }
        const imagePath = place.image;
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await place.deleteOne({session: sess});
        place.creator.places.pull(place);
        await place.creator.save({session: sess});
        await sess.commitTransaction();
        fs.unlink(imagePath, err => {
            console.log(err);
        });
    } catch (err){
        console.log(err)
        const error = new HttpError('Something went wrong. Could not delete the place.', 500);
        return next(error);
    }
    
    res.status(200).json({message: 'Deleted place.', place});
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlaceById = deletePlaceById;

