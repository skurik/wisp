var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = require('./config.' + env);

var envConfig = {
  development: {
    root: rootPath,
    app: {
      name: 'wisp'
    },
    port: process.env.PORT || 3000,
  },

  test: {
    root: rootPath,
    app: {
      name: 'wisp'
    },
    port: process.env.PORT || 3000,
  },

  production: {
    root: rootPath,
    app: {
      name: 'wisp'
    },
    port: process.env.PORT || 3000,
  }
};

module.exports = Object.assign(config, envConfig[env]);