var express = require('express'),
  router = express.Router();

module.exports = function (app) {
  app.use('/authcallback', router);
};

router.get('/authcallback', function (req, res, next) {
  res.send('Hello from the auth callback');
});
