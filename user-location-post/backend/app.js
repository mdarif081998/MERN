const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const userRoutes = require('./routes/users-route');
const placesRoutes = require('./routes/places-route');
const HttpError = require('./models/http-error');
const app = express();

app.use(bodyParser.json());

app.use('/api/users', userRoutes);
app.use('/api/places', placesRoutes);

app.use((req, res, next) => {
    const error = new HttpError('Could not find this route.', 404);
    throw error;
})

app.use((error, req, res, next) => {
    if(res.headerSent){
        return next(error);
    }

    res.status(error.code || 500);
    res.json({message: error.message || 'An Unknown error occured'});
})

mongoose.connect('mongodb+srv://Md-Arif:Techsoftdatabase22@atlascluster.dhgslfz.mongodb.net/places?retryWrites=true&w=majority')
.then(() =>{
    const PORT = 5000;
    app.listen(PORT, ()=> console.log('Server started on port: ' + PORT));
})
.catch((error)=>{
    console.log('Error: '+ error);
});



