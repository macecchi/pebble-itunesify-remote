var plex = {};
plex.state = "play";

if (!localStorage.getItem("plexServer")) localStorage.setItem("media-server");
if (!localStorage.getItem("plexClient")) localStorage.setItem("192.168.1.145");
plex.plexServer = localStorage.getItem("plexServer");
plex.plexClient = localStorage.getItem("plexClient");
plex.clientlist = [];
plex.configureUrl = "http://spangborn.github.io/pebble-plex-remote/index.html";

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
};

plex.sendCommand = function  (command) {
	var req = new XMLHttpRequest();
	req.timeout = 2000;
	req.open("GET", "http://" + plex.plexServer + ":32400/system/players/" + plex.plexClient + "/playback/" + command, true);
	req.onreadystatechange = function (e) {
		if (req.readyState === 4) {  
			if (req.status === 200) {  
				console.log(req.responseText)  
		  	}
		} 
	};
	req.onerror = function (e) {
		Pebble.showSimpleNotificationOnPebble("Plex", "Unable to reach Plex Server.");
	};
	req.send(null);
	
};
plex.getClients = function () {

}
Pebble.addEventListener("ready", function(e) {
	console.log("Plex Remote is go.");
});

Pebble.addEventListener("appmessage", function(e) {
	console.log("Received message: " + e.payload);
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
    	localStorage.setItem("plexServer", configuration.plexServer);  
		localStorage.setItem("plexClient", configuration.plexClient); 

		plex.plexServer = configuration.plexServer;
		plex.plexClient = configuration.plexClient;
	}
  }
);
