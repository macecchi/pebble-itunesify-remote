var gui = require('nw.gui');
var express = require('express');
var app = express();
var iTunes = require('local-itunes');
var spotify = require('spotify-node-applescript');
var storage = require('node-persist');

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
    label: 'Exit',
    click: function() { 
    	console.log('Clicked exit menu');
        server.close();
		gui.App.quit();
    }
}));

// Playback control

app.get('/playpause', function(req, res){
    console.log("[GET] /playpause");
    if (activePlayer == 'itunes') {
        iTunes.playpause();
        iTunes.playerState(function(error, state){
          // res.json({ state: state });
        });
    }
    else if (activePlayer == 'spotify') {
        spotify.playPause(function(error, state){
            // res.json({ state: state.state });
        });
    }
    res.end();
});

app.get('/current_app', function(req, res){
    console.log("[GET] /current_app");
    res.send(activePlayer);
});

app.get('/previous', function(req, res){
    console.log("[GET] /previous");
    if (activePlayer == 'itunes') {
        iTunes.previous();
    }
    else if (activePlayer == 'spotify') {
        spotify.previous(function(error, state){
            // res.json({ state: state.state });
        });
    }
    res.end();
});

app.get('/next', function(req, res){
    console.log("[GET] /next");
    if (activePlayer == 'itunes') {
        iTunes.next();
    }
    else if (activePlayer == 'spotify') {
        spotify.next(function(error, state){
            // res.json({ state: state.state });
        });
    }
    res.end();
});

server = app.listen(port);
console.log('Pebble iTunes Remote Server started on port ' + port);