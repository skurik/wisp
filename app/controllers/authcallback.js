var express = require('express'),
  router = express.Router(),
  https = require('https'),
  config = require('../../config/config');

module.exports = function (app) {
  app.use('/authcallback', router);
};

router.get('/', function (req, res, next) {

  https.post({
    host: config.spotifyAuthUriHost,
    path: config.spotifyAuthTokenUriPath + '?grant_type=authorization_code&code=' + req.query.code + '&redirect_uri=' + encodeURIComponent(config.authRedirectUri),
    headers: {
      'Authorization': 'Basic ' + new Buffer(config.spotifyClientId + ':' + config.spotifyClientSecret).toString('base64')
    }
  }, function(spotifyRes) {
        
        var body = '';
        spotifyRes.on('data', function(d) {
            body += d;
        });
        
        spotifyRes.on('end', function() {
            try {
                console.log('Read the following from the Spotify\'s auth endpoint:\n');
                console.log(body);
                res.send(body);

            } catch (err) {
                console.error('An error ocurred while reading the Spotify auth endpoint response', err);
            }            
        });
  });

  //res.send('code: ' + req.query.code + '<br />state: ' + req.query.state);
});
