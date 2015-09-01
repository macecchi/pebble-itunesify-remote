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
    	Pebble.sendAppMessage({player: 'iTunes'});
	}
	else if (action == "control_spotify") {
		iTunes.sendCommand("current_app/spotify");
		localStorage.setItem("player", "spotify");
    	Pebble.sendAppMessage({player: 'Spotify'});
	}
};

iTunes.sendCommand = function(command) {
	console.log("Sending command to http://" + iTunes.server + ":8080/" + command);

	var req = new XMLHttpRequest();
	req.timeout = 2000;
	req.open("GET", "http://" + iTunes.server + ":8080/" + command, true);
	req.onreadystatechange = function(e) {
		if (req.readyState === 4) {  
			if (req.status === 200) {
				console.log("Response OK for command: " + command);
			}
			else {
				console.log("Request failed with status " + req.status);
				if (req.status == 404) {
					Pebble.showSimpleNotificationOnPebble("iTunesify Error", "You are running an old version of the Mac app. Please update it on bit.ly/itunesify-update.");	
				}
			}
		} 
	};
	req.onerror = function(e) {
		setTimeout(function(){
			Pebble.showSimpleNotificationOnPebble("iTunesify Remote", "Unable to connect. Check the connection and configuration.");	
		}, 2000);
	};
	req.send(null);
};

Pebble.addEventListener("ready", function(e) {
	console.log("iTunes Remote is go.");

	if (localStorage.getItem("server") === null || iTunes.server == '') {
		Pebble.showSimpleNotificationOnPebble("Almost there!", "Please configure iTunesify Remote on the Pebble app.");	
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
	}
});
