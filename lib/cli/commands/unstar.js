module.exports = function(client, opts) {
  return client.bookmarks.unstar(opts['<bookmark_id>']);
};
