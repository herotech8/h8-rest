const Jwt = require('jsonwebtoken');

const token = (req, res, next) => {
  req.token = null;
  req.permissions = [];

  if(req.headers['authorization'] === undefined) {
    next();
    
    return;
  }

  var token = req.headers['authorization'].substring(7);
  
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

    return next();
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

      return next();
    }, (code, status, message) => {
      return res.status(code).json({
        status: status,
        message: message
      });
    });
  } else {
    return next();
  }
};

module.exports = token;
