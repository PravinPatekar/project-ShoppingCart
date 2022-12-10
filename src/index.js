const express = require('express');
const route = require('./routes/route.js');
const mongoose = require('mongoose');
const app = express();
const multer = require("multer")

app.use(express.json());
app.use(multer().any());

mongoose.connect("mongodb+srv://Madhurilenka:Madhuri1998@cluster0.zcysdvm.mongodb.net/group62Database", {
    useNewUrlParser: true

})
    .then(() => console.log("MongoDb is connected"))
    .catch(err => console.log(err))

app.use('/', route);


// USING THIS FUNCTION TO HANDLE INVALID ENDPOINTS BY USERS
route.all("/*", function (req, res) {   
    res.status(404).send({
        status: false,
        msg: "URL NOT FOUND!"
    })
})

app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});