# iTunesify Remote for Pebble* (OS X App)

Control iTunes and Spotify playback (play/pause/next/prev) and Mac volume level from your Pebble watch!

**(To be used with [Pebble iTunesify Remote](https://github.com/macecchi/pebble-itunesify-remote) for Pebble)**


This app was built using:

- **[local-itunes](https://github.com/airtoxin/local-itunes)** for iTunes  control using Node.js
- **[spotify-node-applescript](https://github.com/andrehaveman/spotify-node-applescript)** for Spotify control using Node.js
- **[osx-wifi-volume-remote](https://github.com/coolaj86/osx-wifi-volume-remote)** for OS X volume control using Node.js
- **[NW.js](https://github.com/nwjs/nw.js)** (former *node-webkit*) for GUI 
- **[nw-builder](https://github.com/nwjs/nw-builder)** to export Node.js as OS X app
- [iTunesify Custom icon](https://github.com/macecchi/pebble-itunesify-remote-osx/blob/master/resources/images/iTunesify.png) by Sean Porter

\* previously *iTunes Remote for Pebble*



## How to Use

1. [**Download** the OS X app](https://github.com/macecchi/pebble-itunesify-remote-osx/releases/)
- *(Optional)* Drag app to **Applications** folder
- **Double click** to open
- Click on the **status bar** icon and take note of the IP address shown

	![image](https://raw.githubusercontent.com/macecchi/pebble-itunesify-remote-osx/master/resources/images/statusbar_help.png)
- Go to the **Pebble app** on your phone and type the IP address inside 'iTunesify Remote' configurations
- Enjoy!


## Manual compiling

To manually compile you just need to `npm install` the dependencies and run `nw-builder` to generate the app.

```bash
cd pebble-itunesify-remote-osx
npm install
npm install -g nw-builder
nwbuild -p osx64 --macIcns resources/iTunesify.icns .
```

Alternatively, you can install node-webkit (nw) directly and run iTunesify without exporting the OS X app (useful for debugging).

```bash
cd pebble-itunesify-remote-osx
npm install
npm install -g nw
npm start
```
