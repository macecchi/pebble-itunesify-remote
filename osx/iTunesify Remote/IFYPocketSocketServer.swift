import PocketSocket

extension PSWebSocket : IFYClient {
    func send(message: IFYMessage) throws {
        guard let string = toJSON(message: message) else {
            print("Error converting to JSON string")
            return
        }
        
        self.send(string)
    }
}

final class IFYPocketSocketServer: NSObject, IFYServer, PSWebSocketServerDelegate {
    weak internal var delegate: IFYServerDelegate?
    
    static var sharedInstance = IFYPocketSocketServer()
    
    let server: PSWebSocketServer! = PSWebSocketServer(host: nil, port: 31415)
    var sockets: [PSWebSocket] = []
    
    func start() {
        server.delegate = self
        server.start()
    }
    
    func stop() {
        server.stop()
    }
    
    func send(message: IFYMessage) throws {
        guard let string = toJSON(message: message) else {
            print("Error converting to JSON string")
            return
        }
        
        let destSockets = sockets
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
    
    func server(_ server: PSWebSocketServer!, didFailWithError error: Error!) {
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
    
    func server(_ server: PSWebSocketServer!, webSocket: PSWebSocket!, didReceiveMessage messageObject: Any!) {
        print("Received message: \(messageObject!)")
        
        guard let messageString = messageObject as? String,
            let message = fromJSON(json: messageString) else { return }
        
        if let action = message["action"] as? String, let command = IFYCommand(rawValue: action) {
            delegate?.receivedCommand(command: command)
        }
    }
    
    func server(_ server: PSWebSocketServer!, webSocket: PSWebSocket!, didFailWithError error: Error!) {
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
