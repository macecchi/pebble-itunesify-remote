/* global Pebble; */
var iTunesify = {};

iTunesify.server = localStorage.getItem("server");
iTunesify.configureUrl = "https://macecchi.github.io/pebble-itunesify-remote/index.html";

iTunesify.connect = function() {
	var ws = new WebSocket('ws://' + this.server + ':8000');
	var self = this;

	ws.onopen = function(event) {
		console.log('Connection successful.');
	}

	ws.onclose = function(event) {
		console.log('Connection closed.');
	}

	ws.onmessage = function(event) {
		var message = JSON.parse(event.data);
		self.handleMessage(message);
	}

	ws.onerror = function(event) {
		console.log('Connection errored.');
	}

	this.ws = ws;
}

iTunesify.sendCommand = function(command) {
	var message = { "action": command };
	this.ws.send(JSON.stringify(message));
}

iTunesify.doCommand = function(action) {
	if (action == "next") {
		iTunesify.sendCommand("next");
	}
	else if (action == "previous") {
		iTunesify.sendCommand("previous");
	}
	else if (action == "playpause") {
		iTunesify.sendCommand("playpause");
	}
	else if (action == "volume_up") {
		iTunesify.sendCommand("volume/up");
	}
	else if (action == "volume_down") {
		iTunesify.sendCommand("volume/down");
	}
	else if (action == "control_itunes") {
		iTunesify.sendCommand("current_app/itunes");
		localStorage.setItem("player", "itunes");
		Pebble.sendAppMessage({ player: 'itunes' });
	}
	else if (action == "control_spotify") {
		iTunesify.sendCommand("current_app/spotify");
		localStorage.setItem("player", "spotify");
		Pebble.sendAppMessage({ player: 'spotify' });
	}
};

iTunesify.handleMessage = function(message) {
	var pebbleMsg = {};

	if (message.player) {
		var current_player = message.player;
		console.log('Current player: ' + current_player);
		pebbleMsg.player = current_player;
	}

	if (message.track) {
		console.log('Found track info');
		pebbleMsg.trackName = message.track.name;
		pebbleMsg.trackArtist = message.track.artist;
	}

	Pebble.sendAppMessage(pebbleMsg);
};

Pebble.addEventListener("ready", function(e) {
	console.log("iTunesify Remote is ready.");

	if (localStorage.getItem("server") === null || iTunesify.server == '') {
		Pebble.showSimpleNotificationOnPebble("Almost there!", "Please configure iTunesify Remote on the Pebble app.");
		Pebble.sendAppMessage({ alert: "not configured" });
	}
	else {
		iTunesify.connect();
	}
});

Pebble.addEventListener("appmessage", function(e) {
	console.log("Received message: " + JSON.stringify(e.payload));
	if (e.payload.action) {
		iTunesify.doCommand(e.payload.action);
	}
});

Pebble.addEventListener("showConfiguration", function(e) {
	Pebble.openURL(iTunesify.configureUrl);
});

Pebble.addEventListener("webviewclosed", function(e) {
	if (e.response) {
		var configuration = JSON.parse(decodeURIComponent(e.response));
		console.log("Configuration window returned: " + JSON.stringify(configuration));

		console.log("iTunesify Server: " + configuration.server);
		localStorage.setItem("server", configuration.server);

		iTunesify.server = configuration.server;

		iTunesify.connect();
	}
});
