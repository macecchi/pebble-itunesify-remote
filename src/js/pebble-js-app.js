Pebble.addEventListener("ready", function(e) {
	console.log("Plex Remote is go.");
});
Pebble.addEventListener("appmessage", function(e) {
	console.log("Received message: " + e.payload);
	//Pebble.showSimpleNotificationOnPebble("AppMessage", JSON.stringify(e.payload));
});