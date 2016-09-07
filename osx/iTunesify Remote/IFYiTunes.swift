import ScriptingBridge

class IFYiTunes: IFYPlayer {
    static var sharedInstance: IFYPlayer = IFYiTunes()
    weak var delegate: IFYPlayerDelegate?
    
    private lazy var notificationCenter = DistributedNotificationCenter.default()
    private var iTunes: iTunesBridge! = iTunesBridge.sharedInstance()
    private var alternateTrackInfo: IFYTrack?
    
    func subscribeForUpdates() {
        notificationCenter.addObserver(self,
                                       selector: #selector(didReceivePlayerInfo),
                                       name: NSNotification.Name("com.apple.iTunes.playerInfo"),
                                       object: nil)
    }
    
    func unsubscribe() {
        notificationCenter.removeObserver(self)
    }
    
    deinit {
        unsubscribe()
    }
    
    @objc func didReceivePlayerInfo(notification: NSNotification!) {
        // Store track info received from notification in case currentTrack fails (e.g.: when playing from Beats 1)
        if let userInfo = notification.userInfo,
            let displayLine0 = userInfo["Display Line 0"] as? String,
            let displayLine1 = userInfo["Display Line 1"] as? String {
            alternateTrackInfo = IFYTrack(name: displayLine0, artist: displayLine1)
        }
        
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
        if let track = iTunes.currentTrack, track.name != "Beats 1" {
            return IFYTrack(name: track.name, artist: track.artist)
        }
        
        return alternateTrackInfo
    }
    
    var state: IFYPlayerState {
        let playerState = iTunes.playerState
        if playerState == iTunesEPlSPaused { return .paused }
        if playerState == iTunesEPlSPlaying { return .playing }
        return .stopped
    }
    
    var volume: Int {
        get { return iTunes.soundVolume }
        set { iTunes.soundVolume = newValue }
    }
    
    func playPause() {
        iTunes.playpause()
    }
    
    func previousTrack() {
        iTunes.previousTrack()
    }
    
    func nextTrack() {
        iTunes.nextTrack()
    }
}
