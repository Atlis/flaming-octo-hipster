'use strict';

var fs = require('fs');
var os = require('os');
var request = require('request');
var cheerio = require('cheerio');
var random = require('./random');


function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomTargetTime(minTime, targetTime, maxTime) {
    var i = 0;
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
        listingAds(7, fileName);
    }, randomTargetTime(2, 10, 18));
}


// Scrape the first pages of a category to save the newest ads.
function listingAds(page, file) {
    // Stops listing after 5 pages.
    if (page == 0) return;
    
    var adsList = JSON.parse(fs.readFileSync(file));
    
    var url = "http://www.zkzizjzizjzi.ca".replace(/z/g,"");
    url = url + "/b-apartments-condos/" + city.name + "/page-" + page + "/c37l" + city.code + "?ad=offering";
    request(url, function(error, response, html){
        if(!error){
            var $ = cheerio.load(html);
            var ads = $("table.regular-ad");
            var adsCount = ads.length;
            var adUrl;
            var adDateTime;
            var now = new Date();
            $(ads.get().reverse()).each(function(index){
                
                // Retrieves the url of the ad.
                adUrl = $(this).attr("data-vip-url");
                
                
                var write = false;
                for (var i = 0; i < adsList.length; ++i) {
                
                    // The following ad has already been inserted into the ads list.
                    if (adsList[i].url.indexOf(adUrl) > -1) {
                        
                        // Checks if the ad has a log tag.
                        // If so, it needs to be logged.
                        if (typeof(adsList[i].tag) == 'undefined' || adsList[i].tag == null) {} else {
                            if (adsList[i].tag.indexOf("log") > -1) {
                                
                                // Creates a new log entry.
                                var log = {};
                                log.date = now.toLocaleDateString();
                                log.time = now.toLocaleTimeString();
                                log.page = page;
                                
                                // The new log is added at the bottom of the logs array.
                                // If the logs array does not exist, it creates it.
                                if (typeof(adsList[i].log) == 'undefined' || adsList[i].log == null) {
                                    adsList[i].log = [];
                                }
                                adsList[i].log.push(log);
                            }
                        }
                        
                        write = true;
                        break;
                    }
                }
                
                // The following ad has not yet been inserted into the ads list.
                if (!write) {
                    
                    // Retrieves the publication time and date of the ad.
                    adDateTime = $(this).find("td.posted").text();
                    if (adDateTime.indexOf("minutes") > -1) {
                        var minutes = parseInt(adDateTime.match(/[0-9]+/g));
                        var num = adUrl.match(/\b\d{9}\b/g)[0];
                        var dateTime = new Date(now - minutes * 60000);
                        
                        // Creates a new ad entry.
                        var data = {};
                        data.url = adUrl;
                        data.date = dateTime.toLocaleDateString();
                        data.time = dateTime.toLocaleTimeString();
                        
                        // One out of n ads will be logged.
                        // The chosen ads receive a log tag so it is possible to trace them back.
                        var n = 15;
                        if (getRandomInt(0, n - 1) == 0) data.tag = "log";
                        
                        // The new ad is added at the top of the array.
                        adsList.unshift(data);
                    }
                }
                
                // Goes to next ads page.
                if (index == adsCount-1) {
                    setTimeout(function() {
                        listingAds(page - 1, file);
                    }, randomTargetTime(5, 15, 20));
                }
            });
            
            // Saves the ad list in JSON format.
            var dataJSON = JSON.stringify(adsList, null, "\t");
            fs.writeFile(fileName, dataJSON, function(e) {});
            console.log('Page ' + page + ' saved.');
        }
    });
}

var city = {}
city.name = "ville-de-montreal";
city.code = 1700281;

//city.name = "grand-montreal";
//city.code = 80002;

//city.name = "ottawa";
//city.code = 185;

var filePath = os.type() == 'Windows_NT' ? "" : "/root/";
var fileName = filePath + "ads-" + city.name + ".txt";

timeOut();