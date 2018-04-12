var mysql = require('mysql');

var pool  = mysql.createPool({
    connectionLimit : 10,
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
function getTrackedCoins(callback) {
    var query = "SELECT id, name FROM currency";

    pool.query(query, function (err, results) {
        callback(err, results);
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
function getAllDataBetween(startDate, endDate, callback) {
    var query = {
        sql:
            'SELECT currency_id, name, DATE_FORMAT(date, \'%m-%d-%Y\') as date, price_us_dollars, ' +
                'number_of_searches, number_of_mentions ' +
            'FROM day_index INNER JOIN ' +
                'currency ON day_index.currency_id = currency.id LEFT JOIN ' +
                'currency_price ON day_index.id = currency_price.day_index_id LEFT JOIN ' +
                'google_searches ON day_index.id = google_searches.day_index_id LEFT JOIN ' +
                'twitter_mentions ON day_index.id = twitter_mentions.day_index_id ' +
            'WHERE date >= ? ' +
                'AND date <= ?'
    };

    pool.query(query, [startDate, endDate], function (err, results){
        callback(err, results);
    });
}

function createDayIndex(currency, date, price, google_searches, twitter_mentions){

}

function isValidDate(date) {
    return date && Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date);
}
