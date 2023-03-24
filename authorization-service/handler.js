module.exports.basicAuthorizer = (event, context, callback) => {
  console.log('Event:', event);
  const { authorizationToken, type } = event;

  if (type !== 'TOKEN') {
    return callback('Unauthorized');
  }

  try {
    const encodedCredentials = authorizationToken.split(' ')[1];
    const buff = Buffer.from(encodedCredentials, 'base64');
    const plainCredentials = buff.toString('utf-8').split(':');
    const username = plainCredentials[0];
    const password = plainCredentials[1];

    const expectedPassword = process.env[`${username}`];
    const effect = !expectedPassword || expectedPassword !== password ? 'Deny' : 'Allow';

    return callback(null, {
      principalId: encodedCredentials,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [{
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: event.methodArn,
        }],
      },
    });
  } catch (e) {
    return callback(`Unauthorized ${e.message}`);
  }
};
