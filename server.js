var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var random = require('./random');

function randomTargetTime(minTime, targetTime, maxTime) {
    i = 0;
    while (i < 100) {
        var seed = Math.ceil(Math.random()*10000);
        var rand = new random.Random(seed);
        // Random.weibull(Scale, Shape)
        var randomTime = rand.weibull(targetTime, 2);
        // Applies bounds
        if (randomTime > minTime && randomTime < maxTime) {
            return randomTime*1000;
        }
        i ++;
        console.log(i);
    }
    console.log('Error: Too many iterations.');
}

function timeOut() {
    setTimeout(function() {
        retrieveData();
    }, randomTargetTime(2, 10, 18));
}

function retrieveData() {
    url = 'http://www.kijiji.ca/b-apartments-condos/ottawa/c37l1700185?ad=offering';
    request(url, function(error, response, html){
        if(!error){
            var $ = cheerio.load(html);
            var json = {};
            var dateTime = new Date();
            dateTime = dateTime.toLocaleDateString() + " | " + dateTime.toLocaleTimeString();
            var data_214 = $("a[data-id~='214']").parent().text().match(/\(([^)]+)\)/)[1].replace(",","");
            var data_212 = $("a[data-id~='212']").parent().text().match(/\(([^)]+)\)/)[1].replace(",","");
            var data_211 = $("a[data-id~='211']").parent().text().match(/\(([^)]+)\)/)[1].replace(",","");
            var data_215 = $("a[data-id~='215']").parent().text().match(/\(([^)]+)\)/)[1].replace(",","");
            var data_213 = $("a[data-id~='213']").parent().text().match(/\(([^)]+)\)/)[1].replace(",","");
            var data_216 = $("a[data-id~='216']").parent().text().match(/\(([^)]+)\)/)[1].replace(",","");
            
            json.data = [dateTime, data_214, data_212, data_211, data_215, data_213, data_216];
        }
        fs.appendFile('/root/offering.txt', json.data + "\n", function(err){
            console.log('Data saved.');
        })
    })
}

timeOut();