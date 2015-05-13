## cove-api
A node.js module for accessing the PBS COVE V1 API. See COVE API Documentation:
* https://projects.pbs.org/confluence/display/coveapi/Welcome

## Dependencies
* COVE API_ID
* COVE API_SECRET

## Install
```
$ git clone https://github.com/KQED/cove-api.git
$ cd cove-api
$ npm install
```
## Test
```
$ npm test
```

## Examples
### Quick start
This example queries COVE for programs produced by PBS and requests the associated images.
* Ex: http://api.pbs.org/cove/v1/programs/?filter_producer__name=PBS&fields=associated_images
```
$ cd examples
$ export COVE_API_ID='YOUR COVE_API_ID'
$ export COVE_API_SECRET='YOUR COVE_API_SECRET'
$ node simple_request.js
```
Output:
```
Async: results count: 200
Async: first image url: http://image.pbs.org/contentchannels/2340/MmFmdUNelPiWY1fJnGw.jpg.resize.144x81.jpg
Promises: results count: 200
Promises: first image url: http://image.pbs.org/contentchannels/2340/MmFmdUNelPiWY1fJnGw.jpg.resize.144x81.jpg
Promises w/ Header Auth: results count: 200
Promises w/ Header Auth: first image url: http://image.pbs.org/contentchannels/2340/MmFmdUNelPiWY1fJnGw.jpg.resize.144x81.jpg
```
### Sample Code
```javascript
var COVEApi = require('cove-api');

// Get api credentials from Environment
var api_id =  process.env.COVE_API_ID || null,
    api_secret = process.env.COVE_API_SECRET || null;

// A sample URL. Returns images for PBS programs
var url = 'http://api.pbs.org/cove/v1/programs/?filter_producer__name=PBS&fields=associated_images';

var options = {
    api_id      : api_id,
    api_secret  : api_secret,
    log_level   : 'debug'
};
var coveAPI = new COVEApi(options);

var options = {};
coveAPI.request(url, options).
then(function(data){
    console.log('results count:', data.results.length);
})
.catch(function(e){
    console.error(e);
})
.done();
```
