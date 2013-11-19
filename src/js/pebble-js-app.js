var plex = {};
plex.state = "play";

plex.plexServer = localStorage.getItem("plexServer");
plex.plexClient = localStorage.getItem("plexClient");
//plex.configureUrl = "http://spangborn.github.io/pebble-plex-remote/index.html";
plex.configureUrl = "http://eclipsemac/config/index.html";
// This won't work without Plexpass, BAH.
plex.getPlaying = function (command) {
	var req1 = new XMLHttpRequest();
	req1.timeout = 2000;
	req1.setRequestHeader('X-Plex-Device', 'Web');
	req1.setRequestHeader('X-Plex-Version', '1.1');
	req1.setRequestHeader('X-Plex-Token', 'PLEX TOKEN HERE');
	req1.setRequestHeader('X-Plex-Client-Platform', 'Web');
	req1.setRequestHeader('X-Plex-Device-Name', 'Pebble')
	req1.setRequestHeader('X-Plex-Model', 'V2R2');
	req1.setRequestHeader('X-Plex-Platform', 'Web');
	req1.setRequestHeader('X-Plex-Client-Identifier', 'pebble-plex-remote');
	req1.setRequestHeader('X-Plex-Product', 'Pebble Plex Remote');
	req1.setRequestHeader('X-Plex-Platform-Version', '2.0');
	req1.setRequestHeader('X-Plex-Client-Capabilities', '');


	req1.open("GET", "http://" + plex.plexServer + ":32400/status/sessions", true);
	req1.onreadystatechange = function (e) {
		if (req1.status == 403) {
			console.log("You evidently don't have Plexpass.");
		}
	};
}

plex.doCommand = function (action) {
	if (action == "next") {
		if (plex.state == "fastForward") {
			plex.sendCommand("play");
			plex.state = "play";
		}
		else {
			plex.sendCommand("fastForward");
			plex.state = "fastForward";
		}
	}
	if (action == "playpause") {
		if (plex.state == "play") {
			plex.sendCommand("pause");
			plex.state = "pause";
		}
		else {
			plex.sendCommand("play");
			plex.state = "play";
		}
	}
	if (action == "previous") {
		if (plex.state == "rewind") {
			plex.sendCommand("play");
			plex.state = "play";
		}
		else {
			plex.sendCommand("rewind");
			plex.state = "rewind";
		}
	}
	plex.getPlaying();
};

plex.sendCommand = function  (command) {
	var req = new XMLHttpRequest();
	req.timeout = 2000;
	req.setRequestHeader("X-Plex-Token", localStorage.getItem("plexToken"));
	req.setRequestHeader("X-Plex-Device", "Pebble");
	req.setRequestHeader("X-Plex-Model", "V2R2");
	req.setRequestHeader("X-Plex-Client-Identifier", "V2R2");
	req.setRequestHeader("X-Plex-Device-Name", "pebble-plex-remote");
	req.setRequestHeader("X-Plex-Platform", "PebbleOS");
	req.setRequestHeader("X-Plex-Client-Platform", "PebbleOS");
	req.setRequestHeader("X-Plex-Platform-Version", "2.0B2");
	req.setRequestHeader("X-Plex-Product", "pebble-plex-remote");
	req.setRequestHeader("X-Plex-Version", "1.0");
	req.open("GET", "http://" + plex.plexServer + ":32400/system/players/" + plex.plexClient + "/playback/" + command, true);
	req.onreadystatechange = function (e) {
		if (req.readyState === 4) {  
			if (req.status === 200) {  
				console.log("Message sent: " + command);  
		  	}
		} 
	};
	req.onerror = function (e) {
		setTimeout(function(){
			Pebble.showSimpleNotificationOnPebble("Plex", "Unable to reach Plex Server.");	
		}, 15000);
	};
	req.send(null);
	
};
Pebble.addEventListener("ready", function(e) {
	console.log("Plex Remote is go.");
});

Pebble.addEventListener("appmessage", function(e) {
	console.log("Received message: " + JSON.stringify(e.payload));
	if (e.payload.action) {
		plex.doCommand(e.payload.action);
	}
});
Pebble.addEventListener("showConfiguration", function(e) {
	Pebble.openURL(plex.configureUrl);
});
Pebble.addEventListener("webviewclosed",
  function(e) {

    if (e.response) {

    	var configuration = JSON.parse(e.response);
    	console.log("Configuration window returned: " + JSON.stringify(configuration));
    	
    	console.log("Plex Server: " + configuration.plexServer);
    	console.log("Plex Client: " + configuration.plexClient);
    	console.log("Plex Token: " + configuration.plexToken);
    	localStorage.setItem("plexServer", configuration.plexServer);  
		localStorage.setItem("plexClient", configuration.plexClient); 
		localStorage.setItem("plexToken", configuration.plexToken); 

		plex.plexToken = configuration.plexToken;
		plex.plexServer = configuration.plexServer;
		plex.plexClient = configuration.plexClient;
	}
  }
);
