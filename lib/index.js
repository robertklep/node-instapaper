var assert  = require('assert');
var lodash  = require('lodash');
var OAuth   = require('mashape-oauth').OAuth;
var request = require('request');
var logger  = require('winston');
var qs      = require('querystring');
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

  // Attach Bookmarks and Folders classes.
  this.bookmarks = new Bookmarks(this);
//  this.folders   = new Folders(this);

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
    var oa = client.oa = new OAuth({
      consumerKey     : client.consumerKey,
      consumerSecret  : client.consumerSecret,
      signatureMethod : 'HMAC-SHA1',
      accessUrl       : client.opts.apiUrl + '/oauth/access_token',
    });
    oa.getXAuthAccessToken(client.username, client.password, function(err, oauth_token, oauth_token_secret, res) {
      if (err) return reject(err);
      if (! oauth_token || ! oauth_token_secret) {
        err     = new Error('Failed to get OAuth access token');
        err.res = res;
        return reject(err);
      }
      client.POST   = Promise.promisify(oa.post, oa);
      client.access = [ oauth_token, oauth_token_secret ];
      return resolve(client.access);
    });
  }).nodeify(callback);
};

Instapaper.prototype.request = function(endpoint, body, callback) {
  if (body instanceof Function) {
    callback = body;
    body     = {};
  }
  var opts = { body : qs.stringify(body || {}) };
  return this .authenticate()
              .bind(this)
              .spread(function(token, secret) {
                opts.oauth_token        = token;
                opts.oauth_token_secret = secret;
                opts.url                = this.opts.apiUrl + endpoint;

                logger.debug('making API request', opts);
                return this.POST(opts);
              })
              .spread(function(response, request) {
                return JSON.parse(response);
              })
              .catch(function(err) {
                try {
                  var data = JSON.parse(err.data)[0];
                  err = errors[data.error_code];
                } catch(_err) {
                  err = errors[0];
                }
                throw new err();
              })
              .nodeify(callback);
};

Instapaper.prototype.verifyCredentials = function(callback) {
  return this.request('/account/verify_credentials').then(function(result) {
    return Array.isArray(result) ? result[0] : result;
  }).nodeify(callback);
};

var Bookmarks = function Bookmarks(client) {
  this.client = client;
};

Bookmarks.prototype.list = function(opts, callback) {
  return this.client.request('/bookmarks/list', opts, callback);
};

Bookmarks.prototype.delete = function(id, callback) {
  return this.client.request('/bookmarks/delete', { bookmark_id : id }, callback);
};

Bookmarks.prototype.star = function(id, callback) {
  return this.client.request('/bookmarks/star', { bookmark_id : id }, callback);
};

Bookmarks.prototype.unstar = function(id, callback) {
  return this.client.request('/bookmarks/unstar', { bookmark_id : id }, callback);
};

Bookmarks.prototype.archive = function(id, callback) {
  return this.client.request('/bookmarks/archive', { bookmark_id : id }, callback);
};

Bookmarks.prototype.unarchive = function(id, callback) {
  return this.client.request('/bookmarks/unarchive', { bookmark_id : id }, callback);
};

Bookmarks.prototype.move = function(id, folder, callback) {
  return this.client.request('/bookmarks/unarchive', { bookmark_id : id, folder_id : folder }, callback);
};

var errors = module.exports.Errors = require('./errors');
