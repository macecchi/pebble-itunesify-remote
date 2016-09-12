import Cocoa
import Fabric
import Crashlytics
import ServiceManagement

@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate,
    IFYServerDelegate, IFYPlayerDelegate,
    StatusMenuControllerDelegate {

    @IBOutlet weak var menuController: StatusMenuController!
    
    lazy var server = IFYPocketSocketServer.sharedInstance
    var player: IFYPlayer!
    let systemVolume = IFYSystemVolume.sharedInstance
    let preferences = UserDefaults.standard
    var controlSystemVolume: Bool = true
    
    func applicationDidFinishLaunching(_ aNotification: Notification) {
        UserDefaults.standard.set(true, forKey: "NSApplicationCrashOnExceptions")
        Fabric.with([Answers.self, Crashlytics.self])
        
        if !SMLoginItemSetEnabled("xyz.meriw.itunesify.helper" as CFString, true) {
            print("Error setting login item")
        }

        let selectedPlayer = preferences.string(forKey: PreferenceKeys.player.rawValue) ?? "itunes"
        controlSystemVolume = preferences.object(forKey: PreferenceKeys.systemVolume.rawValue) as? Bool ?? true

        menuController.delegate = self
        menuController.setSelected(player: selectedPlayer)
        menuController.setSelected(systemVolume: controlSystemVolume)
        
        startPlayer(player: selectedPlayer)
        
        server.delegate = self
        server.start()

        setupNotifications()
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
        }
    }
    
    
    // MARK: IFYPlayerDelegate
    
    func didUpdatePlayerInfo() {
        do {
            try server.send(message: player.message)
        } catch let error {
            Answers.logCustomEvent(withName: "error_send_message",
                                   customAttributes: nil)
            print(error)
        }
    }
    
    
    // MARK: StatusMenuControllerDelegate

    func didSelect(player selectedPlayer: String) {
        preferences.set(selectedPlayer, forKey: PreferenceKeys.player.rawValue)
        startPlayer(player: selectedPlayer)
        
        Answers.logCustomEvent(withName: "change_player",
                               customAttributes: ["player": selectedPlayer])
    }
    
    func didSelect(systemVolume: Bool) {
        preferences.set(systemVolume, forKey: PreferenceKeys.systemVolume.rawValue)
        controlSystemVolume = systemVolume
        
        Answers.logCustomEvent(withName: "change_volume",
                               customAttributes: ["system_volume": systemVolume])
    }
}
