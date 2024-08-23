const { decode } = require('jsonwebtoken');

function parseUserId(jwtToken) {
  const decodedJwt = decode(jwtToken);
  return decodedJwt.sub;
}

module.exports = { parseUserId };
