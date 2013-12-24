pebble-plex-remote
==================

![](https://raw.github.com/spangborn/pebble-plex-remote/master/screenshot.png)
##Plex Remote for Pebble

- Uses PebbleKitJS from Pebble SDK 2.0
- Configurable from Pebble's smartphone application


###How to Use

1. Install pebble-plex-remote.pbw from [MyPebbleFaces](http://www.mypebblefaces.com/apps/1936/7371/).
2. Tap "Plex Remote" in the Pebble app
3. Enter a Plex Server hostname or IP address (192.168.x.x, or plex-server).
![](http://i.imgur.com/3sDZdg5.png)
4. Tap "Get Clients"
5. Select a Plex Client to control from the dropdown list.
![](http://i.imgur.com/0AJyotG.png)
6. Tap "Save"
7. Enjoy!

###How to Install
    $ export PEBBLE_PHONE=<YOUR PHONE'S IP ADDRESS>
    $ pebble build && pebble install
    $ pebble logs

###Roadmap
1. Display currently playing media
2. Enable navigation of on-screen menus
3. Implement XBMC integration?
