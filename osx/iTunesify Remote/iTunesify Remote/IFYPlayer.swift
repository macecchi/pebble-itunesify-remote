enum IFYPlayerState {
    case playing, paused, stopped
}

protocol IFYPlayer {
    static var sharedInstance: IFYPlayer { get }
    weak var delegate: IFYPlayerDelegate? { get set }
    var message: IFYMessage { get }
    
    var state: IFYPlayerState { get }
    var track: IFYTrack? { get }
    var volume: Int { get mutating set }
    func toggleState()
    func previousTrack()
    func nextTrack()
}

protocol IFYPlayerDelegate: class {
    func didUpdatePlayerInfo()
}
