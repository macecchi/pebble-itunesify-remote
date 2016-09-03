import Cocoa

@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate {

    func applicationDidFinishLaunching(_ aNotification: Notification) {
        let pathComponents = (Bundle.main.bundlePath as NSString).pathComponents
        let components = Array(pathComponents.prefix(pathComponents.count - 4))
        let path = NSString.path(withComponents: components)
        NSWorkspace.shared().launchApplication(path)
        
        NSApp.terminate(nil)
    }

    func applicationWillTerminate(_ aNotification: Notification) {
        //
    }

}
