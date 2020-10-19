//node.js - purdue-covid19
//api for confirming email addresses

const express = require('express');
const app = express();
var crypto = require('crypto');
var mailgun = require('mailgun-js')({apiKey: process.env.MAILGUN_KEY, domain: "purduecovid19.email"});
var list = mailgun.lists('dashboard@purduecovid19.email');

var requested = new Object();


app.get('/', function (req, res) {
 res.send('You seem to be a little lost . . . ');
});

app.get('/signup', async function (req, res) {
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
 var subscribed = false;
 await list.members(email).info().then(function (data) {
  subscribed = data.member.subscribed;
 }).catch(error => console.log("Couldn't poll member.")); //fail gracefully if not found on list
 if (subscribed) {
   res.send("The email address " + email + " is already subscribed to the list.");
   return;
 } 
 //add the email and random key to the map
 key = crypto.randomBytes(24).toString('hex');
 requested[email] = key;
 variables = '{"key": "' + key + '", "email": "' + email +'" }';
 console.log(variables);
 //send the signup email
 const confirm_email = {
   from: "Purdue COVID-19 Dashboard <dashboard@purduecovid19.email>",
   to: email,
   subject: "Confirm Purdue COVID-19 Dashboard Subscription",
   template: "confirm_dashboard",
   'h:X-Mailgun-Variables': variables
 };
 mailgun.messages().send(confirm_email, function (error, body) {
  if (error) console.log(error);
 });
 //make sure to delete key after 15 minutes
 setTimeout(() => {console.log("Removing " + email + " from requested emails"); delete requested[email]; }, 1200000);
 //redirect user to successful signup page
 res.send("Succesfully requested " + email + ". Check your email to confirm the request.");
});

app.get('/confirm', function (req, res) {
 let key = req.query.key;
 let email = req.query.email;
 //check if the request matches the random key
 if ( requested[email] != key ) {
  res.send("We couldn't complete the request, please try signing up again."); 
  return;
 }
 //add the user to the mailing list
 var user = {
  subscribed: true,
  address: email,
 };
 list.members().create(user,function (error, data) {
  if (error) console.log(error);
 });
 //redirect user to the confirm page
 res.send(email + " has been subscribed to the mailing list!");
});

//amazing function from: https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

app.listen(process.env.PORT);
console.log("Started Server");
