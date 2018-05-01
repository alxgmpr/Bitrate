const express = require('express');
const apiCrawler = require('./api-crawler.js');
const sqlWrapper = require('./sql-wrapper.js');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules/jquery/dist/')));
app.use(express.static(path.join(__dirname, 'node_modules/bootstrap-datepicker/dist/')));
app.use(express.static(path.join(__dirname, 'node_modules/mdbootstrap/css/')));
app.use(express.static(path.join(__dirname, 'node_modules/mdbootstrap/js/')));
app.use(express.static(path.join(__dirname, 'node_modules/mdbootstrap/img/')));

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/index.html');
});

app.get('/get_data_between', function(req, res) {
    if(!req.query.startDate || !req.query.endDate || !req.query.currencyId) {
        res.sendStatus(500);
    } else {
        sqlWrapper.GetAllDataBetween(req.query.currencyId, req.query.startDate, req.query.endDate)
            .then(function(response) {
                res.send(response)
            })
            .catch(function(err){
                res.send(err)
            });
    }
})

app.listen(3000, function() {console.log('Server running on port 3000')});