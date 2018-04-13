var mysql = require('mysql');

var pool  = mysql.createPool({
    connectionLimit : 1000,
    connectTimeout  : 60 * 60 * 1000,
    acquireTimeout   : 60 * 60 * 1000,
    timeout         : 60 * 60 * 1000,
    host            : 'ec2-54-91-150-70.compute-1.amazonaws.com',
    user            : 'root',
    password        : 'bitrate',
    database        : 'bitrate'
});

/**
 * Returns all coins that are being tracked
 *
 * @param callback {error, object} error if unsuccessful object if successful
 *
 * @returns
 *  [
 *      RowDataPacket {
 *          id: {String},
 *          name: {String},
 *      },
 *      RowDataPacket {
 *          ....
 *      }
 *  ]
 */
function getAllCurrencies() {
    return new Promise(function(resolve, reject) {
        var query = "SELECT id, name FROM currency";

        pool.query(query, function (err, results) {
            if(err)
                reject(err);
            else
                resolve(results);
        });
    });
}

/**
 * Returns all coin data between two dates
 *
 * @param startDate {Date} start of period
 * @param endDate {Date} end of period
 * @param callback {error, object} error if unsuccessful object if successful
 *
 * @returns
 *  [
 *      RowDataPacket {
 *          currency_id: {String},
 *          name: {String},
 *          date: {Date},
 *          price_us_dollars: {Number},
 *          number_of_searches : {Number},
 *          number_of_mentions : {Number}
 *      },
 *      RowDataPacket {
 *          ....
 *      }
 *  ]
 */
function getAllDataBetweenfunction(startDate, endDate) {
    return new Promise(function(resolve, reject){
        verifyDate(startDate);
        verifyDate(endDate);

        var query = {
            sql:
            'SELECT currency_id, name, DATE_FORMAT(date, \'%m-%d-%Y\') as date, price_us_dollars, ' +
                'google_searches, twitter_mentions ' +
            'FROM day_index INNER JOIN ' +
            'currency ON day_index.currency_id = currency.id' +
            'WHERE date >= ? ' +
            'AND date <= ?'
        };

        pool.query(query, [startDate, endDate], function (err, results){
            if(err)
                reject(err);
            else
                resolve(results);
        });
    });
}

function getCurrency(currency_id) {
    return new Promise(function(resolve, reject){
        verifyCurrencyId(currency_id);

        var query = {
            sql:
            'SELECT * ' +
            'FROM currency ' +
            'WHERE id = ?'
        };

        pool.query(query, [currency_id], function (err, currency){
            if(err)
                reject(err);
            else if (currency.length != 1)
                resolve(null);
            else
                resolve(currency[0]);
        });
    });
}

function getDayIndex(currency_id, date) {
    return new Promise(function(resolve, reject) {
        verifyCurrencyId(currency_id);
        verifyDate(date);

        var query = {
            sql:
            'SELECT * ' +
            'FROM day_index ' +
            'WHERE currency_id = ? ' +
            'AND date = ?'
        };

        pool.query(query, [currency_id, date], function (err, results) {
            if (err)
                reject(err);
            else if (results.length != 1)
                resolve(null);
            else
                resolve(results[0]);
        });
    });
}

function createDayIndex(currency_id, date, price, google_searches, twitter_mentions){
    return new Promise(function(resolve, reject) {
        verifyCurrencyId(currency_id);
        verifyDate(date);
        verifyNumber(price,'price');
        verifyNumber(google_searches, 'google_searches');
        verifyNumber(twitter_mentions, 'twitter_mentions');

        var query = {
            sql:
            'INSERT INTO day_index (currency_id, date, price_us_dollars, google_searches, twitter_mentions) ' +
            'Values (?, ?, ?, ?, ?)'
        };

        pool.query(query, [currency_id, date, price, google_searches, twitter_mentions], function (err, results) {
            if (err)
                reject(err);
            else
                resolve(results);
        });
    });
}

function updateDayIndex(currency_id, date, price, google_searches, twitter_mentions){
    return new Promise(function(resolve, reject) {
        verifyCurrencyId(currency_id);
        verifyDate(date);
        verifyNumber(price,'price');
        verifyNumber(google_searches, 'google_searches');
        verifyNumber(twitter_mentions, 'twitter_mentions');

        var query = {
            sql:
            'UPDATE day_index ' +
            'SET price_us_dollars = ?, google_searches = ?, twitter_mentions = ? ' +
            'WHERE currency_id = ? AND date = ?'
        };

        pool.query(query, [price, google_searches, twitter_mentions, currency_id, date], function (err, results) {
            if (err)
                reject(err);
            else
                resolve(results);
        });
    });
}

function updateData(currency_id, date, price, google_searches, twitter_mentions){
    return new Promise(function(resolve, reject) {
        verifyCurrencyId(currency_id);
        verifyDate(date);
        verifyNumber(price,'price');
        verifyNumber(google_searches, 'google_searches');
        verifyNumber(twitter_mentions, 'twitter_mentions');

        getCurrency(currency_id)
            .then(
                function(currency) {
                    if(currency == null)
                        return Promise.reject('Currency not found');
                    else
                        return getDayIndex(currency['id'], date);
                }
            ).then(
                function(day_index){
                    if(day_index == null){
                        console.log('day index not found creating it');
                        return createDayIndex(currency_id, date, price, google_searches, twitter_mentions);
                    }
                    else{
                        console.log('day index found, updating it');
                        return updateDayIndex(currency_id, date, price, google_searches, twitter_mentions);
                    }
                }
            )
            .catch(
                function(err){
                    console.log('failed ' + err);
                    return reject(err);
                }
            )
    });
}

function verifyCurrencyId(currency_id) {
    if(currency_id == null)
        throw 'Parameter currency_id cannot be null';
    if(typeof currency_id != 'string')
        throw 'Parameter currency_id must be a string';
    else if(currency_id.length != 3)
        throw 'Parameter currency_id must be of length 3';
}

function verifyDate(date){
    if(date == null)
        throw 'Parameter date cannot be null';
    else if(!(date && Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date)))
        throw 'Parameter date must be a date object'
    else
        date.setHours(0,0,0,0);
}

function verifyNumber(number, parameter){
    if(number != null && typeof number != 'number')
        throw 'Parameter ' + parameter + ' must be a number';
}
