class IFYTrack {
    let name: String?
    let artist: String?
    
    init(name: String?, artist: String?) {
        self.name = name
        self.artist = artist
    }
    
    var dictionary: IFYMessage {
        var dict = IFYMessage()
        
        if let name = name {
            dict["name"] = name
        }
        
        if let artist = artist {
            dict["artist"] = artist
        }
        
        return dict
    }
}
