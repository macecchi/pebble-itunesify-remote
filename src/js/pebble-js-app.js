var iTunes = {};
iTunes.state = "playing";

iTunes.server = localStorage.getItem("server");
iTunes.configureUrl = "https://macecchi.github.io/pebble-itunes-remote/index.html";

iTunes.getPlaying = function (command) {
	var req1 = new XMLHttpRequest();
	req1.timeout = 2000;

	req1.open("GET", "http://" + iTunes.server + ":8080/status", true);
	req1.onreadystatechange = function (e) {
		if (req1.status != 200) {
			console.log("Error communicating to server. Response code was " + req1.status);
		}
	};
}

iTunes.doCommand = function (action) {
	if (action == "next") {
		iTunes.sendCommand("stepForward");
	}
	if (action == "previous") {
		iTunes.sendCommand("stepBack");
	}
	if (action == "playpause") {
		if (iTunes.state == "playing") {
			iTunes.sendCommand("pause");
			iTunes.state = "paused";
		}
		else {
			iTunes.sendCommand("play");
			iTunes.state = "playing";
		}
	}
	iTunes.getPlaying();
};

iTunes.sendCommand = function  (command) {
	console.log("Sending command to http://" + iTunes.server + ":8080/" + command);

	var req = new XMLHttpRequest();
	req.timeout = 2000;
	req.open("GET", "http://" + iTunes.server + ":8080/" + command, true);
	req.onreadystatechange = function (e) {
		if (req.readyState === 4) {  
			if (req.status === 200) {
				console.log("Response OK for command: " + command);
			}
			else {
				console.log("Request failed with status " + req.status);
			}
		} 
	};
	req.onerror = function (e) {
		setTimeout(function(){
			Pebble.showSimpleNotificationOnPebble("iTunes Remote", "Unable to reach iTunes. Check the settings and status of iTunes API.");	
		}, 3000);
	};
	req.send(null);
};

Pebble.addEventListener("ready", function(e) {
	console.log("iTunes Remote is go.");
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

Pebble.addEventListener("webviewclosed",
	function(e) {
		if (e.response) {
			var configuration = JSON.parse(e.response);
			console.log("Configuration window returned: " + JSON.stringify(configuration));

			console.log("iTunes Server: " + configuration.server);
			localStorage.setItem("server", configuration.server);  

			iTunes.server = configuration.server;
		}
	}
	);
