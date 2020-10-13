//node.js - purdue-covid19
//api for confirming email addresses

const express = require('express');
const app = express();

var crypto = require('crypto');

var requested = new Object();

app.get('/', function (req, res) {
 res.send('You seem to be a little lost . . . ');
});

app.get('/signup', function (req, res) {
 let email = req.query.email;
 //check if the request seems valid (potentially remove this)?
 if (!validateEmail(email)) {
  res.send("The email address " + email + " could not be validated. Please enter a valid email address.");
  return;
 }
 //check if the email has already been requested
 if (requested[email] != null) {
  res.send("The email address " + email + " has already been requested. Check your email to confirm the request.");
  return;
 }
 //check if the email is already on the list
 //add the email and random key to the map
 key = crypto.randomBytes(48).toString('hex');
 requested[email] = key;
 //send the signup email
 //make sure to delete key after 15 minutes
 setTimeout(() => {console.log("Deleting " + email); }, 2000);
 //redirect user to successful signup page
 console.log(crypto.randomBytes(48).toString('hex'));
 res.send("Succesfully requested " + email + ". Check your email to confirm the request.");
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
