var fs         = require('fs');
var path       = require('path');
var docopt     = require('docopt').docopt;
var Instapaper = require('../index');
var config     = require('rc')('instapaper', {
  consumer    : {},
  credentials : {},
});

// Parse command line options.
var opts = docopt(fs.readFileSync(__dirname + '/docopt.txt', 'utf8'), {
  version : require('../../package').version
});

module.exports = function() {
  var cmds = Object.keys(opts).filter(function(key) {
    return /^[a-z]+$/.test(key) && opts[key] === true;
  });
  if (cmds.length === 0) {
    console.error('Unknown command');
    process.exit(1);
  }

  // Instantiate client.
  var client = Instapaper(
    opts.key    || config.consumer.key,
    opts.secret || config.consumer.secret
  );

  // Set username and password.
  client.setUserCredentials(
    opts.username || config.credentials.username,
    opts.password || config.credentials.password
  );

  // Perform the command.
  return require('./commands/' + cmds[0])(client, opts).then(function(output) {
    if (output) {
      console.log('%j', output);
    }
  }).catch(function(err) {
    console.error(err);
    if (opts['--verbose']) {
      console.error(err.stack);
    }
    process.exit(1);
  });
};
