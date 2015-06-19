module.exports = function(client, opts) {
  return client.bookmarks.unarchive(opts['<bookmark_id>']);
};
