extension Bundle {
    var appVersion: String {
        return self.objectForInfoDictionaryKey("CFBundleShortVersionString") as? String ?? ""
    }
    
    var appName: String {
        return self.objectForInfoDictionaryKey("CFBundleName") as? String ?? ""
    }
}
