enum IFYCommand: String {
    case playPause = "playpause"
    case next
    case previous
    case volumeUp = "volume/up"
    case volumeDown = "volume/down"
    case playerSpotify = "current_app/spotify"
    case playerITunes = "current_app/itunes"
}

protocol IFYServer {
    static var sharedInstance: Self { get }
    weak var delegate: IFYServerDelegate? { get set }
    func start()
    func stop()
    func send(message: IFYMessage) throws
}

protocol IFYServerDelegate : class {
    func clientConnected(client: IFYClient)
    func receivedCommand(command: IFYCommand)
}
