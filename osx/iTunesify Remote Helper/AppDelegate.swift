import Cocoa

@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate {

    func applicationDidFinishLaunching(_ aNotification: Notification) {
        var pathComponents = (Bundle.main.bundlePath as NSString).pathComponents as NSArray
        pathComponents = pathComponents.subarray(with: NSRange(location: 0, length: pathComponents.count - 4))
        
        if let components = pathComponents as? [String] {
            let path = NSString.path(withComponents: components)            
            NSWorkspace.shared().launchApplication(path)
        }
        
        NSApp.terminate(nil)
    }

    func applicationWillTerminate(_ aNotification: Notification) {
        //
    }

}
