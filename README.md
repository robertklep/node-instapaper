## Instapaper API

Node.js client for the [Instapaper API](https://www.instapaper.com/api/full).

Work in progress!

### Installation

```
$ npm i instapaper
```

### Quick example

``` javascript
var Instapaper = require('instapaper');
var client     = Instapaper(CONSUMER_KEY, CONSUMER_SECRET);

client.setCredentials(USERNAME, PASSWORD);

// Load a list of bookmarks using promises...
client.list().then(function(bookmarks) {
  console.log('%j', bookmarks);
}).catch(function(err) {
  console.warn('oh noes', err);
});

// ...or regular callbacks
client.list(function(err, bookmarks) {
  if (err) return console.warn('oh noes', err);
  console.log('%j', bookmarks);
});
```

### Authentication

The Instapaper API uses xAuth, which requires that you first register for API usage [here](https://www.instapaper.com/main/request_oauth_consumer_token). When your registration has been approved, you will receive a _"consumer key"_ and _"consumer secret"_, which you pass to the `Instapaper` constructor (see below).

You also need either:

- a username and password belonging to the user on whose behalf you want to manage Instapaper;
- or, an OAuth token and secret from a previous authentication round.


You should never store the username/password locally. Instead, after you've used them to get an OAuth token/secret pair, use that instead.

## Usage:

### Constructor

``` javascript
var client = Instapaper(CONSUMER_KEY : String, CONSUMER_SECRET : String[, OPTIONS : Object]);
```

- `OPTIONS` is an optional object that may contain the following properties:

  ```
  apiUrl     : String  // Instapaper API URL prefix (default: 'https://www.instapaper.com/api/1')
  logLevel   : String  // log level                 (default: 'info')
  ```


### Authentication

#### Set user credentials

```
client.setUserCredentials(USERNAME : String, PASSWORD : String) : void
```

#### Set OAuth credentials

```
client.setOAuthCredentials(TOKEN : String, SECRET : String) : void
```

#### Authenticate

```
client.authenticate() : Promise
```

All regular API methods call this method implicitly. However, if you want to retrieve the OAuth credentials you can use this method to do so:

```
client.authenticate().spread(function(token, secret) {
  ...
});
```

### Bookmarks management

_Please refer to the [API documentation](https://www.instapaper.com/api/full) for valid parameters and response formats._

```
client.bookmarks.list(PARAMS)           : Promise
client.bookmarks.delete(BOOKMARK_ID)    : Promise
client.bookmarks.star(BOOKMARK_ID)      : Promise
client.bookmarks.unstar(BOOKMARK_ID)    : Promise
client.bookmarks.archive(BOOKMARK_ID)   : Promise
client.bookmarks.unarchive(BOOKMARK_ID) : Promise
```

### Folder management

TBD.
