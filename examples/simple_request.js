var COVEApi = require('../'),
    colors = require('colors');

// Get api credentials from Environment
var api_id =  process.env.COVE_API_ID || null,
    api_secret = process.env.COVE_API_SECRET || null;

// A sample URL. Returns images for PBS programs
var url = 'http://api.pbs.org/cove/v1/programs/?filter_producer__name=PBS&fields=associated_images';

if (!api_id || !api_secret) {
    console.log("Please set api_id and api_secret environment variables:");
    console.log('  export COVE_API_ID="YOUR_COVE_API_ID"');
    console.log('  export COVE_API_SECRET="YOUR_COVE_API_SECRET"');
    process.exit(1);
}

var options = {
    api_id      : api_id,
    api_secret  : api_secret,
    log_level   : 'info'
};
var coveAPI = new COVEApi(options);

// Request using async
coveAPI.request_async(url, options, function(err, data){
    if (err) {
        return console.error(err);
    }

    console.log('Async:'.blue + ' results count:'.green, data.results.length);
    console.log('Async:'.blue + ' first image url:'.green, data.results[0].associated_images[0].url);
});

// Request using Promises
var options = {};
coveAPI.request(url, options).
then(function(data){
    console.log('Promises:'.blue + ' results count:'.green, data.results.length);
    console.log('Promises:'.blue + ' first image url:'.green, data.results[0].associated_images[0].url);
})
.catch(function(e){
    console.error(e);
})
.done();

// Request using Promises and http headers for auth
var options = {
    auth_using_headers: true,
};
coveAPI.request(url, options).
then(function(data){
    console.log('Promises w/ Header Auth:'.blue + ' results count:'.green, data.results.length);
    console.log('Promises w/ Header Auth:'.blue + ' first image url:'.green, data.results[0].associated_images[0].url);
})
.catch(function(e){
    console.error(e);
})
.done();