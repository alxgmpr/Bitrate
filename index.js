const express = require('express');
const apiCrawler = require('./api-crawler.js');
const sqlWrapper = require('./sql-wrapper.js');
const app = express();

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/index.html');
});

app.listen(3000, function() {console.log('Server running on port 3000')});