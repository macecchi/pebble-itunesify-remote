import Cocoa

@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate, IFYServerDelegate, IFYPlayerDelegate {
    lazy var server = IFYServer.sharedInstance
    var player: IFYPlayer!

    func applicationDidFinishLaunching(_ aNotification: Notification) {
        player = IFYiTunes.sharedInstance
        player.delegate = self
        
        server.delegate = self
        server.start()
        
        print(player.track?.name, player.track?.artist)
    }

    func applicationWillTerminate(_ aNotification: Notification) {
        // Insert code here to tear down your application
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
//        case .volumeUp:
//
//        case .volumeDown:
//            
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
}

