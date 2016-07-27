import Cocoa

@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate, IFYServerDelegate, IFYPlayerDelegate, StatusMenuControllerDelegate {
    @IBOutlet weak var menuController: StatusMenuController!
    
    lazy var server = IFYServer.sharedInstance
    var player: IFYPlayer!
    let systemVolume = IFYSystemVolume.sharedInstance
    let preferences = UserDefaults.standard
    var controlSystemVolume: Bool = true

    func applicationDidFinishLaunching(_ aNotification: Notification) {
        let selectedPlayer = preferences.string(forKey: "player") ?? "itunes"
        controlSystemVolume = preferences.object(forKey: "system_volume") as? Bool ?? true
        
        menuController.delegate = self
        menuController.setSelected(player: selectedPlayer)
        menuController.setSelected(systemVolume: controlSystemVolume)
        
        startPlayer(player: selectedPlayer)
        
        server.delegate = self
        server.start()
    }

    func applicationWillTerminate(_ aNotification: Notification) {
        server.stop()
    }
    
    func startPlayer(player selectedPlayer: String) {
        player?.unsubscribe()
        
        if selectedPlayer == "itunes" {
            player = IFYiTunes.sharedInstance
        } else if selectedPlayer == "spotify" {
            player = IFYSpotify.sharedInstance
        }
        
        player.delegate = self
        player.subscribeForUpdates()
        didUpdatePlayerInfo()
        
    }
    
    func fadeVolumeBy(amount: Int) {
        let currentVolume = controlSystemVolume ? systemVolume.volume : player.volume
        let newVolume = amount > 0 ? min(100, currentVolume + 10) : max(0, currentVolume - 10)
        
        if controlSystemVolume {
            systemVolume.volume = newVolume
        } else {
            player.volume = newVolume
        }
    }
    
    // MARK: IFYServerDelegate
    
    func clientConnected(client: IFYClient) {
        do {
            try client.send(message: player.message)
        } catch let error {
            print(error)
        }
    }
    
    func receivedCommand(command: IFYCommand) {
        switch command {
        case .playPause:
            player.playPause()
        case .next:
            player.nextTrack()
        case .previous:
            player.previousTrack()
        case .volumeUp:
            fadeVolumeBy(amount: 10)
        case .volumeDown:
            fadeVolumeBy(amount: -10)
        case .playerITunes:
            startPlayer(player: "itunes")
            menuController.setSelected(player: "itunes")
        case .playerSpotify:
            startPlayer(player: "spotify")
            menuController.setSelected(player: "spotify")
        default:
            print("Unhandled command received")
        }
    }
    
    
    // MARK: IFYPlayerDelegate
    
    func didUpdatePlayerInfo() {
        do {
            try server.send(message: player.message)
        } catch let error {
            print(error)
        }
    }
    
    
    // MARK: StatusMenuControllerDelegate
    
    func didSelect(player selectedPlayer: String) {
        preferences.set(selectedPlayer, forKey: "player")
        startPlayer(player: selectedPlayer)
    }
    
    func didSelect(systemVolume: Bool) {
        preferences.set(systemVolume, forKey: "system_volume")
        controlSystemVolume = systemVolume
    }
}

