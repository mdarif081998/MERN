const {validationResult} = require('express-validator');
const User = require('../models/user');

const HttpError = require('../models/http-error');

const getUsers = async(req, res, next) => {
    
    let users;
    try {
        users =  await User.find({}, '-password');
    } catch (err) {
        return next(new HttpError('Fetching users failed. Please try again later...', 500));
    }
    
    res.status(200).json({users: users.map(user => user.toObject({getters: true}))});
}

const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors)
        return next(new HttpError('Invalid input Data: '+ JSON.stringify(errors),422));
    }
    const {name, email, password} = req.body;
   let existingUser;
    try {
       existingUser = await User.findOne({email: email});
    } catch (err) {
        const error = new HttpError('Signup Failed. Please try again...', 500);
        return next(error);
    }

    if(existingUser){
        const error = new HttpError('User exists already. please login instead.', 422);
        return next(error);
    }

    const createdUser = new User({
        name,
        email,
        image: 'https://live.staticflickr.com/7631/26849088292_36fc52ee90_b.jpg',
        password,
        places: []
    });

    try {
        await createdUser.save();
    } catch (err){
        const error = new HttpError('User Signup Failed. Please try again...', 500);
        return next(error);
    }
    res.status(201).json({user: createdUser.toObject({getters: true})});
}

const login = async (req, res, next) => {
    const { email, password } = req.body;
    let existingUser;
    try {
       existingUser = await User.findOne({email: email});
    } catch (err) {
        const error = new HttpError('Logging in Failed. Please try again...', 500);
        return next(error);
    }

    if(!existingUser || existingUser.password !== password){
        const error = new HttpError('Invalid user crentials!', 422);
        return next(error);
    }
    res.json({message: 'User logged in successfully.', user: existingUser});
}

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;