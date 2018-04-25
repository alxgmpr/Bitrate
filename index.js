const express = require('express');
const apiCrawler = require('./api-crawler.js');
const sqlWrapper = require('./sql-wrapper.js');
const app = express();

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/index.html');
});

app.get('/get_data', function(req, res) {
    if(!req.query.start || !req.query.end || !req.query.currency) {
        res.sendStatus(500);
    } else {
        sqlWrapper.GetAllDataBetween(req.query.currency, req.query.start, req.query.end)
            .then(function(response) {
                res.send(response)
            });
    }

})

app.listen(3000, function() {console.log('Server running on port 3000')});