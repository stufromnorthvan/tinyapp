// HELPER Functions ** WARNING: any changes to the following code could SEVERELY affect functionality.

// Finds a user in a given database by their email address

const getUserByEmail = (userEmail, database) => {
  for (let user in database) {
    if (userEmail === database[user].email) {
      return database[user];
    }
  }
  return undefined;
};

// Generates random string of letters and numbers

const generateRandomString = function() {
  let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  let randoString = '';
  let randoInt = function(max) {
    return Math.floor(Math.random() * max);
  };
  for (let r = 0; r < 6; r++) {
    randoString += chars[randoInt(62)];
  }
  return randoString;
};

// Returns URLs created by a specific user based on cookie

const urlsForUser = (id, database) => {
  let userURLS = {};
  for (let url in database) {
    if (id === database[url].userID) {
      userURLS[url] = database[url];
    }
  }
  return userURLS;
};

// Exports functions

module.exports = { getUserByEmail, generateRandomString, urlsForUser }