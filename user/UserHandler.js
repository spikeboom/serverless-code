const User = require('./User');

/**
 * Functions
 */

module.exports.getUsers = (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  return getUsers()
    .then(users => ({
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(users)
    }))
    .catch(err => ({
      statusCode: err.statusCode || 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ message: err.message })
    }));
};

/**
 * Helpers
 */

function getUsers() {
  return User.findAll()
    .then(users => ({users: users}))
    .catch(err => Promise.reject(new Error(err)));
}