var express = require('express'),
  router = express.Router(),
  config = require('../../config/config');

const https = require('https');

module.exports = function (app) {
  app.use('/', router);
};

router.get('/test', function(req, res, next) {
    res.send('spotifyClientId: ' + config.spotifyClientId + '<br />process.env.NODE_ENV: ' + process.env.NODE_ENV);
});

router.get('/', function (req, res, next) {

  var authUri = config.spotifyAuthUriPath + '?client_id=' + config.spotifyClientId + '&response_type=code&state=0&scopes=' + encodeURIComponent(config.spotifyAuthScopes) + '&redirect_uri=' + encodeURIComponent(config.authRedirectUri);
  var authAbsoluteUri = 'https://' + config.spotifyAuthUriHost + authUri;
  console.log(authUri);

  res.redirect(authAbsoluteUri);  

  /*https.get({
        host: spotifyAuthUriHost,        
        path: authUri
    }, function(spotifyRes) {
        
        var body = '';
        spotifyRes.on('data', function(d) {
            body += d;
        });
        
        spotifyRes.on('end', function() {
            try {
                console.log('Read the following from the Spotify\'s auth endpoint:\n');
                console.log(body);
                res.end('');

            } catch (err) {
                console.error('An error ocurred while reading the Spotify auth endpoint response', err);
            }            
        });
  });*/

  /*var articles = [new Article(), new Article()];
    res.render('index', {
      title: 'Wisp',
      articles: articles
    });*/
});
