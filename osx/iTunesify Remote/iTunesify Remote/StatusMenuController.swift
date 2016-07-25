import Cocoa

protocol StatusMenuControllerDelegate: class {
    func didSelect(player: String)
}

class StatusMenuController: NSObject {
    @IBOutlet weak var statusMenu: NSMenu!
    @IBOutlet weak var hostMenu: NSMenuItem!
    @IBOutlet weak var versionMenu: NSMenuItem!
    @IBOutlet weak var iTunesMenu: NSMenuItem!
    @IBOutlet weak var spotifyMenu: NSMenuItem!
    
    weak var delegate: StatusMenuControllerDelegate?
    
    let statusItem = NSStatusBar.system().statusItem(withLength: NSVariableStatusItemLength)
    
    override func awakeFromNib() {
        let icon = NSImage(named: "StatusBarIcon")
        statusItem.image = icon
        statusItem.menu = statusMenu
        
        // TODO: update ip
        // TODO: update version
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
}
