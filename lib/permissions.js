const permissions = {
  check: (config, permissions) => {
    return (req, res, next) => {
      if(req.token === undefined || req.token === null) {
        return res.status(401).json({
          status: 'Unauthorized',
          message: 'No token provided'
        });
      }

      if(permissions === true) {
        return next();
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
