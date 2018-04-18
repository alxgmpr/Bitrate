const express = require('express');
const apiCrawler = require('./api-crawler.js');
const sqlWrapper = require('./sql-wrapper.js');
const app = express();

apiCrawler.StartStreamCapturing();

app.get('/', function(req, res) {
    const endTime = new Date();
    const startTime = new Date(new Date().getTime() - (7 * 24 * 60 * 60 * 1000));
    sqlWrapper.GetAllDataBetween(startTime, endTime)
        .then(
            function(results){
                res.send(results);
            }
        );
});

app.listen(3000, function() {console.log('Server running on port 3000')});