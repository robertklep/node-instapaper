var customError = require('custom-error');

var errors = [
  // General errors
  { code : 0,    name : 'GenericError', message : 'An error occurred' },
  { code : 1040, name : 'RateLimitExceeded', message : 'Rate-limit exceeded' },
  { code : 1041, name : 'PremiumAccountRequired', message : 'Premium account required' },
  { code : 1042, name : 'ApplicationSuspended', message : 'Application is suspended' },

  // Bookmark errors
  { code : 1220, name : 'DomainError', message : 'Domain requires full content to be supplied' },
  { code : 1221, name : 'DomainOptedOut', message : 'Domain has opted out of Instapaper compatibility' },
  { code : 1240, name : 'InvalidURL', message : 'Invalid URL specified' },
  { code : 1241, name : 'MissingBookmarkId', message : 'Invalid or missing bookmark_id' },
  { code : 1242, name : 'MissingFolderId', message : 'Invalid or missing folder_id' },
  { code : 1243, name : 'MissingProgress', message : 'Invalid or missing progress' },
  { code : 1244, name : 'MissingProgressTimestamp', message : 'Invalid or missing progress_timestamp' },
  { code : 1245, name : 'PrivateBookmarkError', message : 'Private bookmarks require supplied content' },
  { code : 1246, name : 'UnexpectedSavingError', message : 'Unexpected error when saving bookmark' },

    // Folder errors
  { code : 1250, name : 'MissingTitle', message : 'Invalid or missing title' },
  { code : 1251, name : 'FolderExists', message : 'User already has a folder with this title' },
  { code : 1252, name : 'FolderWriteError', message : 'Cannot add bookmarks to this folder' },

    // Operational errors
  { code : 1500, name : 'UnexpectedServiceError', message : 'Unexpected service error' },
  { code : 1550, name : 'TextGenerationError', message : 'Error generating text version of this URL' },

    // Highlight Errors
  { code : 1600, name : 'EmptyText', message : 'Cannot create highlight with empty text' },
  { code : 1601, name : 'DuplicateHighlight', message : 'Duplicate highlight' },
];

errors.forEach(function(error) {
  var err = customError(error.name).bind(error.message);
  module.exports[error.name] = module.exports[error.code] = err.bind(err, error.message);
});
