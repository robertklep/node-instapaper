var assert  = require('assert');
var lodash  = require('lodash');
var OAuth   = require('mashape-oauth').OAuth;
var request = require('request');
var logger  = require('winston');
var Promise = require('bluebird').Promise; Promise.longStackTraces();

var DEFAULTS = {
  apiUrl   : 'https://www.instapaper.com/api/1',
  logLevel : 'info',
  poolSize : 5,
  timeout  : 30000
};

var Instapaper = module.exports = function Instapaper(consumerKey, consumerSecret, opts) {
  if (! (this instanceof Instapaper)) {
    return new Instapaper(consumerKey, consumerSecret, opts);
  }
  assert(consumerKey,    'missing consumerKey');
  assert(consumerSecret, 'missing consumerSecret');

  this.consumerKey    = consumerKey;
  this.consumerSecret = consumerSecret;

  // Merge options with defaults
  this.opts = lodash.merge({}, DEFAULTS, opts);

  // Create a request instance with the proper defaults.
  this.req = request.defaults({
    pool    : { maxSockets : this.opts.poolSize },
    timeout : this.opts.timeout,
    headers : {}
  });

  // Set log level
  logger.level = this.opts.logLevel;
  logger.debug('initialized');
};

Instapaper.prototype.setUsername = function(username) {
  this.username = username;
  return this;
};

Instapaper.prototype.setPassword = function(password) {
  this.password = password;
  return this;
};

Instapaper.prototype.authenticate = function(callback) {
  assert(this.username, 'Call .setUsername() first');
  assert(this.password, 'Call .setPassword() first');

  var client = this;
  return new Promise(function(resolve, reject) {
    // If we already have access tokens, we're done.
    if (client.access) {
      return resolve(client.access);
    }

    // Get oauth access token.
    client.oa = new OAuth({
      consumerKey     : client.consumerKey,
      consumerSecret  : client.consumerSecret,
      signatureMethod : 'HMAC-SHA1',
      accessUrl       : client.opts.apiUrl + '/oauth/access_token',
    });
    client.oa.getXAuthAccessToken(client.username, client.password, function(err, oauth_token, oauth_token_secret, results) {
      if (err) return reject(err);
      if (! oauth_token || ! oauth_token_secret) {
        err          = new Error('Failed to get OAuth access token');
        err.response = results;
        return reject(err);
      }
      client.access = [ oauth_token, oauth_token_secret ];
      return resolve(client.access);
    });
  }).nodeify(callback);
};

Instapaper.prototype.request = function(endpoint, opts, callback) {
  if (opts instanceof Function) {
    callback = opts;
    opts     = {};
  } else if (opts === undefined) {
    opts = {};
  }
  return this .authenticate()
              .bind(this)
              .spread(function(token, secret) {
                opts.oauth_token        = token;
                opts.oauth_token_secret = secret;
                opts.url                = this.opts.apiUrl + endpoint;

                logger.debug('making API request', opts);
                return Promise.promisify(this.oa.post, this.oa)(opts);
              })
              .spread(function(response, request) {
                return JSON.parse(response);
              }).nodeify(callback);
};
