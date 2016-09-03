extension Bundle {
    var appVersion: String {
        return self.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? ""
    }
    
    var appName: String {
        return self.object(forInfoDictionaryKey: "CFBundleName") as? String ?? ""
    }
}
