//node.js - purdue-covid19
//api for confirming email addresses

const express = require('express');
const app = express();
 
app.get('/', function (req, res) {
 res.send('You seem to be a little lost . . . ');
});

app.get('/signup', function (req, res) {
 let email = req.query.email;
 //check if the request seems valid
 //check if the email has already been requested
 //check if the email is already on the list
 //send the signup email and add the random key to the map
 //make sure to delete key after 15 minutes
 //redirect user to successful signup page
 res.send(email);
});

app.get('/confirm', function (req, res) {
 let email = req.query.email;
 //check if the request matches the random key
 //add the user to the mailing list
 //redirect user to the confirm page
 res.send(email);
});


console.log("Starting . . .");
app.listen(process.env.PORT);
