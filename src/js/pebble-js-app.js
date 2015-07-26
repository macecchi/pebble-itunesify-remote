var iTunes = {};
iTunes.state = "playing";

iTunes.iTunesServer = localStorage.getItem("iTunesServer");
iTunes.iTunesClient = localStorage.getItem("iTunesClient");
iTunes.configureUrl = "http://spangborn.github.io/pebble-plex-remote/index.html";

// This won't work without Plexpass, BAH.
iTunes.getPlaying = function (command) {
	var req1 = new XMLHttpRequest();
	req1.timeout = 2000;

	req1.open("GET", "http://" + iTunes.iTunesServer + ":8080/status", true);
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
	var req = new XMLHttpRequest();
	req.timeout = 2000;
	req.open("GET", "http://" + iTunes.iTunesServer + ":8080/" + command, true);
	req.onreadystatechange = function (e) {
		if (req.readyState === 4) {  
			if (req.status === 200) {  
				console.log("Request sent: " + command);  
		  	}
		  	else {
		  		console.log("Request failed with status " + req.status);
		  	}
		} 
	};
	req.onerror = function (e) {
		setTimeout(function(){
			Pebble.showSimpleNotificationOnPebble("iTunes", "Unable to reach iTunes.");	
		}, 1000);
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
    	
    	console.log("iTunes Server: " + configuration.iTunesServer);
    	console.log("iTunes Client: " + configuration.iTunesClient);
    	console.log("iTunes Token: " + configuration.iTunesToken);
    	localStorage.setItem("iTunesServer", configuration.iTunesServer);  
		localStorage.setItem("iTunesClient", configuration.iTunesClient); 
		localStorage.setItem("iTunesToken", configuration.iTunesToken); 

		iTunes.iTunesToken = configuration.iTunesToken;
		iTunes.iTunesServer = configuration.iTunesServer;
		iTunes.iTunesClient = configuration.iTunesClient;
	}
  }
);
