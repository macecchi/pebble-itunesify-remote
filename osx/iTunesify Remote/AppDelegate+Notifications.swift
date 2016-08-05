extension AppDelegate: NSUserNotificationCenterDelegate {
    func setupNotifications() {
        NSUserNotificationCenter.default.delegate = self

        if !preferences.bool(forKey: PreferenceKeys.displayedWelcomeAlert.rawValue) {
            displayWelcomeNotification()
        }
    }

    func displayWelcomeNotification() {
        let notification = NSUserNotification()
        notification.title = "Welcome to iTunesify Remote"
        notification.informativeText = "Open iTunesify Remote in your Pebble to start"

        NSUserNotificationCenter.default.deliver(notification)

        preferences.set(true, forKey: PreferenceKeys.displayedWelcomeAlert.rawValue)
    }

    func userNotificationCenter(_ center: NSUserNotificationCenter,
                                shouldPresent notification: NSUserNotification) -> Bool {
        return true
    }
}
