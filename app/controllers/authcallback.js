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
                var errorHandler = function(area, e) {
                  return function(e) {
                    res.send(`${area}: ${e}`);
                  }
                };

                client.getUserInfo(authData.access_token, function(userResp) {
                  var id = JSON.parse(userResp).id;
                  client.getCurrentUserPlaylists(authData.accessToken, function(playlistsRespJson) {
                    var playlists = JSON.parse(playlistsRespJson);
                    var playlistTitles = playlists.items.map(function(p) { return `<li>${p.name}</li>`; }).join('\r\n');
                    res.send(`<h2>Welcome, ${id}!<h2><p>In case you forgot, here are your playlists:</p><ul>${playlistTitles}</ul>`);

                  }, errorHandler('playlists'));
                }, errorHandler('user info'));

                // res.send(`Access token: ${authData.access_token}\r\nRefresh token: ${authData.refresh_token}`);

            } catch (err) {
                console.error('An error ocurred while reading the Spotify auth endpoint response', err);
            }            
        });
  });

  tokenReq.write(data);
  tokenReq.end();  
});
