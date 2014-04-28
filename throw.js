var express = require('express');
var fs = require('fs');
var app     = express();

app.get('/scrape', function(req, res){
    var content;
    // First I want to read the file
    fs.readFile('output.json', function read(err, data) {
        if (err) {
            throw err;
        }
        res.send(data);
    }); 
})

app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app;