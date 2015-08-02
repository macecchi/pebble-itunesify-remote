# iTunesify Remote for Pebble* (OS X App)

Control iTunes and Spotify playback (play/pause/next/prev) from your Pebble watch!

**(To be used with [Pebble iTunesify Remote](https://github.com/macecchi/pebble-itunesify-remote) for Pebble)**


This app was built using:

- **[local-itunes](https://github.com/airtoxin/local-itunes)** for iTunes  control using Node.js
- **[spotify-node-applescript](https://github.com/andrehaveman/spotify-node-applescript)** for Spotify control using Node.js
- **[NW.js](https://github.com/nwjs/nw.js)** (former *node-webkit*) for GUI 
- **[nw-builder](https://github.com/nwjs/nw-builder)** to export Node.js as OS X app

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
nwbuild -p osx64 .
```

Alternatively, you can also install node-webkit directly and run without exporting the OS X app.

```bash
cd pebble-itunesify-remote-osx
npm install
npm install -g node-webkit
/PATH/TO/INSTALLED/NWJS .
```
