/**
 * @typedef {Object} currency
 * @property {string} id The 3 letter abbreviation of the currency
 * @property {string} name The name of the currency
 *
 * @typedef {object} day_index
 * @property {string} currency_id The 3 letter abbreviation of the currency
 * @property {object} date The date object of when the data recording happened
 * @property {number} price_us_dollars The price in US dollars of the currency during the date of recording
 * @property {number} google_searches The number of google searches during the date of recording
 * @property {number} twitter_mentions The number of twitter mentions during the date of recording
 */

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
 * Get all currencies in the database
 * @returns {Promise.<[currency]>} Array of currencies
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
 * Gets all coin data between two dates
 * @param startDate {Date} Start of period
 * @param endDate {Date} End of period
 * @returns {Promise.<[day_index]>} Array of day_indexes
 */
function getAllDataBetweenfunction(startDate, endDate) {
    return new Promise(function(resolve, reject){
        verifyDate(startDate);
        verifyDate(endDate);

        var query = {
            sql:
            'SELECT currency_id, DATE_FORMAT(date, \'%m-%d-%Y\') as date, price_us_dollars, ' +
                'google_searches, twitter_mentions ' +
            'FROM day_index ' +
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

/**
 * Gets a currency object from a currency_id
 * @param currency_id The currency_id of the desired currency
 * @returns {Promise.<currency>} The desired currency, null if not found
 */
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
            else if (currency.length !== 1)
                resolve(null);
            else
                resolve(currency[0]);
        });
    });
}

/**
 * Gets day_index object from a currency_id and date
 * @param currency_id The currency_id of the desired currency
 * @param date The date the data was recorded on
 * @returns {Promise.<day_index>} The day_index of the currency, null if not found
 */
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
            else if (results.length !== 1)
                resolve(null);
            else
                resolve(results[0]);
        });
    });
}

/**
 * Creates day index from existing data
 * @param currency_id The currency_id of the desired currency
 * @param date The date the data was recorded
 * @param price_us_dollars The price in US dollars of the currency on the given date
 * @param google_searches The number of google searches of the currency on the given date
 * @param twitter_mentions The number of mentions on twitter of the currency on the given date
 * @returns {Promise.<int>} 1 if successful
 */
function createDayIndex(currency_id, date, price_us_dollars, google_searches, twitter_mentions){
    return new Promise(function(resolve, reject) {
        verifyCurrencyId(currency_id);
        verifyDate(date);
        verifyNumber(price_us_dollars,'price_use_dollars');
        verifyNumber(google_searches, 'google_searches');
        verifyNumber(twitter_mentions, 'twitter_mentions');

        var query = {
            sql:
            'INSERT INTO day_index (currency_id, date, price_us_dollars, google_searches, twitter_mentions) ' +
            'Values (?, ?, ?, ?, ?)'
        };

        pool.query(query, [currency_id, date, price_us_dollars, google_searches, twitter_mentions], function (err, results) {
            if (err)
                reject(err);
            else
                resolve(results);
        });
    });
}

/**
 * Updates day index with new data
 * @param currency_id The currency_id of the existing day index
 * @param date The date the data was recorded
 * @param price_us_dollars The price in US dollars of the currency on the given date
 * @param google_searches The number of google searches of the currency on the given date
 * @param twitter_mentions The number of mentions on twitter of the currency on the given date
 * @returns {Promise.<int>} 1 if successful
 */
function updateDayIndex(currency_id, date, price_us_dollars, google_searches, twitter_mentions){
    return new Promise(function(resolve, reject) {
        verifyCurrencyId(currency_id);
        verifyDate(date);
        verifyNumber(price_us_dollars,'price_us_dollars');
        verifyNumber(google_searches, 'google_searches');
        verifyNumber(twitter_mentions, 'twitter_mentions');

        var query = {
            sql:
            'UPDATE day_index ' +
            'SET price_us_dollars = ?, google_searches = ?, twitter_mentions = ? ' +
            'WHERE currency_id = ? AND date = ?'
        };

        pool.query(query, [price_us_dollars, google_searches, twitter_mentions, currency_id, date], function (err, results) {
            if (err)
                reject(err);
            else
                resolve(results);
        });
    });
}

/**
 * Updates data in database, insuring integrity of data
 * @param currency_id The currency_id of the desired currency
 * @param date The date the data was recorded
 * @param price_us_dollars The price in US dollars of the currency on the given date
 * @param google_searches The number of google searches of the currency on the given date
 * @param twitter_mentions The number of mentions on twitter of the currency on the given date
 * @returns {Promise.<int>} 1 if successful
 */
function updateData(currency_id, date, price_us_dollars, google_searches, twitter_mentions){
    return new Promise(function(resolve, reject) {
        verifyCurrencyId(currency_id);
        verifyDate(date);
        verifyNumber(price_us_dollars,'price_us_dollars');
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
                        return createDayIndex(currency_id, date, price_us_dollars, google_searches, twitter_mentions);
                    }
                    else{
                        console.log('day index found, updating it');
                        return updateDayIndex(currency_id, date, price_us_dollars, google_searches, twitter_mentions);
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

/**
 * Verifies that the currency_id parameter is correct data type
 * @param currency_id The currency_id user input
 */
function verifyCurrencyId(currency_id) {
    if(currency_id == null)
        throw 'Parameter currency_id cannot be null';
    if(typeof currency_id !== 'string')
        throw 'Parameter currency_id must be a string';
    else if(currency_id.length !== 3)
        throw 'Parameter currency_id must be of length 3';
}

/**
 * Verifies that the date parameter is correct data type
 * @param date date user input
 */
function verifyDate(date){
    if(date == null)
        throw 'Parameter date cannot be null';
    else if(!(date && Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date)))
        throw 'Parameter date must be a date object'
    else
        date.setHours(0,0,0,0);
}

/**
 * Verifies that the number parameter is correct data type
 * @param number The user input
 * @param parameter The type of parameter the number is (for error logging)
 */
function verifyNumber(number, parameter){
    if(number != null && typeof number !== 'number')
        throw 'Parameter ' + parameter + ' must be a number';
}
