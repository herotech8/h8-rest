const Jwt = require('jsonwebtoken');

const token = (req, res, next) => {
  req.token = null;
  req.permissions = [];

  var token = null;

  if(req.headers['authorization'] !== undefined && req.headers['authorization'].length > 10) {
    token = req.headers['authorization'].substring(7);
  } else if(req.headers['source-authorization'] !== undefined && req.headers['source-authorization'].length > 10) {
    token = req.headers['source-authorization'].substring(7);
  } else {
    next();

    return;
  }

  if(token == 'null') {
    next();

    return;
  }

  req.user = null;

  if(token == req.config.apiKey) {
    req.token = {
      permissions: [
        'superuser'
      ]
    };

    req.permissions = req.token.permissions || [];

    next();

    return;
  } else {
    var payload = null;

    try {
      payload = Jwt.verify(token, req.config.jwtSecret);
    } catch(err) {
      payload = null;
    }

    req.token = payload;

    if(payload !== null) {
      req.permissions = req.token.permissions || [];
    }
  }

  if(req.config.onTokenVerified !== null && payload !== null) {
    req.config.onTokenVerified(req.token, req.permissions, (user, permissions) => {
      req.user = user;
      req.permissions = permissions;

      next();

      return;
    }, (code, status, message) => {
      res.status(code).json({
        status: status,
        message: message
      });

      return;
    });
  } else {
    next();

    return;
  }
};

module.exports = token;

//
