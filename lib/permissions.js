const Jwt = require('jsonwebtoken');

var specialApiKey = 'xCJBMz6oCKWndDjgJfzRwYkRWeas3jfhmdWx7VWx';

function extractPermissions(config, req) {
  if(req.headers['authorization'] === undefined) {
    throw "No token provided";
  }

  var token = req.headers['authorization'].substring(7);

  if(token == specialApiKey) {
    return {
      permissions: [
        'superuser'
      ]
    };
  }

  try {
    return Jwt.verify(token, config.jwtSecret);
  } catch(err) {
    throw "Invalid token provided";
  }
}

const permissions = {
  check: (config, permissions) => {
    return (req, res, next) => {
      try {
        req.token = extractPermissions(config, req);
      } catch(err) {
        return res.status(401).json({
          status: 'Unauthorized',
          message: err
        });
      }

      if(!req.token.permissions.includes(permissions) && !req.token.permissions.includes('superuser')) {
        return res.status(401).json({
          status: 'Unauthorized',
          message: 'Insufficient permissions'
        });
      }

      return next();
    };
  }
};

module.exports = permissions;
