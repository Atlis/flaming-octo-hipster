'use strict';

var system = require('system');
var fs = require('fs');
var page = require('webpage').create();




// RANDOM FUNCTIONS
var random = require('./random');

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}



// Reads a JSON file and outputs the object.
function readJSON(file) {
    var content = '';
    var f = null;
    try {
        f = fs.open(file, "r");
        content = f.read();
    } catch (e) {
        console.log(e);
    }
    if (f) f.close();
    if (content) return JSON.parse(content);
}



// Logs additional data in relation with a specific ad.
function visitAd(ad) {
    console.log(ad.url);
    var url = "http://www.zkzizjzizjzi.ca".replace(/z/g,"");
    page.open(url + ad.url, function() {
      page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function() {
        
        // Scrape the ad page for the number of visits and the location (latitude, longitude).
        var data = page.evaluate(function() {
            var visits = parseInt($(".ad-visits").text());
            var lat = $("meta[property='og:latitude']").attr("content");
            var lng = $("meta[property='og:longitude']").attr("content");
            var data = {};
            data.visits = visits;
            data.lat = lat;
            data.lng = lng;
            return data;
        });
        
        // Creates a log.
        var log = {};
        var now = new Date();
        if (typeof(data.visits) == 'undefined' || data.visits == null ||
            typeof(data.lat) == 'undefined' || data.lat == null ||
            typeof(data.lng) == 'undefined' || data.lng == null) {
            log.date = now.toLocaleDateString();
            log.time = now.toLocaleTimeString();
            log.status = "deleted";
        } else {
            if (typeof(ad.lat) == 'undefined' || ad.lat == null) ad.lat = data.lat;
            if (typeof(ad.lng) == 'undefined' || ad.lng == null) ad.lng = data.lng;
            log.date = now.toLocaleDateString();
            log.time = now.toLocaleTimeString();
            log.visits = data.visits;
        }
        
        // Saves the log.
        if (typeof(ad.log) == 'undefined' || ad.log == null) ad.log = [];
        ad.log.push(log);
        
        // Save the ad.
        writeJSON(ad);
      });
    });
}

function writeJSON(ad) {
  ad = ad;
  var dataJSON = JSON.stringify(adsList, null, "\t");
  fs.write(adsListFile, dataJSON, function(e) {});
  phantom.exit();
}

var city = "ottawa";
var adsListFile = "data-" + city + "-post.txt";
var adsList = readJSON(adsListFile);
var count = adsList.length;

i = 0;
for (var i = 0; i < 100; ++i) {
    var ad = adsList[getRandomInt(0, count-1)];
    if (typeof(ad.tag) == 'undefined' || ad.tag == null) {} else {
        if (ad.tag.indexOf("log") > -1) {
            if (typeof(ad.log) == 'undefined' || ad.log == null) {
                visitAd(ad);
                break;
            } else {
                if (ad.log[ad.log.length - 1].status != 'deleted') {
                    visitAd(ad);
                    break;
                }
            }
        }
    }
}