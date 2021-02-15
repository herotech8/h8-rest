const permissions = {
  check: (config, permissions) => {
    return (req, res, next) => {
      if(req.token === undefined || req.token === null) {
        res.status(401).json({
          status: 'Unauthorized',
          message: 'No token provided'
        });

        return;
      }

      if(permissions === true) {
        next();

        return;
      }

      if(!req.permissions.includes(permissions) && !req.permissions.includes('superuser')) {
        return res.status(401).json({
          status: 'Unauthorized',
          message: 'Insufficient permissions'
        });
      }

      next();

      return;
    };
  }
};

module.exports = permissions;
