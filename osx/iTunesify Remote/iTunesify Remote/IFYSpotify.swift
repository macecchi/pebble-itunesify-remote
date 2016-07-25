import ScriptingBridge

class IFYSpotify: IFYPlayer {
    static var sharedInstance: IFYPlayer = IFYSpotify()
    weak var delegate: IFYPlayerDelegate?
    
    private lazy var notificationCenter = DistributedNotificationCenter.default()
    private var spotify: SpotifyBridge! = SpotifyBridge.sharedInstance()
    
    func subscribeForUpdates() {
        notificationCenter.addObserver(self, selector: #selector(didReceivePlayerInfo), name: "com.spotify.client.PlaybackStateChanged" as NSNotification.Name, object: nil)
    }
    
    func unsubscribe() {
        notificationCenter.removeObserver(self)
    }
    
    deinit {
        unsubscribe()
    }
    
    @objc func didReceivePlayerInfo(notification: NSNotification!) {
        delegate?.didUpdatePlayerInfo()
    }
    
    var message: IFYMessage {
        var message = IFYMessage()
        message["player"] = "spotify"
        
        if let track = track {
            message["track"] = track.dictionary
        }
        
        return message
    }
    
    var track: IFYTrack? {
        if let track = spotify.currentTrack {
            return IFYTrack(name: track.name, artist: track.artist)
        }
        
        return nil
    }
    
    var state: IFYPlayerState {
        let playerState = spotify.playerState
        if playerState == SpotifyEPlSPaused { return .paused }
        if playerState == SpotifyEPlSPlaying { return .playing }
        return .stopped
    }
    
    var volume: Int {
        get { return spotify.soundVolume }
        set { spotify.soundVolume = newValue }
    }
    
    func toggleState() {
        spotify.playpause()
    }
    
    func previousTrack() {
        spotify.previousTrack()
    }
    
    func nextTrack() {
        spotify.nextTrack()
    }
}
