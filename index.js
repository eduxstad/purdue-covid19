//node.js - purdue-covid19
//acts as an api for confirming email addresses

const express = require('express');
const app = express();
 
app.get('/', function (req, res) {
 res.send('Hello World')
});

console.log("Starting . . .");
app.listen(3000);
