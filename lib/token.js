const Jwt = require('jsonwebtoken');

const token = (req, res, next) => {
  req.token = null;

  if(req.headers['authorization'] === undefined) {
    next();

    return;
  }

  var token = req.headers['authorization'].substring(7);

  if(token == req.config.apiKey) {
    req.token = {
      permissions: [
        'superuser'
      ]
    };
  } else {
    var payload = null;

    try {
      payload = Jwt.verify(token, req.config.jwtSecret);
    } catch(err) {
      payload = null;
    }

    req.token = payload;
  }

  next();
};

module.exports = token;
