var Twit = require('twit')

var T = new Twit({
    consumer_key:         'RbKtORPOdZPlPWuVVz7ByHXam',
    consumer_secret:      '4KLCLUQgz2gJMPGe1UMPeNU8qQWVTChht8GMXbmQegPfzLgUg0',
    access_token:         '984568185302208513-B0PBoA8dlKAV6FJKC1q002Asz8RyyI2',
    access_token_secret:  'BFUDFMHhivRZgdrAuiVCzt7Ed5RtttAJvWUsNfnGXQqA6',
    timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
})

var bitcoin = 0;
var cardano = 0;
var litecoin = 0;
var ethereum = 0;
var ripple = 0;
var pass = true;

var promise1 = new Promise(function(resolve, reject){
//Bitcoin
        T.get('search/tweets', {q: '#BTC', count: 5}, function (err, data, response) {
            if(pass) {
                //console.log(data)
                //console.log(data.statuses.length);
                bitcoin = data.statuses.length;
                /*for (var x in data.statuses){
                    bitcoin++;
                }*/
                console.log("Bitcoin logger: " + bitcoin);
                resolve();
            }else{
                reject("Bitcoin failed");
            }

        })
    });

var promise2 = new Promise(function (resolve,reject)
{
//Cardano
    if(pass) {
        T.get('search/tweets', {q: '#ADA', count: 5}, function (err, data, response) {
            cardano = data.statuses.length;
            console.log("Cardano logger: " + cardano)
        })
        resolve();
    }else{
        reject("Cardano failed");
    }
});

var promise3 = new Promise(function(resolve, reject) {
//Litecoin
    if(pass) {
        T.get('search/tweets', {q: '#LTC', count: 5}, function (err, data, response) {
            litecoin = data.statuses.length;
            console.log("LiteCoin logger: " + litecoin)
        })
        resolve();
    }else{
        reject("Litecoin failed");
    }
});

var promise4 = new Promise(function(resolve,reject) {
//Ethereum
    if(pass){
        T.get('search/tweets', {q: '#ETH', count: 5}, function (err, data, response) {
            ethereum = data.statuses.length;
            console.log("Ethereum logger: " + ethereum)
        })
        resolve();
    }else{
        reject("Ethereum failed");
    }
});

var promise5 = new Promise(function(resolve, reject){
//Ripple
        if(pass) {
            T.get('search/tweets', {q: '#XRP', count: 5}, function (err, data, response) {
                ripple = data.statuses.length;
                console.log("ripple logger: " + ripple)
            })
            resolve();
        }else{
            reject("Ripple failed");
        }
});
Promise.all([promise1,promise2,promise3,promise4,promise5]).then(function() {
  console.log("Promise worked");
  logger();
});

//prints out the number of coins per coins
function logger() {
    console.log("Bitcoin: " + bitcoin + ", Cardano: " + cardano +
        ", Litecoin: " + litecoin + ", Ethereum: " + ethereum + ", Ripple: " + ripple);
}