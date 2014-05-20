'use strict';

var system = require('system');
var fs = require('fs');
var page = require('webpage').create();
var random = require('./random');


// DATE AND TIME FUNCTIONS
function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}

function getDate(date) {
    return date.getFullYear() + "-" + pad(date.getMonth()+1,2) + "-" + pad(date.getDate(),2);
}

function getTime(date) {
    return pad(date.getHours(),2) + ":" + pad(date.getMinutes(),2) + ":" + pad(date.getSeconds(),2);
}


// RANDOM FUNCTIONS

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

function timeOut(ad) {
    var targetTime = system.os.name == 'windows' ? randomTargetTime(2, 3, 5) : randomTargetTime(5, 30, 55);
    setTimeout(function() {
        visitAd(ad);
    }, targetTime);
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
            
            // Waits 5 seconds before logging.
            setTimeout(function() {
                // Logs the ad page for the number of visits and the location (latitude, longitude).
                var data = page.evaluate(function() {
                    var data = {};
                    data.visits = parseInt($(".ad-visits").text().replace(/,/g, ""));
                    data.lat = $("meta[property='og:latitude']").attr("content");
                    data.lng = $("meta[property='og:longitude']").attr("content");
                    data.expired = $(".expired-ad-container").length ? true : false;
                    return data;
                });
                
                // Creates a log.
                var log = {};
                var now = new Date();
                if (data.expired) {
                    log.date = getDate(now);
                    log.time = getTime(now);
                    log.status = "expired";
                    ad.tag = "expired";
                }
                else if (typeof(data.visits) == 'undefined' || data.visits == null) {
                    log.date = getDate(now);
                    log.time = getTime(now);
                    log.status = "cannot log visits";
                    // Althought the visits info isn't there, it might get back later.
                    // So we go on with logging.
                    //ad.tag = null;
                } else {
                    if (typeof(ad.lat) == 'undefined' || ad.lat == null) ad.lat = data.lat;
                    if (typeof(ad.lng) == 'undefined' || ad.lng == null) ad.lng = data.lng;
                    log.date = getDate(now);
                    log.time = getTime(now);
                    log.visits = data.visits;
                }

                // Saves the log.
                if (typeof(ad.log) == 'undefined' || ad.log == null) ad.log = [];
                ad.log.push(log);

                // Save the ad.
                writeJSON(ad);
                });
            }, 5000);
            
    });
}

function writeJSON(ad) {
  ad = ad;
  var dataJSON = JSON.stringify(adsList, null, "\t");
  fs.write(adsListFile, dataJSON, function(e) {});
  phantom.exit();
}

var city = "ville-de-montreal";
var filePath = system.os.name == 'windows' ? "./data/" : "/root/data/";
var adsListFile =  filePath + "ads-" + city + ".json";
var adsList = readJSON(adsListFile);
var count = adsList.length;


// Chooses the ad to log according to an exponential decay function.
// So it log recent ads more often then old ones.
// The n parameter as to be set correctly.
// The smaller it is, the more are recent ads going to be logged.
// On the contrary, the larger it is, the more are old ads going to be logged.
var n = 20; // (10)
for (var i = 0; i < count; ++i) {
    var ad = adsList[i];
    if (typeof(ad.tag) == 'undefined' || ad.tag == null) {} else {
        if (ad.tag.indexOf("log") > -1) {
            if (getRandomInt(0, n - 1) == 0) {
                timeOut(ad);
                break;
            }
        }
    }
    if (i == count - 1) phantom.exit();
}

/*
// Chooses the ads to log accroding to a flat function. 
for (var i = 0; i < 100; ++i) {
    var ad = adsList[getRandomInt(0, count-1)];
    if (typeof(ad.tag) == 'undefined' || ad.tag == null) {} else {
        if (ad.tag.indexOf("log") > -1) {
            timeOut(ad);
            break;
        }
    }
} */