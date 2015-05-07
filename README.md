## cove-api
A node.js module for accessing the PBS COVE V1 API. See PBS Documentation:
* https://projects.pbs.org/confluence/display/coveapi/Welcome

## Dependencies
* Node.js
* A COVE API_ID and API_SECRET

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
```
$ cd examples.
$ node simple_request.js
```
Sample Code:
```javascript
var COVEApi = require('../'),
    colors = require('colors');

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
    console.log('Promises:'.blue + ' results count:'.green, data.results.length);
})
.catch(function(e){
    console.error(e);
})
.done();
```
