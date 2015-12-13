var iTunes = {};

iTunes.server = localStorage.getItem("server");
iTunes.configureUrl = "https://macecchi.github.io/pebble-itunesify-remote/index.html";

iTunes.doCommand = function(action) {
	if (action == "next") {
		iTunes.sendCommand("next");
	}
	else if (action == "previous") {
		iTunes.sendCommand("previous");
	}
	else if (action == "playpause") {
		iTunes.sendCommand("playpause");
	}
	else if (action == "volume_up") {
		iTunes.sendCommand("volume/up");
	}
	else if (action == "volume_down") {
		iTunes.sendCommand("volume/down");
	}
	else if (action == "control_itunes") {
		iTunes.sendCommand("current_app/itunes");
		localStorage.setItem("player", "itunes");
    	Pebble.sendAppMessage({player: 'itunes'});
	}
	else if (action == "control_spotify") {
		iTunes.sendCommand("current_app/spotify");
		localStorage.setItem("player", "spotify");
    	Pebble.sendAppMessage({player: 'spotify'});
	}
};

iTunes.sendCommand = function(command) {
	var url = "http://" + iTunes.server + ":8080/" + command;
	console.log("Sending command to " + url);

	var req = new XMLHttpRequest();
	req.timeout = 2000;
	
	req.onload = function() {
		if (req.status === 200) {
			console.log("Response OK for command: " + command);
			
			try {
				var responseObj = JSON.parse(req.responseText);
			
				var pebbleMsg = {};
				
				if (responseObj.player) {
					var current_player = responseObj.player;
					console.log('Current player: ' + current_player);
					pebbleMsg.player = current_player;
				}
			
				if (responseObj.track) {
					console.log('Found track info');
					pebbleMsg.trackName = responseObj.track.name;
					pebbleMsg.trackArtist = responseObj.track.artist;
					
					// Request track info again after a while
					setTimeout(function() {
						iTunes.sendCommand('');
					}, 30000);
				}
			
				Pebble.sendAppMessage(pebbleMsg);
			} catch (error) {
				console.log('Could not decode JSON');
			}
		}
		else {
			console.log("Request to " + url + " failed with status " + req.status + " Response: " + req.responseText);
			
			if (req.status == 404) {
				Pebble.showSimpleNotificationOnPebble("iTunesify Error", "You are running an outdated version of the Mac app. Please update it on bit.ly/itunesify-update.");	
			}
		}
	};
	
	req.onerror = function(e) {
		Pebble.showSimpleNotificationOnPebble("iTunesify Remote", "Unable to connect. Check the connection and configuration.");
	};
	
	req.open("GET", url, true);
	req.send();
};

Pebble.addEventListener("ready", function(e) {
	console.log("iTunes Remote is go.");

	if (localStorage.getItem("server") === null || iTunes.server == '') {
		Pebble.showSimpleNotificationOnPebble("Almost there!", "Please configure iTunesify Remote on the Pebble app.");	
	}
	else {
		iTunes.sendCommand('current_app');
	}
});

Pebble.addEventListener("appmessage", function(e) {
	console.log("Received message: " + JSON.stringify(e.payload));
	if (e.payload.action) {
		iTunes.doCommand(e.payload.action);
	}
});

Pebble.addEventListener("showConfiguration", function(e) {
	Pebble.openURL(iTunes.configureUrl);
});

Pebble.addEventListener("webviewclosed", function(e) {
	if (e.response) {
		var configuration = JSON.parse(e.response);
		console.log("Configuration window returned: " + JSON.stringify(configuration));

		console.log("iTunes Server: " + configuration.server);
		localStorage.setItem("server", configuration.server);

		iTunes.server = configuration.server;

		iTunes.sendCommand('current_app');
	}
});
