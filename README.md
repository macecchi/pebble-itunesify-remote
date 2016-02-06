iTunesify Remote for Pebble
==================

Control your iTunes and Spotify playback (play/pause/next/prev/volume) from your Pebble watch!

![iTunesify-logo](iTunesify.png =200x)

- Requires OS X companion app running on the same network
- Compatible with all Pebbles! (Classic, Time and Time Round)

## How to Use

1. [**Download** the OS X app](https://github.com/macecchi/pebble-itunesify-remote/releases/)
- _(Optional)_ Drag app to **Applications** folder
- **Double click** to open
- Click on the **status bar** icon and take note of the IP address shown
	![status-bar-help](statusbar_help.png =300x)	
- On your **Pebble** app, install iTunesify Remote from Pebble Appstore ([link](https://apps.getpebble.com/en_US/application/55b5bdfe5e07169f58000022))
- Still on the Pebble app, type the IP address you took note inside _iTunesify Remote_ configurations
- _(Optional)_ To run automatically when you log in, open **System Preferences > Users & Groups > Login Items** and drag & drop the app to the list.
- Enjoy!

## Support

The best support method is [creating an issue](https://github.com/macecchi/pebble-itunesify-remote/issues) on GitHub.

Alternatively, I'll also try to help via email at macecchi@gmail.com.


## Manual compile
### Pebble app


```bash
cd pebble
pebble build && pebble install
```

### OS X app
To manually compile you just need to `npm install` the dependencies and run `npm run archive` to generate the app. The .app will be exported to the folder _build_.

```bash
cd osx
npm install
npm install -g nw-builder
npm run archive
```

Alternatively, you can install node-webkit (nw) directly and run iTunesify without exporting the OS X app (useful for debugging).

```bash
cd osx
npm install
npm install -g nw
npm start
```


## Credits

A special thanks to Sean Porter for the [iTunesify Remote icon](https://github.com/macecchi/pebble-itunesify-remote/blob/master/iTunesify.png)!

This app was built using:

- **[local-itunes](https://github.com/airtoxin/local-itunes)** for iTunes  control using Node.js
- **[spotify-node-applescript](https://github.com/andrehaveman/spotify-node-applescript)** for Spotify control using Node.js
- **[osx-wifi-volume-remote](https://github.com/coolaj86/osx-wifi-volume-remote)** for OS X volume control using Node.js
- **[NW.js](https://github.com/nwjs/nw.js)** (former *node-webkit*) for GUI 
- **[nw-builder](https://github.com/nwjs/nw-builder)** to export Node.js as OS X app

This Pebble app was originally forked from [pebble-plex-remote](https://github.com/spangborn/pebble-plex-remote) by [spangborn](https://github.com/spangborn/).

## License

This code is licensed under the terms of the [GNU General Public License v3](http://choosealicense.com/licenses/gpl-3.0/). The GPL is a copyleft license that requires anyone who distributes this code or a derivative work to make the source available under the same terms. 
