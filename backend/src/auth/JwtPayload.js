class JwtPayload {
  constructor(iss, sub, iat, exp) {
    this.iss = iss;
    this.sub = sub;
    this.iat = iat;   
    this.exp = exp;   
  }
}

module.exports = { JwtPayload };
