class IFYSystemVolume {
    static let sharedInstance = IFYSystemVolume()
    
    var volume: Int {
        get {
            let volume = NSSound.systemVolume()
            return Int(volume * 100)
        }
        
        set {
            let volume = relativeVolume(newValue)
            NSSound.setSystemVolume(volume)
        }
    }
    
    private func relativeVolume(_ volume: Int) -> Float {
        if volume < 0 {
            return 0
        } else if volume > 100 {
            return 1
        } else {
            return Float(volume)/100
        }
    }
}
