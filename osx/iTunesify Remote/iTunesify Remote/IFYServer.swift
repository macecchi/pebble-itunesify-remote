//
//  Server.swift
//  iTunesify Sockets
//
//  Created by Mario Cecchi on 23/07/2016.
//  Copyright © 2016 Mario Cecchi. All rights reserved.
//

import PocketSocket

typealias IFYMessage = [String: AnyObject]
typealias IFYClient = PSWebSocket

func JSON(message: IFYMessage) -> String? {
    if let data = try? JSONSerialization.data(withJSONObject: message, options: []) {
        return String(data: data, encoding: .utf8)
    }

    return nil
}

extension IFYClient {
    func send(message: IFYMessage) throws {
        guard let string = JSON(message: message) else {
            print("Error converting to JSON string")
            return
        }
        
        self.send(string)
    }
}

protocol IFYServerDelegate : class {
    func clientConnected(client: IFYClient)
}

class IFYServer: NSObject, PSWebSocketServerDelegate {
    
    static let sharedInstance = IFYServer()
    weak var delegate: IFYServerDelegate?
    
    let server: PSWebSocketServer! = PSWebSocketServer(host: nil, port: 8000)
    var sockets: [PSWebSocket] = []
    
    func start() {
        server.delegate = self
        server.start()
    }
    
    func send(message: IFYMessage, toClients clients: [IFYClient]? = nil) throws {
        guard let string = JSON(message: message) else {
            print("Error converting to JSON string")
            return
        }
        
        print("JSON: \(string)")
        
        let destSockets = clients ?? sockets
        destSockets.forEach { socket in
            socket.send(string)
            print("Sent message")
        }
    }

    
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
        print("New socket connected")
        sockets.append(webSocket)
        delegate?.clientConnected(client: webSocket)
    }
    
    func server(_ server: PSWebSocketServer!, webSocket: PSWebSocket!, didCloseWithCode code: Int, reason: String!, wasClean: Bool) {
        print("Socket closed with reason:", reason)
        forget(socket: webSocket)
    }
    
    func server(_ server: PSWebSocketServer!, webSocket: PSWebSocket!, didReceiveMessage message: AnyObject!) {
        print("Received message: \(message)")
    }
    
    func server(_ server: PSWebSocketServer!, webSocket: PSWebSocket!, didFailWithError error: NSError!) {
        print("Socket failed with error:", error)
        forget(socket: webSocket)

    }
    
    private func forget(socket: PSWebSocket) {
        if let index = sockets.index(of: socket) {
            sockets.remove(at: index)
        }
    }
}
