import ScriptingBridge

class IFYiTunes: IFYPlayer {
    static var sharedInstance: IFYPlayer = IFYiTunes()
    weak var delegate: IFYPlayerDelegate?
    
    private lazy var notificationCenter = DistributedNotificationCenter.default()
    private var iTunes: iTunesBridge! = iTunesBridge.sharedInstance()
    
    func subscribeForUpdates() {
        notificationCenter.addObserver(self, selector: #selector(didReceivePlayerInfo), name: "com.apple.iTunes.playerInfo" as NSNotification.Name, object: nil)
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
        message["player"] = "itunes"
        
        if let track = track {
            message["track"] = track.dictionary
        }
        print(message)
        return message
    }
    
    var track: IFYTrack? {
        if let track = iTunes.currentTrack {
            var artworkImage: NSImage?
            if let artwork = track.artworks()?[0] as? SBObject {
                artworkImage = artwork.artworkImage()
            }
            return IFYTrack(name: track.name, artist: track.artist, artwork: artworkImage)
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
