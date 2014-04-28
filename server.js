var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

app.get('/scrape', function(req, res){
	
	url = 'http://www.kijiji.ca/b-apartments-condos/ottawa/c37l1700185';

	request(url, function(error, response, html){
		if(!error){
			var $ = cheerio.load(html);

			var json = {};

			var dateTime = new Date();
            dateTime = dateTime.toISOString();
            
            var data_214 = $("a[data-id~='214']").parent().text().match(/\(([^)]+)\)/)[1].replace(",","");
            var data_212 = $("a[data-id~='212']").parent().text().match(/\(([^)]+)\)/)[1].replace(",","");
            var data_211 = $("a[data-id~='211']").parent().text().match(/\(([^)]+)\)/)[1].replace(",","");
            var data_215 = $("a[data-id~='215']").parent().text().match(/\(([^)]+)\)/)[1].replace(",","");
            var data_213 = $("a[data-id~='213']").parent().text().match(/\(([^)]+)\)/)[1].replace(",","");
            var data_216 = $("a[data-id~='216']").parent().text().match(/\(([^)]+)\)/)[1].replace(",","");
            json.data = [dateTime, data_214, data_212, data_211, data_215, data_213, data_216];
            
		}
        
        fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){

        	console.log('File successfully written! - Check your project directory for the output.json file');

        })
        
        res.send('Check your console!')
	})
})

app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app;