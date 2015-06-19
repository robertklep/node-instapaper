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
  // Check which command to perform.
  var cmd = opts.verify ? 'verify' :
            opts.list   ? 'list'   : null;
  if (cmd === null) {
    console.error('Unknown command');
    process.exit(1);
  }

  // Instantiate client.
  var client = Instapaper(
    opts.key    || config.consumer.key,
    opts.secret || config.consumer.secret
  );

  // Set username and password.
  client.setUsername(opts.username || config.credentials.username)
        .setPassword(opts.password || config.credentials.password);

  // Perform the command.
  return require('./commands/' + cmd)(client, opts).then(function(output) {
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
