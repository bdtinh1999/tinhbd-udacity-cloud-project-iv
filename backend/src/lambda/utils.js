const { parseUserId } = require('../auth/utils');

function getUserId(event) {
  const authorization = event.headers.Authorization;
  const split = authorization.split(' ');
  const jwtToken = split[1];

  return parseUserId(jwtToken);
}

module.exports = { getUserId };
