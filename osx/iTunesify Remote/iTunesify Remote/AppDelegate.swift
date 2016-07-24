//
//  AppDelegate.swift
//  iTunesify Remote
//
//  Created by Mario Cecchi on 07/07/2016.
//  Copyright © 2016 Mario Cecchi. All rights reserved.
//

import Cocoa

@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate {
    lazy var server = Server.sharedInstance

    func applicationDidFinishLaunching(_ aNotification: Notification) {
        server.start()
        
        DistributedNotificationCenter.default().addObserver(self, selector: #selector(didReceivePlayerInfo), name: "com.apple.iTunes.playerInfo" as NSNotification.Name, object: nil)
    }

    func applicationWillTerminate(_ aNotification: Notification) {
        // Insert code here to tear down your application
    }
    
    func didReceivePlayerInfo(notification: NSNotification!) {
        let player = notification.userInfo!
        let name = player["Name"] as! String
        let artist = player["Artist"] as! String
        let state = player["Player State"] as! String
        
        print("\(artist) - \(name) (\(state))")
        
        let track = [ "name": name, "artist": artist, "state": state ]
        let message: [String: AnyObject] = [ "player": "itunes", "track": track ]
        
        do {
            try server.send(message: message)
        } catch let error {
            print(error)
        }
    }
    
}

