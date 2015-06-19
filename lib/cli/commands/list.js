module.exports = function(client, opts) {
  var listOpts = {};
  [ 'limit', 'folder_id', 'have', 'highlights' ].forEach(function(o) {
    if (opts['--' + o] !== null) {
      listOpts[o] = opts['--' + o];
    }
  });
  return client.bookmarks.list(listOpts);
};
