var express = require('express'),
  querystring = require('querystring'),
  router = express.Router(),
  https = require('https'),
  config = require('../../config/config'),
  client = new (require('../spotify/client'))();

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
      'Accept': 'application/json',
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
                req.session.wisp = { logged: true };
                var authData = JSON.parse(body);

                client.getUserMail(authData.access_token, function(resp) { res.send(resp); }, function() { res.send('/me: error'); })

                // res.send(`Access token: ${authData.access_token}\r\nRefresh token: ${authData.refresh_token}`);

            } catch (err) {
                console.error('An error ocurred while reading the Spotify auth endpoint response', err);
            }            
        });
  });

  tokenReq.write(data);
  tokenReq.end();  
});
