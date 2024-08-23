const { verify, decode } = require('jsonwebtoken');
const Axios = require('axios');
const { createLogger } = require('../../utils/logger');

const logger = createLogger('auth');

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-1qwfh5shszb4cox1.us.auth0.com/.well-known/jwks.json';

exports.handler = async (event) => {
  logger.info('Authorizing a user', event.authorizationToken);
  try {
    const jwtToken = await verifyToken(event.authorizationToken);
    logger.info('User was authorized', jwtToken);

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    };
  } catch (e) {
    logger.error('User not authorized', { error: e.message });

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    };
  }
};

async function verifyToken(authHeader) {
  const token = getToken(authHeader);
  const jwt = decode(token, { complete: true });
  const _res = await Axios.get(jwksUrl);
  const keys = _res.data.keys;
  const signKeys = keys.find(key => key.kid === jwt.header.kid);

  if (!signKeys) throw new Error('Incorrect Keys');
  const pemDT = signKeys.x5c[0];
  const secret = `-----BEGIN CERTIFICATE-----\n${pemDT}\n-----END CERTIFICATE-----\n`;

  const verifyToken = verify(token, secret, { algorithms: ['RS256'] });

  logger.info('Verify token', verifyToken);
  return verifyToken;
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header');

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header');

  const split = authHeader.split(' ');
  const token = split[1];

  return token;
}
