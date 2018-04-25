const Google = require('google-trends-api');
const HashtagCount = require('hashtag-count');
const sql = require('./sql-wrapper.js');
const request = require('request');

const CollectionInterval = '24 hours';
const CollectionHistory = '24 hours';
const hc = new HashtagCount({
    consumer_key:         'RbKtORPOdZPlPWuVVz7ByHXam',
    consumer_secret:      '4KLCLUQgz2gJMPGe1UMPeNU8qQWVTChht8GMXbmQegPfzLgUg0',
    access_token:         '984568185302208513-B0PBoA8dlKAV6FJKC1q002Asz8RyyI2',
    access_token_secret:  'BFUDFMHhivRZgdrAuiVCzt7Ed5RtttAJvWUsNfnGXQqA6',
});

StartStreamCapturing = function(){
    let hashtags = [];

    sql.GetAllCurrencies()
        .then(
            function(result) {
                currencyIds = result.map(x => x.id);
                return Promise.resolve(currencyIds);
            }
        ).then(
        function(currencyIds){
            hashtags = currencyIds;
        }
    ).then(
        function(){
            hc.start({
                hashtags: hashtags,
                interval: CollectionInterval,
                history: CollectionHistory,
                intervalCb: IntervalEvent,
                connectingCb: ConnectingEvent,
                reconnectingCb: ReconnectingEvent,
                connectedCb: ConnectedEvent,
            });
        }
    );
};

const IntervalEvent = function(err, results) {
    if (err) {
        console.error(err);
    } else {
        let currencies = GetLatestResult(results);

        for(let i in currencies){
            let currency = currencies[i];
            GetNumberOfGoogleSearches(currency.id)
                .then(
                    function(googleSearches){
                        currency.googleSearches = googleSearches;
                        return Promise.resolve();
                    }
                )
                .then(
                    function(){
                        return GetCoinPrice(currency.id);
                    }
                )
                .then(
                    function(currencyPrice){
                        currency.currencyPrice = currencyPrice;
                        return Promise.resolve();
                    }
                )
                .then(
                    function(){
                        return sql.UpdateData(currency.id, currency.date, currency.currencyPrice,
                            currency.googleSearches, currency.twitterMentions);
                    }
                )
                .catch(
                    function(err){
                        console.log("Error updating data. Err: " + err);
                    }
                )
        }
    }
};

const GetLatestResult = function(results){
    let max = null;
    for(let key in results){
        if(max == null)
            max = key;
        if(key > max)
            max = key;
    }

    let resultsArr = [];
    const date = new Date(max);
    for(let key in results[max]){
        resultsArr.push({'id': key, 'date': date, 'twitterMentions': results[max][key]});
    }

    return resultsArr;
};


const ConnectingEvent = function() {
    const dateString = new Date().toISOString();
    console.log(dateString + ' Connecting to Twitter Streaming API...');
};

const ReconnectingEvent = function() {
    const dateString = new Date().toISOString();
    console.log(dateString + ' Twitter Streaming API connection failed. Reconnecting...');
};

const ConnectedEvent = function() {
    const dateString = new Date().toISOString();
    console.log(dateString + ' Connected to Twitter Streaming API.');
};

const GetNumberOfGoogleSearches = function(currencyName){
    return new Promise(function(resolve, reject){
        const now = new Date();
        const oneWeekAgo = new Date(new Date().getTime() - (6 * 24 * 60 * 60 * 1000));
        const yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));

       Google.interestOverTime({keyword: currencyName, startTime: oneWeekAgo, endTime: now, granularTimeResolution: true},
           function(err, data){
               if(err)
                   reject(err);
               else{
                   const object = JSON.parse(data);
                   const timeline = object.default.timelineData;
                   let average = 0;
                   let averageCount = 0;

                   for(let i in timeline){
                       const time = parseInt(timeline[i].time);
                       const value = Math.round(yesterday.getTime() / 1000);
                       if(time >= value){
                           average += timeline[i]['value'][0];
                           averageCount++;
                       }
                   }

                   average = Math.round(average/averageCount);

                   resolve(average);
               }
       })
    });
};

const GetCoinPrice = function(currencyId){
    return new Promise(function(resolve, reject){
        resolve(100);
        request({
            url: 'https://bittrex.com/api/v1.1/public/getticker?market=USDT-' + currencyId,
            headers: {
                'content-type': 'application/json'
            }
        }, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                if(JSON.parse(body)['success']) {
                    resolve(JSON.parse(body)['result']['Last'])
                } else {
                    reject(JSON.parse(body)['message'])
                }
            }
            if (error) {
                reject(error)
            }
        });
    });
};

StartStreamCapturing();
