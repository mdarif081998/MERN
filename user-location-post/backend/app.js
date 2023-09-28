const fs = require('fs');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const userRoutes = require('./routes/users-route');
const placesRoutes = require('./routes/places-route');
const HttpError = require('./models/http-error');
const app = express();

app.use(bodyParser.json());
dotenv.config({path: './config.env'});

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use((req, res, next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorisation');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
    next();
})

app.use('/api/users', userRoutes);
app.use('/api/places', placesRoutes);

app.use((req, res, next) => {
    const error = new HttpError('Could not find this route.', 404);
    throw error;
})

app.use((error, req, res, next) => {
    if(req.file){
        fs.unlink(req.file.path, (err) => {
            console.log(err);
        })
    }

    if(res.headerSent){
        return next(error);
    }

    res.status(error.code || 500);
    res.json({message: error.message || 'An Unknown error occured'});
})

mongoose.connect(process.env.DATABASE_URL)
.then(() =>{
    const port = process.env.PORT;
    app.listen(port, ()=> console.log('Server started on port: ' + port));
})
.catch((error)=>{
    console.log('Error: '+ error);
});



