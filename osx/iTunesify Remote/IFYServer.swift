import PocketSocket

typealias IFYMessage = [String: AnyObject]
typealias IFYClient = PSWebSocket

func toJSON(message: IFYMessage) -> String? {
    if let data = try? JSONSerialization.data(withJSONObject: message, options: []) {
        return String(data: data, encoding: .utf8)
    }

    return nil
}

func fromJSON(json: String) -> IFYMessage? {
    guard let data = json.data(using: .utf8) else { return nil }
    
    return (try? JSONSerialization.jsonObject(with: data, options: [])) as? IFYMessage
}

enum IFYCommand {
    case playPause, next, previous
    case volumeUp, volumeDown, selectPlayer
    case playerSpotify, playerITunes
    case unknown
}

extension IFYClient {
    func send(message: IFYMessage) throws {
        guard let string = toJSON(message: message) else {
            print("Error converting to JSON string")
            return
        }
        
        self.send(string)
    }
}

protocol IFYServerDelegate : class {
    func clientConnected(client: IFYClient)
    func receivedCommand(command: IFYCommand)
}

class IFYServer: NSObject, PSWebSocketServerDelegate {
    
    static let sharedInstance = IFYServer()
    weak var delegate: IFYServerDelegate?
    
    let server: PSWebSocketServer! = PSWebSocketServer(host: nil, port: 31415)
    var sockets: [PSWebSocket] = []
    
    func start() {
        server.delegate = self
        server.start()
    }
    
    func stop() {
        server.stop()
    }
    
    func send(message: IFYMessage, toClients clients: [IFYClient]? = nil) throws {
        guard let string = toJSON(message: message) else {
            print("Error converting to JSON string")
            return
        }
        
        let destSockets = clients ?? sockets
        destSockets.forEach { socket in
            socket.send(string)
            print("Sent message: \(string)")
        }
    }

    
    // MARK: PSWebSocketServerDelegate
    
    func serverDidStart(_ server: PSWebSocketServer!) {
        print("Server started")
    }
    
    func serverDidStop(_ server: PSWebSocketServer!) {
        print("Server stopped")
    }
    
    func server(_ server: PSWebSocketServer!, didFailWithError error: NSError!) {
        print("Server failed with error", error)
    }
    
    func server(_ server: PSWebSocketServer!, webSocketDidOpen webSocket: PSWebSocket!) {
        sockets.append(webSocket)
        print("New client connected. Total: \(sockets.count)")
        
        delegate?.clientConnected(client: webSocket)
    }
    
    func server(_ server: PSWebSocketServer!, webSocket: PSWebSocket!, didCloseWithCode code: Int, reason: String!, wasClean: Bool) {
        print("Socket closed with reason:", reason)
        forget(socket: webSocket)
    }
    
    func server(_ server: PSWebSocketServer!, webSocket: PSWebSocket!, didReceiveMessage messageObject: AnyObject!) {
        print("Received message: \(messageObject!)")
        
        if let messageString = messageObject as? String, let message = fromJSON(json: messageString) {
            if let action = message["action"] as? String {
                let command = action.IFYCommand()
                delegate?.receivedCommand(command: command)
            }
        }
    }
    
    func server(_ server: PSWebSocketServer!, webSocket: PSWebSocket!, didFailWithError error: NSError!) {
        print("Socket failed with error:", error)
        forget(socket: webSocket)

    }
    
    
    // MARK: Etc.
    
    private func forget(socket: PSWebSocket) {
        if let index = sockets.index(of: socket) {
            sockets.remove(at: index)
        }
    }
}

extension String {
    func IFYCommand() -> IFYCommand {
        switch self {
        case "playpause":
            return .playPause
        case "next":
            return .next
        case "previous":
            return .previous
        case "volume/up":
            return .volumeUp
        case "volume/down":
            return .volumeDown
        case "current_app/spotify":
            return .playerSpotify
        case "current_app/itunes":
            return .playerITunes
        default:
            return .unknown
        }
    }
}
