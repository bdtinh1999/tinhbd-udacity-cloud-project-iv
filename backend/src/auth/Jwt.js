
const { JwtPayload } = require('./JwtPayload');
const { JwtHeader } = require('jsonwebtoken');

class Jwt {
  constructor(header, payload) {
    this.header = header;
    this.payload = payload;
  }
}

module.exports = { Jwt };
