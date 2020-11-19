const Jwt = require('jsonwebtoken');

const token = (req, res, next) => {
  req.token = null;

  if(req.headers['authorization'] === undefined) {
    return next();
  }

  var token = req.headers['authorization'].substring(7);

  if(token == req.config.apiKey) {
    req.token = {
      permissions: [
        'superuser'
      ]
    };

    return next();
  } else {
    var payload = null;

    try {
      payload = Jwt.verify(token, req.config.jwtSecret);
    } catch(err) {
      payload = null;
    }

    req.token = payload;
    req.permissions = payload.permissions || [];

    if(req.config.onRetrievePermissions === null) {
      return next();
    } else {
      var retrievePermissionsCb = (permissions) => {
        req.permissions = permissions;

        next();
      };

      req.config.onRetrievePermissions(req.permissions, retrievePermissionsCb);
    }
  }
};

module.exports = token;
