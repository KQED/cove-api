var COVEApi = require('../');

// Get api credentials from Environment
var api_id =  process.env.COVE_API_ID || null,
    api_secret = process.env.COVE_API_SECRET || null;

var url = 'http://api.pbs.org/cove/v1/programs/?filter_producer__name=PBS&fields=associated_images';

if (!api_id || !api_secret) {
    console.log("Please set api_id and api_secret environment variables:");
    console.log('  export COVE_API_ID="YOUR_COVE_API_ID"');
    console.log('  export COVE_API_SECRET="YOUR_COVE_API_SECRET"');
    process.exit(1);
}

var options = {
    api_id      : api_id,
    api_secret  : api_secret
};
var coveAPI = new COVEApi(options);

// Make request using promises
var options = {};
coveAPI.request(url, options).
then(function(data){
    console.log('Promises: results count:', data.results.length);
    console.log('Promises: first result:', data.results[0]);
})
.catch(function(e){
    console.error(e);
})
.done();

// // Make request using async
coveAPI.request_async(url, options, function(err, data){
    if (err) {
        return console.error(err);
    }

    console.log('Async: results count:', data.results.length);
    console.log('Async: first result:', data.results[0]);

});
