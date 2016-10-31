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
                    res.send(`${area}: ${e}<br />Access token: ${authData.access_token}`);
                  }
                };

                client.getUserInfo(authData.access_token, function(userResp) {
                  var id = JSON.parse(userResp).id;
                  // res.send(userResp);

                  client.getCurrentUserPlaylists(authData.access_token, function(playlistsRespJson) {
                    var playlists = JSON.parse(playlistsRespJson).items;
                    //res.send(JSON.stringify(JSON.parse(playlistsRespJson).items));
                    //return;

                    //var playlists = JSON.parse(playlistsRespJson).items;
                    var artistCounter = {};

                    var cnt = 0;
                    playlists.forEach(function(p) {
                      cnt++;
                    });

                    client.getPlaylistTracks(authData.access_token, playlists[0], function (tracksJson) {
                          //res.send(tracksJson);
                          //return;
                          
                          var tracks = JSON.parse(tracksJson).items;
                          tracks.forEach(function(track) {
                            if (track.artists && track.artists.length > 0) {
                              var artist = track.artists[0].name;
                              if (artistCounter.hasOwnProperty(artist)) {
                                artistCounter[artist]++;
                              } else {
                                artistCounter[artist] = 1;
                              }                              
                            }
                          });

                          res.send(`${typeof playlists}<br /><pre>${JSON.stringify(playlists)}</pre><br/>Counter: ${cnt}<br /><pre>${JSON.stringify(tracks)}</pre><br />Track count: ${tracks.length}<br />Artist counter:<br /><pre>${JSON.stringify(artistCounter)}</pre>`);
                          return;

                        }, errorHandler('playlist tracks'));

                    /*res.send(`${typeof playlists}<br /><pre>${JSON.stringify(playlists)}</pre><br/>Counter: ${cnt}`);
                    return;

                    playlists.forEach(function(p) {                        
                        client.getPlaylistTracks(authData.access_token, p, function (tracksJson) {
                          //res.send(tracksJson);
                          //return;
                          var tracks = JSON.parse(tracksJson).items;
                          tracks.forEach(function(track) {
                            if (track.artists && track.artists.length > 0) {
                              var artist = track.artists[0].name;
                              if (typeof artistCounter.artist !== 'undefined') {
                                artistCounter[artist]++;
                              } else {
                                artistCounter[artist] = 1;
                              }                              
                            }
                          });
                        }, errorHandler('playlist tracks'));                    
                    });

                    var playlistTitles = playlists.map(function(p) { return `<li>${p.name}</li>`; }).join('\r\n');
                    var artistCounts = [];
                    for (var artistName in artistCounter) {
                      if (artistCounter.hasOwnProperty(artistName)) {
                        artistCounts.push({ artistName: artistName, count: artistCounter[artistName] });
                      }
                    }

                    var artistCountOutput = JSON.stringify(artistCounter);// artistCounts.map(function(a) { return `<li>${a.artistName}: ${a.count}`; }).join('\r\n');

                    // var artistCountOutput = artistCounts.map(function(a) { return `<li>${a.artistName}: ${a.count}`; }).join('\r\n');

                    res.send(`<h2>Welcome, ${id}!</h2><p>In case you forgot, here are your playlists:</p><ul>${playlistTitles}</ul><br />${artistCountOutput}`);*/

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
