//node.js - purdue-covid19
//api for confirming email addresses

const express = require('express');
const app = express();

var crypto = require('crypto');

app.get('/', function (req, res) {
 res.send('You seem to be a little lost . . . ');
});

app.get('/signup', function (req, res) {
 let email = req.query.email;
 //check if the request seems valid
 if (!validateEmail(email)) res.send("Invalid email (could not be validated): " + email); 
 //check if the email has already been requested
 //check if the email is already on the list
 //send the signup email and add the random key to the map
 //make sure to delete key after 15 minutes
 //redirect user to successful signup page
 console.log(crypto.randomBytes(48).toString('hex'));
 res.send("Succesfully signed up: " + email);
});

app.get('/confirm', function (req, res) {
 let email = req.query.email;
 //check if the request matches the random key
 //add the user to the mailing list
 //redirect user to the confirm page
 res.send(email);
});

//amazing function from: https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

app.listen(process.env.PORT);
console.log("Started Server");
