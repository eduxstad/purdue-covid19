//node.js - purdue-covid19
//api for confirming email addresses
//bump to update repository

const express = require('express');
const app = express();
var crypto = require('crypto');
var mailgun = require('mailgun-js')({apiKey: (process.env.MAILGUN_KEY || 'null'), domain: "boilerdashboard.net"});
var list = mailgun.lists('daily@boilerdashboard.net');
var weekly = mailgun.lists('weekly@boilerdashboard.net');

var mainUrl = "https://boilerdashboard.net/";
var dashboardUrl = "https://tableau.itap.purdue.edu/t/public/views/COVIDPublicDashboard/Testing?:embed=y&:showVizHome=no&:host_url=https%3A%2F%2Ftableau.itap.purdue.edu%2F&:embed_code_version=3&:tabs=no&:toolbar=no&:iid=4&:isGuestRedirectFromVizportal=y&:display_spinner=no&:loadOrderID=0";

var requested = new Object();

//setup main page
app.use('/', express.static('index'));

app.get('/signup', async function (req, res) {
  let email = req.query.email;
  let listChoice = req.query.list;
  //check if the request seems valid (potentially remove this)?
  if (!validateEmail(email)) {
    res.redirect(mainUrl + "?message=" + "The email address " + email + " could not be validated. Please enter a valid email address.");
    return;
  }
  //check if the email has already been requested
  if (requested[email] != null) {
    //res.send("The email address " + email + " has already been requested. Check your email to confirm the request.");
    res.redirect(mainUrl + "?message=" + "The email address " + email + " has already been requested. Check your email to confirm the request.");
    return;
  }
  //check if the email is already on the list
  var subscribed = false;
  if (listChoice == 'daily') {
    await list.members(email).info().then(function (data) {
      subscribed = data.member.subscribed;
    }).catch(error => console.log("Couldn't poll member.")); //fail gracefully if not found on list
    if (subscribed) {
      res.redirect(mainUrl + "?message=" + "The email address " + email + " is already subscribed to the list.");
      return;
    } 
  } else if (listChoice == 'weekly') {
    await weekly.members(email).info().then(function (data) {
      subscribed = data.member.subscribed;
    }).catch(error => console.log("Couldn't poll member.")); //fail gracefully if not found on list
    if (subscribed) {
      res.redirect(mainUrl + "?message=" + "The email address " + email + " is already subscribed to the list.");
      return;
    }
  } else {
    res.redirect(mainUrl + "?message=" + "That list could not be found, please try again.");
    return;
  }
  //add the email and random key to the map
  key = crypto.randomBytes(24).toString('hex');
  requested[email] = { key: key, list: listChoice};
  variables = '{"key": "' + key + '", "email": "' + email +'" }';
  //console.log(variables);
  //send the signup email
  let confirm_email = {
    from: "Purdue COVID-19 Dashboard <dashboard@boilerdashboard.net>",
    to: email,
    subject: "Confirm Purdue COVID-19 Dashboard Subscription",
    template: "confirm_dashboard",
    'h:X-Mailgun-Variables': variables
  };
  if (listChoice == 'weekly') {
    confirm_email.template = "confirm_weekly_dashboard";
  }
  mailgun.messages().send(confirm_email, function (error, body) {
    if (error) console.log(error);
  });
  //make sure to delete key after 25 minutes
  setTimeout(() => {
    console.log("Removing " + email + " from requested emails"); 
    if (requested[email] != null) { delete requested[email]; } 
  }, 1500000);
  //redirect user to successful signup page
  res.redirect(mainUrl + "?message=" + "Succesfully requested " + email + ". Check your email to confirm the request.");
});

app.get('/confirm', function (req, res) {
  let key = req.query.key;
  let email = req.query.email;
  //check if the request matches the random key
  if ( requested[email].key != key ) {
    res.redirect(mainUrl + "?message=" + "We couldn't complete the request, please try signing up again."); 
    return;
  }
  //add the user to the mailing list
  var user = {
    subscribed: true,
    address: email,
  };
  switch (requested[email].list) {
    case 'daily':
      list.members().create(user,function (error, data) {
        if (error) { //member already exists, just update the subscribed var
          console.log(error);
          list.members(user.address).update(user, function (error, data) {
            if (error) console.log(error);
          });
        }
      });
      //redirect user to the confirm page
      res.redirect(mainUrl + "?message=" + email + " has been subscribed to the daily mailing list!");
      break;
    case 'weekly':
      weekly.members().create(user,function (error, data) {
        if (error) { //member already exists, just update the subscribed var
          console.log(error);
          weekly.members(user.address).update(user, function (error, data) {
            if (error) console.log(error);
          });
        }
      });
      //redirect user to the confirm page
      res.redirect(mainUrl + "?message=" + email + " has been subscribed to the weekly mailing list!");
      break;
    default:
      res.redirect(mainUrl + "?message=" + "Invalid list. You can try signing up again.");
  }
  //cleanup email for another request
  delete requested[email];
});

app.get('/dashboard', async function (req, res) {
  res.redirect(dashboardUrl);
  return;
});

//amazing function from: https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

app.listen(process.env.PORT || 4040); //use port 4040 if env port is not specified
console.log("Started Server");
