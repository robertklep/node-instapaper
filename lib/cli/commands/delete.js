module.exports = function(client, opts) {
  return client.bookmarks.delete(opts['<bookmark_id>']);
};
