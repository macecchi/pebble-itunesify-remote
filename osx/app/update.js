var https = require('https');
var pjson = require('./package.json');

var currentVersion = pjson.version;
var githubRepo = 'macecchi/pebble-itunesify-remote';

function checkForUpdates(callback) {
    var options = {
        host: 'api.github.com',
        path: '/repos/' + githubRepo + '/tags',
        headers: {
            'User-Agent': 'iTunesify Remote ' + currentVersion
        }
    };

    https.get(options, function(res) {
        if (res.statusCode !== 200) {
            callback({ statusCode: res.statusCode });
            return;
        }

        var response = '';

        res.on('data', function(chunk) {
            response = response + chunk;
        });

        res.on('end', function() {
            var tags = JSON.parse(response);
            var latestTag = tags[0];
            var latestVersion = latestTag.name;
            if (latestVersion.charAt(0) == 'v') {
                latestVersion = latestVersion.substr(1);
            }
            
            var needsUpdate = versionNeedsUpdate(latestVersion);
            var releasePage = null;
            if (needsUpdate) {
                releasePage = 'https://github.com/' + githubRepo + '/releases/tag/' + latestTag.name
            }

            callback(null, needsUpdate, releasePage);
        });

    }).on('error', function(e) {
        console.log("Got error: " + e.message);
        callback(e);
    });
}

function versionNeedsUpdate(version) {
    var comp = compareVersions(version, currentVersion);
    return comp > 0;
}

function compareVersions(a, b) {
    if (a === b) {
       return 0;
    }

    var a_components = a.split(".");
    var b_components = b.split(".");

    var len = Math.min(a_components.length, b_components.length);

    // loop while the components are equal
    for (var i = 0; i < len; i++) {
        // A bigger than B
        if (parseInt(a_components[i]) > parseInt(b_components[i])) {
            return 1;
        }

        // B bigger than A
        if (parseInt(a_components[i]) < parseInt(b_components[i])) {
            return -1;
        }
    }

    // If one's a prefix of the other, the longer one is greater.
    if (a_components.length > b_components.length) {
        return 1;
    }

    if (a_components.length < b_components.length) {
        return -1;
    }

    // Otherwise they are the same.
    return 0;
}

module.exports = {
    checkForUpdates: checkForUpdates
}