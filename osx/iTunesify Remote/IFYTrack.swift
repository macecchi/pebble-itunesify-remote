//import Cocoa

class IFYTrack {
    let name: String?
    let artist: String?
    let artwork: NSImage?
    
    init(name: String?, artist: String?, artwork: NSImage? = nil) {
        self.name = name
        self.artist = artist
        self.artwork = artwork
    }
    
    var dictionary: IFYMessage {
        var dict = IFYMessage()
        
        dict["name"] = name ?? ""
        dict["artist"] = artist ?? ""
        
        if let artworkImage = artwork {
            let smallImage = artworkImage.resize(width: 50, height: 50)
            dict["artwork"] = smallImage.base64encodedPNG()
        }
        
        return dict
    }
}
