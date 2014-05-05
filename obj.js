var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
/* var random = require('./random');

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
        lookObj(1,"/root/obj.txt");
    }, randomTargetTime(2, 10, 18));
} */

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
                
                // RETRIEVE DATA
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
                
                // WRITE
                var write = false;
                for (var line = 0; line < lines.length; ++line) {
                    if (lines[line].indexOf(objUrl) > -1) {
                        lines[line] = data;
                        write = true;
                        break;
                    }
                }
                if (!write) lines.unshift(data);
                
                // GO TO NEXT PAGE
                if (index == objCount-1) {
                    setTimeout(function() {
                        lookObj(page+1, file);
                    }, randomTargetTime(5, 15, 20));
                }
            });
            
            // SAVE
            fs.writeFile(file, lines.join("\n"), function(err) {});
            console.log('Page ' + page + ' saved.');
        }
    });
    
    
}

lookObj(1,"/root/obj.txt");
//timeOut();