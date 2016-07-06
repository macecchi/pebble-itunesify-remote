const {app, Menu, MenuItem, Tray} = require('electron')

const server = require('express')();
const iTunes = require('local-itunes');
const open = require('open');
const pjson = require('./package.json');
const spotify = require('spotify-node-applescript');
const storage = require('node-persist');
const update = require('./update');
const volume = require('osx-wifi-volume-remote');

const port = 8080

let tray = null, menu = null
let serverInstance = null

app.on('ready', () => {
    app.dock.hide()
    tray = new Tray('images/TrayIconTemplate.png')
    tray.setToolTip('iTunesify Remote v' + pjson.version)
    loadMenu()
})

// Load preferences
storage.initSync()

if (typeof storage.getItem('activePlayer') === 'undefined') {
    storage.setItem('activePlayer', 'itunes');
}
var activePlayer = storage.getItem('activePlayer');
console.log("Starting with active player: " + activePlayer);

if (typeof storage.getItem('controlGlobalVolume') === 'undefined') {
    storage.setItem('controlGlobalVolume', true);
}
var controlGlobalVolume = storage.getItem('controlGlobalVolume');
console.log("Controls global volume: " + controlGlobalVolume);


// GUI

function loadMenu() {
    menu = new Menu()

    menu.append(new MenuItem({
        label: 'Detecting IP...',
        enabled: false,
        visible: false
    }))

    menu.append(new MenuItem({
        type: 'separator'
    }));

    // GUI player options

    menu.append(new MenuItem({
        label: 'Player',
        enabled: false
    }));

    var iTunesMenuItem = new MenuItem({
        label: 'iTunes',
        type: 'checkbox',
        checked: (activePlayer === 'itunes'),
        click: function() { 
            console.log('Switching to iTunes control');
            activePlayer = 'itunes';
            storage.setItem('activePlayer', 'itunes');
            spotifyMenuItem.checked = false;
        }
    });
    menu.append(iTunesMenuItem);

    var spotifyMenuItem = new MenuItem({
        label: 'Spotify',
        type: 'checkbox',
        checked: (activePlayer === 'spotify'),
        click: function() { 
            console.log('Switching to Spotify control');
            activePlayer = 'spotify';
            storage.setItem('activePlayer', 'spotify');
            iTunesMenuItem.checked = false;
        }
    });
    menu.append(spotifyMenuItem);

    menu.append(new MenuItem({ type: 'separator' }));

    // GUI volume options

    menu.append(new MenuItem({
        label: 'Volume',
        enabled: false
    }));

    var globalVolumeMenuItem = new MenuItem({
        label: 'Global volume',
        type: 'checkbox',
        checked: controlGlobalVolume,
        click: function() { 
            controlGlobalVolume = true;
            console.log('Controlling system volume');
            storage.setItem('controlGlobalVolume', true);
            globalVolumeMenuItem.checked = true;
            playerVolumeMenuItem.checked = false;
        }
    });
    menu.append(globalVolumeMenuItem);

    var playerVolumeMenuItem = new MenuItem({
        label: 'Player volume',
        type: 'checkbox',
        checked: !controlGlobalVolume,
        click: function() { 
            controlGlobalVolume = false;
            console.log('Controlling player volume')
            storage.setItem('controlGlobalVolume', false);
            globalVolumeMenuItem.checked = false;
            playerVolumeMenuItem.checked = true;
        }
    });
    menu.append(playerVolumeMenuItem);

    menu.append(new MenuItem({ type: 'separator' }));

    // GUI info

    menu.append(new MenuItem({
        label: 'iTunesify Remote v' + pjson.version,
        enabled: false
    }));

    menu.append(new MenuItem({
        label: 'Check for updates...',
        click: function () {
            update.checkForUpdates( (err, needsUpdate, releasePage) => {
                if (err) {
                    alert('An error occurred while checking for updates.');
                    return;
                }
                
                if (needsUpdate) {
                    var update = confirm('An update is available for iTunesify Remote. Click OK to open the download page.');
                    if (update) {
                        open(releasePage);
                    }
                } else {
                    alert('No updates available. You already have the latest version of iTunesify Remote. Thanks!');
                }
            });
        }
    }));

    menu.append(new MenuItem({
        label: 'Quit',
        click: function() { 
            console.log('Exiting...')
            serverInstance.close()
            app.quit()
        }
    }));

    tray.setContextMenu(menu)
    detectIP()
}

function detectIP() {
    require('dns').lookup(require('os').hostname(), function (err, ip, fam) {
        menu.insert(0, new MenuItem({
            label: 'Server running on ' + ip,
            enabled: false
        }))
        tray.setContextMenu(menu)
    })
}

// Playback control
function getiTunesTrackAndState(callback) {
    iTunes.currentTrackMini(function(error, track){
        var trackShort = track ? { name: track.name, artist: track.artist } : {};
        iTunes.playerState(function(error, state){
            callback({ track: trackShort, state: state });
        });
    });
}

function getSpotifyTrackAndState(callback) {
    spotify.getTrack(function(error, track){
        var trackShort = track ? { name: track.name, artist: track.artist } : {};
        spotify.getState(function(error, state){
           callback({ track: trackShort, state: state.state });
        });
    });
}

server.get('/', function(req, res){
    console.log("[GET] /");
    if (activePlayer == 'itunes') {
        getiTunesTrackAndState(function(data){
            data.player = 'itunes';
            res.json(data);
        });
    }
    else if (activePlayer == 'spotify') {
        getSpotifyTrackAndState(function(data){
            data.player = 'spotify';
            res.json(data);
        });
    }
});

server.get('/current_app/:app', function(req, res){
    console.log("[GET] /current_app/" + req.params.app);

    if (req.params.app === 'spotify') {
        console.log('Switching to Spotify control');
        activePlayer = 'spotify';
        storage.setItem('activePlayer','spotify');
        iTunesMenuItem.checked = false;
        spotifyMenuItem.checked = true;
        getSpotifyTrackAndState(function(data){
            data.player = 'spotify';
            res.json(data);
        });
    }
    else if (req.params.app === 'itunes') {
        console.log('Switching to iTunes control');
        activePlayer = 'itunes';
        storage.setItem('activePlayer','itunes');
        iTunesMenuItem.checked = true;
        spotifyMenuItem.checked = false;
        getiTunesTrackAndState(function(data){
            data.player = 'itunes';
            res.json(data);
        });
    }
    else {
        res.send('err');
    }
});

server.get('/playpause', function(req, res){
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

server.get('/previous', function(req, res){
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

server.get('/next', function(req, res){
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

server.get('/volume/', function(req, res){
    console.log("[GET] /volume");
    volume.get(function(err, volume, muted) {
        res.json({ volume: volume, muted: muted, err: err });
    });
});

server.get('/volume/:vol', function(req, res){
    console.log("[GET] /volume/" + req.params.vol);

        var delta;
        if (req.params.vol === 'up') {
            delta = 10;
        } 
        else if (req.params.vol === 'down') {
            delta = -10;
        }
        else {
            res.status(400).send({ error: 'Bad Request' });
            return;
        }
        
    // Control global volume
    if (controlGlobalVolume) {
        volume.fadeBy(function(err, volume, muted) {
            if (err) {
                res.status(500).send({ error: err });
                return;
            }

            res.json({ volume: volume });
        }, delta, 1.0);

        return;
    }

    // Control player volume
    if (activePlayer == 'itunes') {
        iTunes.fadeVolumeBy(delta, function(err, volume) {
            if (err) {
                res.status(500).send({ error: err });
                return;
            }

            res.json({ volume: volume });
        });
    }
    else if (activePlayer == 'spotify') {
        var action = delta > 0 ? spotify.volumeUp : spotify.volumeDown;
        action(function(err, state) {
            if (err) {
                res.status(500).send({ error: err });
                return;
            }
            
            spotify.getState(function(err, state){
                res.json({ volume: state.volume });
            });
        });

    }
    
});

serverInstance = server.listen(port);
console.log('iTunesify Remote started on port ' + port);