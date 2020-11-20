const express = require('express');
const cors = require('cors');
const permissions = require('./permissions.js');
const token = require('./token.js');
const uniqid = require('uniqid');

function resolveController(directory, path) {
  var parts = path.split('@'),
      resolvedController = require(directory + '/' + parts[0] + '.js'),
      resolvedMethod = parts[1];

  var resolved = resolvedController[resolvedMethod];

  if(resolved === undefined) {
    return (eq, res) => {
      return res.error(404, 'Not Found');
    };
  }

  return resolved;
}

class _server {
  constructor() {
    this.app = express();

    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(cors());

    this.app.use((req, res, next) => {
      req.config = this.config;

      res.json = (message) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(message));
      };

      res.error = (status, message, additional) => {
        additional = (additional === undefined ? {} : additional);

        res.status(status).json(Object.assign({
          status: 'Error',
          message: message
        }, additional));
      };

      res.success = (status, message, additional) => {
        additional = (additional === undefined ? {} : additional);

        res.status(status).json(Object.assign({
          status: 'OK',
          message: message
        }, additional));
      };

      req.hasQuery = (key) => {
        return !(req.query[key] === undefined || req.query[key] === null);
      };

      req.server = this;

      next();
    });

    this.controllerDirectory = __dirname;
    this.routePrefix = null;
    this.onTokenVerified = null;

    this.config = {
      apiKey: uniqid() + uniqid() + uniqid() + uniqid() + uniqid(),
      jwtSecret: uniqid()
    };

    this.permissions = [];
  }

  configure(config) {
    this.config = config;

    if(config.controllerDirectory !== undefined) {
      this.controllerDirectory = config.controllerDirectory;
    }

    if(config.routePrefix !== undefined) {
      if(config.routePrefix.substring(0, 1) != '/') {
        config.routePrefix = '/' + config.routePrefix;
      }

      this.routePrefix = config.routePrefix;
    }
  }

  setControllerDirectory(dir) {
    this.controllerDirectory = dir;
  }

  setRoutePrefix(prefix) {
    this.routePrefix = prefix;
  }

  use(cb) {
    this.app.use(cb);
  }

  register(method, endpoint, controller, permission) {
    var controller = resolveController(this.controllerDirectory, controller);

    endpoint = this.routePrefix + endpoint;

    console.log(method, endpoint, permission);

    if(permission !== undefined) {
      this.app[method](endpoint, token, permissions.check(this.config, permission), controller);
    } else {
      this.app[method](endpoint, token, controller);
    }

    if(!this.permissions.includes(permission)) {
      this.permissions.push(permission);
    }
  }

  get(endpoint, controller, permission) {
    this.register('get', endpoint, controller, permission);
  }

  post(endpoint, controller, permission) {
    this.register('post', endpoint, controller, permission);
  }

  put(endpoint, controller, permission) {
    this.register('put', endpoint, controller, permission);
  }

  delete(endpoint, controller, permission) {
    this.register('delete', endpoint, controller, permission);
  }

  crud(prefix, controller) {
    this.register('get', '/' + prefix, controller + '@index', 'api.view-' + prefix);
    this.register('get', '/' + prefix + '/:id', controller + '@show', 'api.view-' + prefix);
    this.register('post', '/' + prefix, controller + '@store', 'api.update-' + prefix);
    this.register('put', '/' + prefix + '/:id', controller + '@update', 'api.update-' + prefix);
    this.register('delete', '/' + prefix + '/:id', controller + '@delete', 'api.delete-' + prefix);
  }

  listen(port) {
    this.app.listen(port);
  }
}

module.exports = new _server;
