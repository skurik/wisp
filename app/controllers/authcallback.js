var express = require('express'),
  querystring = require('querystring'),
  router = express.Router(),
  https = require('https'),
  config = require('../../config/config');

module.exports = function (app) {
  app.use('/authcallback', router);
};

router.get('/', function (req, res, next) {

  var data = querystring.stringify({
      grant_type: 'authorization_code',
      code: req.query.code,
      redirect_uri: encodeURIComponent(config.authRedirectUri)
  });

  var options = {
    method: 'POST',
    port: 443,
    host: config.spotifyAuthUriHost,
    path: config.spotifyAuthTokenUriPath,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(data),
      'Authorization': 'Basic ' + new Buffer(config.spotifyClientId + ':' + config.spotifyClientSecret).toString('base64')
    }
  };

  var tokenReq = https.request(options, function(spotifyRes) {
        
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

  tokenReq.write(data);
  tokenReq.end();  
});
