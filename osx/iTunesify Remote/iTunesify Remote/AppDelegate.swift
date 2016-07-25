import Cocoa

@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate, IFYServerDelegate, IFYPlayerDelegate, StatusMenuControllerDelegate {
    @IBOutlet weak var menuController: StatusMenuController!
    
    lazy var server = IFYServer.sharedInstance
    var player: IFYPlayer!
    let preferences = UserDefaults.standard

    func applicationDidFinishLaunching(_ aNotification: Notification) {
        let selectedPlayer = preferences.string(forKey: "player") ?? "itunes"
        menuController.delegate = self
        menuController.setSelected(player: selectedPlayer)
        
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
            player.toggleState()
        case .next:
            player.nextTrack()
        case .previous:
            player.previousTrack()
        case .volumeUp:
            let newVolume = min(100, player.volume + 10)
            player.volume = newVolume
        case .volumeDown:
            let newVolume = max(0, player.volume - 10)
            player.volume = newVolume
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
}

