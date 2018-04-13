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

function retrieveData() {
//Bitcoin
    T.get('search/tweets', {q: '#BTC', count: 5}, function (err, data, response) {
        //console.log(data)
        console.log(data.statuses.length);
        bitcoin = data.statuses.length;
        /*for (var x in data.statuses){
            bitcoin++;
        }*/
        console.log("Bitcoin logger: " + bitcoin);
    })

/*//Cardano
    T.get('search/tweets', {q: '#ADA', count: 36}, function (err, data, response) {
        cardano += 1;
    })

//Litecoin
    T.get('search/tweets', {q: '#LTC', count: 36}, function (err, data, response) {
        litecoin += 1;
    })

//Ethereum
    T.get('search/tweets', {q: '#ETH', count: 36}, function (err, data, response) {
        ethereum += 1;
    })

//Ripple
    T.get('search/tweets', {q: '#XRP', count: 36}, function (err, data, response) {
        ripple += 1;
    })*/
}

retrieveData();

function testFunc() {
    var myObject = [ {
            'name':'Kasun',
            'address':'colo',
            'age':'29'
        },
        {
            'name':'Kasun',
            'address':'colo',
            'age':'29'
        },
        {
            'name':'Kasun',
            'address':'colo',
            'age':'29'
        },
        {
            'name':'Kasun',
            'address':'colo',
            'age':'29'
        },
        {
            'name':'Kasun',
            'address':'colo',
            'age':'29'
        } ];

    var count = Object.keys(myObject).length;
    console.log(count);
}

//testFunc();

function logger() {
    console.log("Bitcoin: " + bitcoin + ", Cardano: " + cardano +
        ", Litecoin: " + litecoin + ", Ethereum: " + ethereum + ", Ripple: " + ripple);
}