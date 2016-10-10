var express = require('express'),
  router = express.Router(),  
  Article = require('../models/article');

const https = require('https');
const spotifyAuthUriHost = 'accounts.spotify.com';
const spotifyAuthUriPath = '/authorize';
const clientId = '92bacd0d9e1e4a6babeb8dc7ee6811ca';
const clientSecret = 'e2cdde47291f4994a3ae6db46a02dc65';
const redirectUri = 'http://wispyo.azurewebsites.net/authcallback';

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {

  var authUri = spotifyAuthUriPath + '?client_id=' + clientId + '&response_type=code&state=0&redirect_uri=' + redirectUri;
  var authAbsoluteUri = 'https://' + spotifyAuthUriHost + authUri;
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
