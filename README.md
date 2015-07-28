# iTunes Remote for Pebble (OS X App)

Control iTunes playback (play/pause/next/prev) from your Pebble watch!

**(To be used with [Pebble iTunes Remote](https://github.com/macecchi/pebble-itunes-remote) for Pebble)**


This app was built using:

- **[iTunes Control API](https://github.com/macecchi/itunes-control-api)** for iTunes remote control over HTTP
- **[NW.js](https://github.com/nwjs/nw.js)** (former *node-webkit*) for GUI
- **[nw-builder](https://github.com/nwjs/nw-builder)** to export Node.js as OS X app


## How to Use

1. [**Download** OS X app](https://github.com/macecchi/pebble-itunes-remote-osx/releases/)
- *(Optional)* Drag app to **Applications** folder
- **Double click** to open
- Click on the **status bar** icon and take note of the IP address shown

	![image](https://raw.githubusercontent.com/macecchi/pebble-itunes-remote-osx/master/resources/images/statusbar_help.png)
- Go to the **Pebble app** on your phone and type the IP address inside 'iTunes Remote' configurations
- Enjoy!


## Manual compiling

To manually compile you just need to `npm init` the dependencies and run nw-builder to generate the app.

```bash
cd pebble-itunes-remote-osx
npm install
npm install -g nw-builder
nwbuild -p osx64 .
```

Alternatively, you can also install node-webkit directly and run without exporting the OS X app.

```bash
cd pebble-itunes-remote-osx
npm install
npm install -g node-webkit
/PATH/TO/INSTALLED/NWJS .
```
