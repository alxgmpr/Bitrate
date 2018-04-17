var Twit = require('twit')

var T = new Twit({
    consumer_key:         'RbKtORPOdZPlPWuVVz7ByHXam',
    consumer_secret:      '4KLCLUQgz2gJMPGe1UMPeNU8qQWVTChht8GMXbmQegPfzLgUg0',
    access_token:         '984568185302208513-B0PBoA8dlKAV6FJKC1q002Asz8RyyI2',
    access_token_secret:  'BFUDFMHhivRZgdrAuiVCzt7Ed5RtttAJvWUsNfnGXQqA6',
    timeout_ms:           60*1000  // optional HTTP request timeout to apply to all requests.
});

printTwitterData();

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