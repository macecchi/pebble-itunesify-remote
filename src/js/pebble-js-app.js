var iTunes = {};

iTunes.server = localStorage.getItem("server");
iTunes.configureUrl = "https://macecchi.github.io/pebble-itunesify-remote/index.html";

iTunes.getPlaying = function(command) {
	var req1 = new XMLHttpRequest();
	req1.timeout = 2000;

	req1.open("GET", "http://" + iTunes.server + ":8080/status", true);
	req1.onreadystatechange = function(e) {
		if (req1.readyState === 4) {  
			if (req1.status != 200) {
				console.log("Error communicating to server. Response code was " + req1.status);
			}
			else if (req1.responseText != '') {

			}
		}
	};
	req1.onerror = function(e) {
		setTimeout(function(){
			Pebble.showSimpleNotificationOnPebble("iTunesify Remote", "Unable to connect. Check the connection and configuration.");	
		}, 1000);
	};
	req1.send(null);
}

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
	else {
		iTunes.getPlaying();
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
		iTunes.getPlaying();
	}
});
