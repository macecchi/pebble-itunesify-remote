class IFYTrack {
    let name: String?
    let artist: String?
    
    init(name: String?, artist: String?) {
        self.name = name
        self.artist = artist
    }
    
    var dictionary: IFYMessage {
        var dict = IFYMessage()
        
        dict["name"] = name ?? ""
        dict["artist"] = artist ?? ""
        
        return dict
    }
}
