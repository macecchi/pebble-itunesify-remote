import ScriptingBridge

class IFYiTunes: NSObject, IFYPlayer {
    static var sharedInstance: IFYPlayer = IFYiTunes()
    weak var delegate: IFYPlayerDelegate?
    
    private lazy var notificationCenter = DistributedNotificationCenter.default()
    private var iTunes = SBApplication(bundleIdentifier: "com.apple.iTunes") as! AnyObject
    
    override init() {
        super.init()
        
        notificationCenter.addObserver(self, selector: #selector(didReceivePlayerInfo), name: "com.apple.iTunes.playerInfo" as NSNotification.Name, object: nil)
    }
    
    deinit {
        notificationCenter.removeObserver(self)
    }
    
    func didReceivePlayerInfo(notification: NSNotification!) {
        delegate?.didUpdatePlayerInfo()
    }
    
    var message: IFYMessage {
        var message = IFYMessage()
        message["player"] = "itunes"
        
        if let track = track {
            message["track"] = track.dictionary
        }
        
        return message
    }
    
    var track: IFYTrack? {
        if let iTunesTrack = iTunes.currentTrack {
            return IFYTrack(name: iTunesTrack.name, artist: iTunesTrack.artist)
        }
        
        return nil
    }
    
    var state: IFYPlayerState {
        let playerState = iTunes.playerState
        if playerState == iTunesEPlSPaused { return .paused }
        if playerState == iTunesEPlSPlaying { return .playing }
        return .stopped
    }
    
    var volume: Int {
        get { return iTunes.soundVolume }
        set { iTunes.setValue(newValue, forKey: #keyPath(iTunesApplication.soundVolume)) }
    }
    
    func toggleState() {
        iTunes.playpause()
    }
    
    func previousTrack() {
        iTunes.previousTrack()
    }
    
    func nextTrack() {
        iTunes.nextTrack()
    }
}
