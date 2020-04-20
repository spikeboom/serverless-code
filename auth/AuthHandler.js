const User = require('../user/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs-then');

/* 
 * Functions
 */

module.exports.login = (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  return login(JSON.parse(event.body))
    .then(session => ({
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(session)
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

module.exports.register = (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  return register(JSON.parse(event.body))
    .then(session => ({
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(session)
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

module.exports.me = (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  return me(event.requestContext.authorizer.principalId)
    .then(session => ({
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(session)
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

function signToken(id) {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: 86400 // expires in 24 hours
  });
}

function checkIfInputIsValid(eventBody) {
  if (
    !(eventBody.password &&
      eventBody.password.length >= 7)
  ) {
    return Promise.reject(new Error('Password error. Password needs to be longer than 8 characters.'));
  }

  if (
    !(eventBody.name &&
      eventBody.name.length > 5 &&
      typeof eventBody.name === 'string')
  ) return Promise.reject(new Error('Username error. Username needs to longer than 5 characters'));

  if (
    !(eventBody.email &&
      typeof eventBody.name === 'string')
  ) return Promise.reject(new Error('Email error. Email must have valid characters.'));

  return Promise.resolve();
}

function register(eventBody) {
  return checkIfInputIsValid(eventBody) // validate input
    .then(() => 
      User.findOne({ where: { email: eventBody.email }}) // check if user exists
    )
    .then(user => 
      user
        ? Promise.reject(new Error('User with that email exists.'))
        : bcrypt.hash(eventBody.password, 8) // hash the pass
    )
    .then(hash =>
      User.create({ name: eventBody.name, email: eventBody.email, password: hash }) // create the new user
    )
    .then(user => ({ auth: true, userId: user.id, token: signToken(user.id) })); // sign the token and send it back
  }

function login(eventBody) {
  let userId;
  return User.findOne({ where: { email: eventBody.email }})
    .then(user => {
      user && (userId = user.id);
      return !user
        ? Promise.reject(new Error('User with that email does not exits.'))
        : comparePassword(eventBody.password, user.password, user.id)
    })
    .then(token => ({ auth: true, userId: userId, token: token }));
}

function comparePassword(eventPassword, userPassword, userId) {
  return bcrypt.compare(eventPassword, userPassword)
    .then(passwordIsValid =>
      !passwordIsValid
        ? Promise.reject(new Error('The credentials do not match.'))
        : signToken(userId)
    );
}

function me(userId) {
  return User.findByPk(userId)
    .then(user =>
      !user
        ? Promise.reject('No user found.')
        : user
    )
    .catch(err => Promise.reject(new Error(err)));
}