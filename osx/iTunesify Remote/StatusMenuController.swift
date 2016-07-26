import Cocoa

protocol StatusMenuControllerDelegate: class {
    func didSelect(player: String)
    func didSelect(systemVolume: Bool)
}

class StatusMenuController: NSObject, NSMenuDelegate {
    @IBOutlet weak var statusMenu: NSMenu!
    @IBOutlet weak var hostMenu: NSMenuItem!
    @IBOutlet weak var versionMenu: NSMenuItem!
    @IBOutlet weak var iTunesMenu: NSMenuItem!
    @IBOutlet weak var spotifyMenu: NSMenuItem!
    @IBOutlet weak var globalVolumeMenu: NSMenuItem!
    @IBOutlet weak var playerVolumeMenu: NSMenuItem!
    
    weak var delegate: StatusMenuControllerDelegate?
    
    let statusItem = NSStatusBar.system().statusItem(withLength: NSVariableStatusItemLength)
    
    override func awakeFromNib() {
        let icon = NSImage(named: "StatusBarIcon")
        statusItem.image = icon
        statusItem.menu = statusMenu
        statusMenu.delegate = self
        
        loadIPAddress()
        
        let appName = Bundle.main.appName
        let appVersion = Bundle.main.appVersion
        versionMenu.title = "\(appName) v\(appVersion)"
    }
    
    private func loadIPAddress() {
        if let ipAddress = IFYNetworkInfo.getIFAddresses().first {
            hostMenu.title = "Server running on \(ipAddress)"
        } else if IFYNetworkInfo.isConnectedToNetwork() {
            hostMenu.title = "Could not detect your IP address"
        } else {
            hostMenu.title = "Not connected to a network"
        }
    }
    
    func setSelected(player: String) {
        if player == "itunes" {
            iTunesMenu.state = NSOnState
            spotifyMenu.state = NSOffState
        } else if player == "spotify" {
            iTunesMenu.state = NSOffState
            spotifyMenu.state = NSOnState
        }
    }
    
    func setSelected(systemVolume: Bool) {
        if systemVolume {
            globalVolumeMenu.state = NSOnState
            playerVolumeMenu.state = NSOffState
        } else {
            globalVolumeMenu.state = NSOffState
            playerVolumeMenu.state = NSOnState
        }
    }
    
    // MARK: Actions
    
    @IBAction func quitClicked(_ sender: NSMenuItem) {
        NSApplication.shared().terminate(self)
    }

    @IBAction func didTapiTunesMenu(_ sender: NSMenuItem) {
        let player = "itunes"
        setSelected(player: player)
        delegate?.didSelect(player: player)
    }
    
    @IBAction func didTapSpotifyMenu(_ sender: NSMenuItem) {
        let player = "spotify"
        setSelected(player: player)
        delegate?.didSelect(player: player)
    }
    
    @IBAction func didTapGlobalVolumeMenu(_ sender: NSMenuItem) {
        let systemVolume = true
        setSelected(systemVolume: systemVolume)
        delegate?.didSelect(systemVolume: systemVolume)
    }
    
    @IBAction func didTapPlayerVolumeMenu(_ sender: AnyObject) {
        let systemVolume = false
        setSelected(systemVolume: systemVolume)
        delegate?.didSelect(systemVolume: systemVolume)
    }
    
    
    // MARK: NSMenuDelegate
    
    func menuWillOpen(_ menu: NSMenu) {
        loadIPAddress()
    }
}
