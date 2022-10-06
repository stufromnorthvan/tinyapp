//HELPER Functions

//Finds a user in a given database by their email address

const getUserByEmail = (userEmail, database) => {
  for (let user in database) {
    if (userEmail === database[user].email) {
      return database[user];
    }
  }
  return undefined;
};

// Exports function

module.exports = getUserByEmail;