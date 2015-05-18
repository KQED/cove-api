var request             = require('request'),
    P                   = require('bluebird'),
    nodeify             = require('nodeify'),
    moment              = require('moment'),
    crypto              = require('crypto'),
    URL                 = require('url'),
    utf8                = require('utf8'),
    default_logger      = require('./logger');

// Node module implementing the COVE API
// See https://projects.pbs.org/confluence/display/coveapi/Welcome

function COVEApi (options) {
    if (!options) {
        options = {};
    }
    // Accept a bunyan logger or use default logger.js

    if (options.logger) {
        this.logger = options.logger;
    } else {
        this.logger = default_logger;
    }
    // To disable logging:
    //  options.log_level = 'off'
    if (options.log_level) {
        this.logger.level(options.log_level);
    }

    var base_url = 'api.pbs.org/cove/v1';
    this.base_url = options.base_url || 'http://' + base_url;
    this.base_http_url = options.base_http_url || 'https://' + base_url;
    this.api_id = options.api_id || null;
    this.api_secret = options.api_secret || null;

    // Allowable fields
    this.fields = {
        videos      : [
            'associated_images',
            'mediafiles',
            'categories',
            'geo_restriction',
            'captions',
            'program',
            'tags',
            'producer',
            'related_videos'
        ],
        programs    : [
            'associated_images',
            'tags',
            'categories',
            'geo_profile',
            'producer'
        ]
    };
    // Allowable filters
    // this.filters = {};
}

COVEApi.prototype.setAuth = function(options) {
    this.api_id = options.api_id || null;
    this.api_secret = options.api_secret || null;
};

COVEApi.prototype.generateSignature = function(cannonical_url, timestamp, nonce, method) {
    var consumer_key = this.api_id,
        consumer_secret = this.api_secret,
        logger = this.logger;

    // Have to have this
    if (!consumer_key) {
        logger.error("missing consumer_key/api_id");
        return null;
    }
    if (!method) {
        method = 'GET';
    }

    var url_string = method + cannonical_url + timestamp + consumer_key + nonce,
        hmac = crypto.createHmac('sha1', consumer_secret);

    hmac.setEncoding('hex');
    hmac.write(url_string);
    hmac.end();

    var sig = hmac.read();
    return sig;
};

COVEApi.prototype.signUrl = function (cannonical_url, timestamp, nonce, method) {
    var sig = this.generateSignature(cannonical_url, timestamp, nonce, method),
        signed_url = cannonical_url + '&signature=' + sig;

    return signed_url;
};

// Sort the URL params for proper signing
COVEApi.prototype.normalizeUrl = function (url, timestamp, nonce) {
    var self = this;
    if (!url) {
        return null;
    }
    var parts = URL.parse(url, true);

    if (!timestamp) {
        timestamp = moment().unix();
    }
    if (!nonce) {
        nonce = this.generateNonce();
    }

    // Add api_id, timestamp, nonce
    if (!parts.query) {
        parts.query = {};
    }
    parts.query.consumer_key = this.api_id;
    parts.query.timestamp = timestamp;
    parts.query.nonce = nonce;

    var sorted_keys = Object.keys(parts.query).sort(),
        sorted_query = {};

    // sort and encode query params
    var querystring_arr = [];
    sorted_keys.forEach(function(param_key){
        // URI escape/encode
        var escaped = encodeURIComponent(parts.query[param_key]);
        // UTF8 encode
        var encoded = utf8.encode(escaped);
        querystring_arr.push(param_key + '=' + encoded);
    });

    // Build up querystring w/o using url.format
    // which will double-encode
    parts.search = querystring_arr.join('&');

    var normalized = URL.format(parts); // rebuild the URL

    // replace %20 with "+" which is what the COVE API expects
    normalized = normalized.replace(/%20/g, "+");
    return normalized;
};

// generate a random string to use as the nonce
COVEApi.prototype.generateNonce = function () {
    var md5sum = crypto.createHash('md5'),
        randnum = Math.random(1);
    md5sum.update(String(randnum));
    return md5sum.digest('hex');
};

COVEApi.prototype.request = function (baseurl, options){
    var self = this,
        deferred = P.defer(),
        logger = this.logger;

    if (!options) {
        options = {};
    }

    var timestamp = options.timestamp || moment().unix(),
        nonce = options.nonce || this.generateNonce(),
        method = options.method || 'GET';

    // sort url params
    var url = this.normalizeUrl(baseurl, timestamp, nonce);

    // generate signature
    var signature = this.generateSignature(url, timestamp, nonce, method);

    var req_options = {
        method          : method
    };

    // Are we using http headers for auth?
    if (options.auth_using_headers) {
        req_options.headers = {
            'X-PBSAuth-Timestamp'          : String(timestamp),
            'X-PBSAuth-Consumer-Key'       : self.api_id,
            'X-PBSAuth-Signature'          : signature,
            'X-PBSAuth-Nonce'              : nonce
        };
        req_options.url = url;
    } else {
        // signature in the url
        req_options.url = this.signUrl(url, timestamp, nonce, method);
    }

    // make request
    request(req_options, function (err, res, body) {
        if (err) {
            logger.error(err);
            return deferred.reject(err);
        }
        if (!res || res.statusCode !== 200) {
            var msg = {
                error       : "unexpected statusCode",
                statusCode  : res.statusCode
            };
            if (res && body) {
                msg.error = body;
            }
            return deferred.reject(msg);
        }

        var data;
        try {
            data = JSON.parse(body);
        } catch (e) {
            logger.error('cove-api request', e);
            return deferred.reject(e);
        }
        deferred.resolve(data);
    });
    return deferred.promise;
};

COVEApi.prototype.request_async = function (baseurl, options, callback){
    return nodeify(this.request(baseurl, options), callback);
};

module.exports = COVEApi;