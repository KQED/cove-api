var request             = require('request'),
    P                   = require('bluebird'),
    nodeify             = require('nodeify'),
    moment              = require('moment'),
    crypto              = require('crypto'),
    URL                 = require('url'),
    default_logger      = require('./logger');

function COVEApi (options) {
    if (!options) {
        options = {};
    }
    // Accept bunyan logger or use default
    if (options.logger) {
        this.logger = options.logger;
    } else {
        this.logger = default_logger;
    }
    if (options.log_level) {
        this.logger.level = options.log_level;
    }

    // TODO: Not needed?
    this.base_url = options.base_url || 'https://api.pbs.org/cove';
    this.api_id = options.api_id || null;
    this.api_secret = options.api_secret || null;
}

// Sort the URL params for proper signing
COVEApi.prototype.normalizeUrl = function (url) {
    var parts = URL.parse(url);
};


// generate a random string to use as the nonce
COVEApi.prototype.generateNonce = function () {
    var md5sum = crypto.createHash('md5'),
        randnum = Math.random(1);
    md5sum.update(String(randnum));
    return md5sum.digest('hex');
};

COVEApi.prototype.request = function (url, options){
    if (!options) {
        options = {};
    }

    timestamp = options.timestamp || moment().unix();
    nonce = options.nonce || this.generateNonce();

    // build url
    // build signature


    // make request



};






module.exports = COVEApi;