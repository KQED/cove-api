// A basic logger to use as default
var bunyan = require("bunyan"),
    package_json = require('../package.json'),
    options = {},
    logger;

options.name = package_json.name;
options.level = "info";
logger = bunyan.createLogger(options);

module.exports = logger;