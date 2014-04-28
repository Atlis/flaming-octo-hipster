var express = require('express');
var fs = require('fs');
var app     = express();

app.get('/scrape', function(req, res){
    fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){
        console.log('File successfully written! - Check your project directory for the output.json file');
    })
    
    res.send('Check your console!')
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