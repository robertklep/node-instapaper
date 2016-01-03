module.exports = function(client, opts) {
  return client.bookmarks.getText(opts['<bookmark_id>']);
};
