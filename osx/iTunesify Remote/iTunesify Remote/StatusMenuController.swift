//
//  StatusMenuController.swift
//  iTunesify Remote
//
//  Created by Mario Cecchi on 07/07/2016.
//  Copyright © 2016 Mario Cecchi. All rights reserved.
//

import Cocoa

class StatusMenuController: NSObject {
    @IBOutlet weak var statusMenu: NSMenu!
    
    let statusItem = NSStatusBar.systemStatusBar().statusItemWithLength(NSVariableStatusItemLength)
    
    override func awakeFromNib() {
        let icon = NSImage(named: "StatusBarIcon")
        statusItem.image = icon
        statusItem.menu = statusMenu
    }
    
    
    // MARK - Actions
    
    @IBAction func quitClicked(sender: NSMenuItem) {
        NSApplication.sharedApplication().terminate(self)
    }

}
