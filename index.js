var pjson = require('./package.json');
var gui = require('nw.gui');
var express = require('express');
var app = express();
var iTunes = require('local-itunes');
var spotify = require('spotify-node-applescript');
var storage = require('node-persist');
var volume = require('osx-wifi-volume-remote');

var port = 8080;
var server;

// Load preferences

storage.initSync();

if (typeof storage.getItem('activePlayer') === 'undefined') {
    storage.setItem('activePlayer','itunes');
}
var activePlayer = storage.getItem('activePlayer');
console.log("Starting with active player: " + activePlayer);

// GUI

var localIP;

require('dns').lookup(require('os').hostname(), function (err, add, fam) {
  localIP = add;
	menu.insert(new gui.MenuItem({
	    label: 'Server running on ' + localIP,
	    enabled: false
	}), 0);
})

var tray = new gui.Tray({
    icon: 'resources/images/bar_icon.png'
});

var menu = new gui.Menu();
tray.menu = menu;

menu.append(new gui.MenuItem({
    type: 'separator'
}));

var iTunesMenuItem = new gui.MenuItem({
    label: 'Control iTunes',
    type: 'checkbox',
    checked: (activePlayer === 'itunes'),
    click: function() { 
        console.log('Switching to iTunes control');
        activePlayer = 'itunes';
        storage.setItem('activePlayer','itunes');
        spotifyMenuItem.checked = false;
    }
});
menu.append(iTunesMenuItem);

var spotifyMenuItem = new gui.MenuItem({
    label: 'Control Spotify',
    type: 'checkbox',
    checked: (activePlayer === 'spotify'),
    click: function() { 
        console.log('Switching to Spotify control');
        activePlayer = 'spotify';
        storage.setItem('activePlayer','spotify');
        iTunesMenuItem.checked = false;
    }
});
menu.append(spotifyMenuItem);

menu.append(new gui.MenuItem({
    type: 'separator'
}));

menu.append(new gui.MenuItem({
    label: 'iTunesify Remote v' + pjson.version,
	enabled: false
}));

menu.append(new gui.MenuItem({
    label: 'Quit',
    click: function() { 
    	console.log('Clicked exit menu');
        server.close();
		gui.App.quit();
    }
}));

// Playback control
function getiTunesTrackAndState(callback) {
    iTunes.currentTrack(function(error, track){
        var trackShort = track ? { name: track.name, artist: track.artist, album: track.album } : {};
        iTunes.playerState(function(error, state){
            callback({ track: trackShort, state: state });
        });
    });
}

function getSpotifyTrackAndState(callback) {
    spotify.getTrack(function(error, track){
        var trackShort = track ? { name: track.name, artist: track.artist, album: track.album } : {};
        spotify.getState(function(error, state){
           callback({ track: trackShort, state: state.state });
        });
    });
}

app.get('/', function(req, res){
    console.log("[GET] /");
    if (activePlayer == 'itunes') {
        getiTunesTrackAndState(function(data){
            res.json(data);
        });
    }
    else if (activePlayer == 'spotify') {
        getSpotifyTrackAndState(function(data){
            res.json(data);
        });
    }
});

app.get('/playpause', function(req, res){
    console.log("[GET] /playpause");
    if (activePlayer == 'itunes') {
        iTunes.playpause(function(error) {
            getiTunesTrackAndState(function(data){
                res.json(data);
            });
        });
    }
    else if (activePlayer == 'spotify') {
        spotify.playPause(function(error, state){
            getSpotifyTrackAndState(function(data){
                res.json(data);
            });
        });
    }
});

app.get('/current_app', function(req, res){
    console.log("[GET] /current_app");
    res.send(activePlayer);
});

app.get('/current_app/:app', function(req, res){
    console.log("[GET] /current_app/" + req.params.app);

    if (req.params.app === 'spotify') {
        console.log('Switching to Spotify control');
        activePlayer = 'spotify';
        storage.setItem('activePlayer','spotify');
        iTunesMenuItem.checked = false;
        spotifyMenuItem.checked = true;
        res.send(activePlayer);
    }
    else if (req.params.app === 'itunes') {
        console.log('Switching to iTunes control');
        activePlayer = 'itunes';
        storage.setItem('activePlayer','itunes');
        iTunesMenuItem.checked = true;
        spotifyMenuItem.checked = false;
        res.send(activePlayer);
    }
    else {
        res.send('err');
    }
});

app.get('/previous', function(req, res){
    console.log("[GET] /previous");
    if (activePlayer == 'itunes') {
        iTunes.previous(function(error){
            getiTunesTrackAndState(function(data){
                res.json(data);
            });
        });
    }
    else if (activePlayer == 'spotify') {
        spotify.previous(function(error, state){
            getSpotifyTrackAndState(function(data){
                res.json(data);
            })
        });
    }
});

app.get('/next', function(req, res){
    console.log("[GET] /next");
    if (activePlayer == 'itunes') {
        iTunes.next(function(error){
            getiTunesTrackAndState(function(data){
                res.json(data);
            });
        });
    }
    else if (activePlayer == 'spotify') {
        spotify.next(function(error, state){
            getSpotifyTrackAndState(function(data){
                res.json(data);
            })  	
        });
    }
});

app.get('/volume/', function(req, res){
    console.log("[GET] /volume");
    volume.get(function(err, volume, muted) {
        res.json({ volume: volume, muted: muted, err: err });
    });
});

app.get('/volume/:vol', function(req, res){
    console.log("[GET] /volume/" + req.params.vol);

    if (req.params.vol === 'up') {
        volume.fadeBy(function(err, volume, muted) {
            res.json({ volume: volume, muted: muted, err: err });
        }, 10, 1.0);
    } 
    else if (req.params.vol === 'down') {
        volume.fadeBy(function(err, volume, muted) {
            res.json({ volume: volume, muted: muted, err: err });
        }, -10, 1.0);
    }
    else if (!isNaN(req.params.vol)) {
        volume.set(function(err, volume, muted) {
            res.json({ volume: volume, muted: muted, err: err });
        }, req.params.vol);
    }
    
});


server = app.listen(port);
console.log('iTunesify Remote started on port ' + port);