module.exports = function(client, opts) {
  return client.bookmarks.archive(opts['<bookmark_id>']);
};
