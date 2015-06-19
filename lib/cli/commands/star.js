module.exports = function(client, opts) {
  return client.bookmarks.star(opts['<bookmark_id>']);
};
