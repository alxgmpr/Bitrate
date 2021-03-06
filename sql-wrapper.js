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

const mysql = require('mysql');

const pool  = mysql.createPool({
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
module.exports.GetAllCurrencies = function() {
    return new Promise(function(resolve, reject) {
        const query = "SELECT id, name FROM currency";

        pool.query(query, function (err, results) {
            if(err)
                reject(err);
            else
                resolve(results);
        });
    });
};

/**
 * Gets all coin data between two dates
 * @param startDate {Date} Start of period
 * @param endDate {Date} End of period
 * @returns {Promise.<[day_index]>} Array of day_indexes
 */
module.exports.GetAllDataBetween = function(currencyId, startDate, endDate) {
    return new Promise(function(resolve, reject){
        try{
            VerifyDate(startDate)
            VerifyDate(endDate);
            VerifyCurrencyId(currencyId);
        } catch(exception){
            reject(exception);
        }

        const query = {
            sql:
            'SELECT date_range.date, price_us_dollars, google_activity, twitter_mentions\n' +
            'FROM ' +
                '(Select date from' +
                '(select adddate(\'1970-01-01\',t4.i*10000 + t3.i*1000 + t2.i*100 + t1.i*10 + t0.i) date from' +
                '(select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t0, ' +
                '(select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t1, ' +
                '(select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t2, ' +
                '(select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t3, ' +
                '(select 0 i union select 1 union select 2 union select 3 union select 4 union select 5 union select 6 union select 7 union select 8 union select 9) t4) v ' +
                'where date between ? and ?) as date_range ' +
            'LEFT JOIN ' +
                '(SELECT * ' +
                'FROM day_index ' +
                'WHERE currency_id = ?) as day_index ' +
            'ON date_range.date = day_index.date '
        };

        pool.query(query, [startDate, endDate, currencyId], function (err, results){
            if(err)
                reject(err);
            else{
                json = JSON.stringify(results)
                resolve(json);
            }
        });
    });
};

/**
 * Updates data in database, insuring integrity of data
 * @param currencyId The currency_id of the desired currency
 * @param date The date the data was recorded
 * @param priceUsDollars The price in US dollars of the currency on the given date
 * @param googleActivity The number of google searches of the currency on the given date
 * @param twitterMentions The number of mentions on twitter of the currency on the given date
 * @returns {Promise.<int>} 1 if successful
 */
module.exports.UpdateData = function(currencyId, date, priceUsDollars, googleActivity, twitterMentions){
    return new Promise(function(resolve, reject) {
        try{
            VerifyCurrencyId(currencyId);
            VerifyDate(date);
            VerifyNumber(priceUsDollars,'priceUsDollars');
            VerifyNumber(googleActivity, 'googleActivity');
            VerifyNumber(twitterMentions, 'twitterMentions');
        } catch(exception){
            reject(exception);
        }

        GetCurrency(currencyId)
            .then(
                function(currency) {
                    if(currency == null)
                        return Promise.reject('Currency not found, value: ' + currency);
                    else
                        return GetDayIndex(currency['id'], date);
                }
            ).then(
            function(day_index){
                if(day_index == null){
                    console.log('Day index not found, creating it.');
                    return CreateDayIndex(currencyId, date, priceUsDollars, googleActivity, twitterMentions);
                }
                else{
                    console.log('Day index found, updating it.');
                    return UpdateDayIndex(currencyId, date, priceUsDollars, googleActivity, twitterMentions);
                }
            }
        ).then(
            function(){
                console.log('Data successfully updated. Values: {' +
                    'id: ' + currencyId + ', ' +
                    'date: ' + date + ', ' +
                    'price_us_dollars: ' + priceUsDollars + ', ' +
                    'google_activity: ' + googleActivity + ', ' +
                    'twitter_mentions: ' + twitterMentions + '}');
            }
        )
            .catch(
                function(err){
                    console.log('Failed to update data. err: ' + err);
                    return reject(err);
                }
            )
    });
};

/**
 * Gets a currency object from a currency_id
 * @param currencyId The currency_id of the desired currency
 * @returns {Promise.<currency>} The desired currency, null if not found
 */
const GetCurrency = function(currencyId) {
    return new Promise(function(resolve, reject){
        try{
            VerifyCurrencyId(currencyId);
        }
        catch(exception){
            reject(exception);
        }

        const query = {
            sql:
            'SELECT * ' +
            'FROM currency ' +
            'WHERE id = ?'
        };

        pool.query(query, [currencyId], function (err, currency){
            if(err)
                reject(err);
            else if (currency.length !== 1)
                resolve(null);
            else
                resolve(currency[0]);
        });
    });
};

/**
 * Gets day_index object from a currency_id and date
 * @param currencyId The currency_id of the desired currency
 * @param date The date the data was recorded on
 * @returns {Promise.<day_index>} The day_index of the currency, null if not found
 */
const GetDayIndex = function(currencyId, date) {
    return new Promise(function(resolve, reject) {
        try{
            VerifyCurrencyId(currencyId);
            VerifyDate(date);
        }
        catch(exception){
            reject(exception);
        }

        const query = {
            sql:
            'SELECT * ' +
            'FROM day_index ' +
            'WHERE currency_id = ? ' +
            'AND date = ?'
        };

        pool.query(query, [currencyId, date], function (err, results) {
            if (err)
                reject(err);
            else if (results.length !== 1)
                resolve(null);
            else
                resolve(results[0]);
        });
    });
};

/**
 * Creates day index from existing data
 * @param currencyId The currency_id of the desired currency
 * @param date The date the data was recorded
 * @param priceUsDollars The price in US dollars of the currency on the given date
 * @param googleActivity The number of google searches of the currency on the given date
 * @param twitterMentions The number of mentions on twitter of the currency on the given date
 * @returns {Promise.<int>} 1 if successful
 */
const CreateDayIndex = function(currencyId, date, priceUsDollars, googleActivity, twitterMentions){
    return new Promise(function(resolve, reject) {
        try{
            VerifyCurrencyId(currencyId);
            VerifyDate(date);
            VerifyNumber(priceUsDollars,'priceUsDollars');
            VerifyNumber(googleActivity, 'googleActivity');
            VerifyNumber(twitterMentions, 'twitterMentions');
        }catch(exception){
            reject(exception);
        }

        if(err != null)
            reject(err);

        const query = {
            sql:
            'INSERT INTO day_index (currency_id, date, price_us_dollars, google_activity, twitter_mentions) ' +
            'Values (?, ?, ?, ?, ?)'
        };

        pool.query(query, [currencyId, date, priceUsDollars, googleActivity, twitterMentions], function (err, results) {
            if (err)
                reject(err);
            else
                resolve(results);
        });
    });
};

/**
 * Updates day index with new data
 * @param currencyId The currency_id of the existing day index
 * @param date The date the data was recorded
 * @param priceUsDollars The price in US dollars of the currency on the given date
 * @param googleActivity The number of google searches of the currency on the given date
 * @param twitterMentions The number of mentions on twitter of the currency on the given date
 * @returns {Promise.<int>} 1 if successful
 */
const UpdateDayIndex = function(currencyId, date, priceUsDollars, googleActivity, twitterMentions){
    return new Promise(function(resolve, reject) {
        try{
            VerifyCurrencyId(currencyId);
            VerifyDate(date);
            VerifyNumber(priceUsDollars,'price_us_dollars');
            VerifyNumber(googleActivity, 'google_searches');
            VerifyNumber(twitterMentions, 'twitter_mentions');
        }catch(exception){
            reject(exception);
        }

        const query = {
            sql:
            'UPDATE day_index ' +
            'SET price_us_dollars = ?, google_activity = ?, twitter_mentions = ? ' +
            'WHERE currency_id = ? AND date = ?'
        };

        pool.query(query, [priceUsDollars, googleActivity, twitterMentions, currencyId, date], function (err, results) {
            if (err)
                reject(err);
            else
                resolve(results);
        });
    });
};

/**
 * Verifies that the currency_id parameter is correct data type
 * @param currencyId The currency_id user input
 */
const VerifyCurrencyId = function (currencyId) {
    if(currencyId == null)
        throw 'Parameter currencyId cannot be null';
    if(typeof currencyId !== 'string')
        throw 'Parameter currencyId must be a string';
    else if(currencyId.length !== 3)
        throw 'Parameter currencyId must be of length 3';
};

/**
 * Verifies that the date parameter is correct data type
 * @param date date user input
 */
const VerifyDate = function (date){
    if(date == null)
        throw 'Parameter date cannot be null';

    date = new Date(date)
    if(date == 'Invalid Date')
        throw 'Date must be in UTC format';

    date.setHours(0, 0, 0, 0);
};

/**
 * Verifies that the number parameter is correct data type
 * @param number The user input
 * @param parameter The type of parameter the number is (for error logging)
 */
const VerifyNumber = function(number, parameter){
    if(number != null && typeof number !== 'number')
        throw 'Parameter ' + parameter + ' must be a number';
};
