var express = require('express');
var fs = require('fs');
var app     = express();

app.get('/scrape', function(req, res){
    var content;
    fs.readFile('/root/obj.txt', function read(err, data) {
        if (err) throw err;
        res.header("Content-Type", "text/plain");
        res.send(data);
    }); 
})

app.listen('8081');
console.log('Magic happens on port 8081');
exports = module.exports = app;