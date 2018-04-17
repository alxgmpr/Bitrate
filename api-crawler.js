var Twit = require('twit');
var Google = require('google-trends-api');

var T = new Twit({
    consumer_key:         'RbKtORPOdZPlPWuVVz7ByHXam',
    consumer_secret:      '4KLCLUQgz2gJMPGe1UMPeNU8qQWVTChht8GMXbmQegPfzLgUg0',
    access_token:         '984568185302208513-B0PBoA8dlKAV6FJKC1q002Asz8RyyI2',
    access_token_secret:  'BFUDFMHhivRZgdrAuiVCzt7Ed5RtttAJvWUsNfnGXQqA6',
    timeout_ms:           60*1000  // optional HTTP request timeout to apply to all requests.
});



//printTwitterData();
queryGoogle("Bitcoin", new Date());

function queryTwitter(hashtag){
    return new Promise(function(resolve, reject){
        T.get('search/tweets', {q: hashtag, count: 5}, function (err, data) {
            if(err) {
                reject(err);
            }else{
                resolve(data.statuses.length);
            }
        })
    });
}

function queryGoogle(coinName, date){
    return new Promise(function(resolve, reject){

        var startTime = new Date(date.setHours(0,0,0,0));
        var endTime = new Date(date.setHours(23,59,59,999));

       Google.interestOverTime({keyword: coinName, startTime: startTime, endTime: endTime, granularTimeResolution: true},
           function(err, data){
               if(err)
                   reject(err);
               else{
                   var object = JSON.parse(data);
                   var timeline = object.default.timelineData;
                   var average = 0;

                   for(var i in timeline){
                       average += timeline[i]['value'][0];
                   }

                   average = Math.round(average/timeline.length);

                   resolve(average);
               }
       })
    });
}

function printTwitterData(){
    queryTwitter('#BTC')
        .then(
            function(value){
                console.log('Bitcoin: ' + value);
            });

    queryTwitter('#ADA')
        .then(
            function(value){
                console.log('Cardano: ' + value);
            });

    queryTwitter('#LTC')
        .then(
            function(value){
                console.log('Litecoin: ' + value);
            });

    queryTwitter('#ETH')
        .then(
            function(value){
                console.log('Ethereum: ' + value);
            });

    queryTwitter('#XRP')
        .then(
            function(value){
                console.log('Ripple: ' + value);
            });

}