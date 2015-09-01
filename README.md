iTunesify Remote for Pebble
==================

Control your iTunes and Spotify playback (play/pause/next/prev/volume) from your Pebble watch!

- Requires [OS X companion app running on the same network](https://github.com/macecchi/pebble-itunesify-remote-osx/blob/master/README.md)
- Compatible with Pebble and Pebble Time (aplite/basalt)
- Configurable from Pebble iOS/Android app


### How to Use

1. **Pebble:** [Install iTunesify Remote from Pebble App Store](https://apps.getpebble.com/en_US/application/55b5bdfe5e07169f58000022)
2. **Mac:** [Install iTunesify Remote for Pebble on your Mac](https://github.com/macecchi/pebble-itunes-remote-osx/blob/master/README.md)
2. Tap "iTunesify Remote" in the Pebble app
3. Enter the IP address of the Mac you want to control (eg. 192.168.x.x)
4. Tap "Save"
5. Enjoy!


### How to Install

	$ export PEBBLE_PHONE=<YOUR PHONE'S IP ADDRESS>
	$ pebble build && pebble install
	$ pebble logs
	

### Credits

This project was originally forked from [pebble-plex-remote](https://github.com/spangborn/pebble-plex-remote) by [spangborn](https://github.com/spangborn/).


\* iTunesify Remote was previously *iTunes Remote for Pebble*