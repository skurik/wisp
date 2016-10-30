var config = require('../../config/config');
var https = require('https');

module.exports = function () {
    var self = this;

    self.getUserInfo = function(accessToken, success, error) {
        self.get(config.spotifyApiHost, '/v1/me', accessToken, success, error);
    };

    self.getCurrentUserPlaylists = function(accessToken, success, error) {
        self.get(config.spotifyApiHost, '/v1/me/playlists', accessToken, success, error);
    };

    self.getUserPlaylists = function(accessToken, userId, success, error) {
        self.get(config.spotifyApiHost, `/v1/users/${userId}/playlists`, success, error);
    };

    self.getPlaylistTracks = function(accessToken, playlist, success, error) {
        self.get(config.spotifyApiHost, playlist.tracks.href.substring(`https://${config.spotifyApiHost}`.length), success, error);
    }

    self.request = function(hostName, uri, method, accessToken, body, success, error) {
        var options = {
            method: method,
            port: 443,
            host: hostName,
            path: uri,
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + accessToken
            }
        };

        if (body != null) {
            options.headers['Content-Type'] = 'application/json';
            options.headers['Content-Length'] = Buffer.byteLength(body);
        }

        var req = https.request(options, function (res) {
            var responseBody = '';
            res.on('data', function(d) {
                responseBody += d;
            });
            
            res.on('end', function() {
                try {
                    console.log('Read the following from the Spotify\'s auth endpoint:\n');
                    console.log(responseBody);                
                    //var authData = JSON.parse(responseBody);
                    success(responseBody);
                    //res.send(`Access token: ${authData.access_token}\r\nRefresh token: ${authData.refresh_token}`);

                } catch (err) {
                    console.error('An error ocurred while reading the Spotify auth endpoint response', err);
                    error(err);
                }            
            });
        });

        if (body != null) {
            req.write(data);
        }
        
        req.end();  
    };    

    self.get = function(hostName, uri, accessToken, success, error) {
        self.request(hostName, uri, 'GET', accessToken, null, success, error);
    };
};