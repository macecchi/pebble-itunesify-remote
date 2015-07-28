iTunes Remote for Pebble
==================

Control your iTunes playback (play/pause/next/prev) from your Pebble watch!

- Requires [OS X companion app running on the same network](https://github.com/macecchi/pebble-itunes-remote-osx/blob/master/README.md)
- Compatible with Pebble and Pebble Time (aplite/basalt)
- Configurable from Pebble's smartphone application


### How to Use

1. [Install iTunes Remote from Pebble App Store](https://apps.getpebble.com/en_US/application/55b5bdfe5e07169f58000022)
2. [Install iTunes Remote for Pebble on your Mac](https://github.com/macecchi/pebble-itunes-remote-osx/blob/master/README.md)
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