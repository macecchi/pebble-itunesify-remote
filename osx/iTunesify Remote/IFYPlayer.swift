enum IFYPlayerState {
    case playing, paused, stopped
}

protocol IFYPlayer: class {
    static var sharedInstance: IFYPlayer { get }
    weak var delegate: IFYPlayerDelegate? { get set }
    var message: IFYMessage { get }
    
    var state: IFYPlayerState { get }
    var track: IFYTrack? { get }
    var volume: Int { get set }
    func playPause()
    func previousTrack()
    func nextTrack()
    
    func subscribeForUpdates()
    func unsubscribe()
}

protocol IFYPlayerDelegate: class {
    func didUpdatePlayerInfo()
}
