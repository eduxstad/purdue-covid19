//node.js - purdue-covid19
//acts as an api for confirming email addresses

const express = require('express');
const app = express();
 
app.get('/', function (req, res) {
 res.send('You seem to be a little lost . . . ');
});

app.get('/signup', function (req, res) {
 let email = req.query.email;
 res.send(email);
});

console.log("Starting . . .");
app.listen(process.env.PORT);
