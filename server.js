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
            dateTime = dateTime.toLocaleString();
            var data_214 = $("a[data-id~='214']").parent().text().match(/\(([^)]+)\)/)[1].replace(",","");
            var data_212 = $("a[data-id~='212']").parent().text().match(/\(([^)]+)\)/)[1].replace(",","");
            var data_211 = $("a[data-id~='211']").parent().text().match(/\(([^)]+)\)/)[1].replace(",","");
            var data_215 = $("a[data-id~='215']").parent().text().match(/\(([^)]+)\)/)[1].replace(",","");
            var data_213 = $("a[data-id~='213']").parent().text().match(/\(([^)]+)\)/)[1].replace(",","");
            var data_216 = $("a[data-id~='216']").parent().text().match(/\(([^)]+)\)/)[1].replace(",","");
            
            json.data = [dateTime, data_214, data_212, data_211, data_215, data_213, data_216];
        }
        fs.appendFile('offering.json', json.data + "\n", function(err){
            console.log('Data saved.');
        })
    })
}




function visitObj(file, index) {
    var array = fs.readFileSync(file).toString().split("\n");
    if (array[index]) {
        var url = array[index];
        console.log(url);
    } else {
        return;
    }
    request("http://www.kijiji.ca" + url, function(error, response, html){
        if(!error){
            var $ = cheerio.load(html);
            var visits = $(".ad-visits").text();//.replace(",","")
            console.log("_" + visits + "_");
            setTimeout(function() {
                visitObj(file, index+1);
            }, randomTargetTime(2, 5, 10), i);
        }
    });
}


function lookObj(page, file) {
    var url = "http://www.kijiji.ca/b-apartments-condos/ottawa/page-" + page + "/c37l1700185?ad=offering";
    if (page > 5) {
        return;
    }
    var lines = fs.readFileSync(file).toString().split("\n");
    request(url, function(error, response, html){
        if(!error){
            var $ = cheerio.load(html);
            var objUrl;
            var obj = $("table.regular-ad");
            var objCount = obj.length;
            var now = new Date();
            $(obj.get().reverse()).each(function(index){
                objUrl = $(this).attr("data-vip-url");
                objPosted = $(this).find("td.posted").text();
                if (objPosted.indexOf("minutes") > -1) {
                    var minutes = parseInt(objPosted.match(/[0-9]+/g));
                    var num = objUrl.match(/\b\d{9}\b/g)[0];
                    var dateTime = new Date(now - minutes * 60000);
                } else {
                    return;
                }
                
                var data = objUrl + " | " + dateTime.toLocaleDateString() + " | " + dateTime.toLocaleTimeString();
                
                // SAVE
                var write = false;
                for (var line = 0; line < lines.length; ++line) {
                    if (lines[line].indexOf(objUrl) > -1) {
                        lines[line] = data;
                        write = true;
                        break;
                    }
                }
                if (!write) lines.unshift(data);
                
                
                
                if (index == objCount-1) {
                    setTimeout(function() {
                        lookObj(page+1, file);
                    }, randomTargetTime(5, 15, 20));
                }
            });
            
            fs.writeFile(file, lines.join("\n"), function(err) {});
            console.log('Page ' + page + ' saved.');
        }
    });
    
    
}
//timeOut();
lookObj(1,"test2.txt");
//visitObj("test2.txt",0);