iTunes Remote for Pebble
==================

Control your iTunes playback (play/pause/next/prev) from your Pebble watch!

- Uses [iTunes Control API](https://github.com/macecchi/itunes-control-api) on machine running iTunes (OS X only)
- Uses PebbleKitJS from Pebble SDK 2.0
- Configurable from Pebble's smartphone application


### How to Use

1. Install iTunes Remote from Pebble App Store
2. Tap "iTunes Remote" in the Pebble app
3. Enter hostname or IP address of machine running iTunes Control API (eg. 192.168.x.x)
4. Tap "Save"
5. Enjoy!


### How to Install

	$ export PEBBLE_PHONE=<YOUR PHONE'S IP ADDRESS>
	$ pebble build && pebble install
	$ pebble logs
	

### Credits

This project was originally forked from [pebble-plex-remote](https://github.com/spangborn/pebble-plex-remote) by [spangborn](https://github.com/spangborn/).