extension NSImage {
    func resize(width: CGFloat, height: CGFloat) -> NSImage {
        let img = NSImage(size: CGSize(width: width, height: height))
        
        img.lockFocus()
        let ctx = NSGraphicsContext.current()
        ctx?.imageInterpolation = .high
        self.draw(in: NSRect(x: 0, y: 0, width: width, height: height),
                  from: NSRect(x: 0, y: 0, width: size.width, height: size.height),
                  operation: .copy,
                  fraction: 1)
        img.unlockFocus()
        
        return img
    }
    
    func base64encodedPNG() -> String? {
        let bitmapImage = NSBitmapImageRep(data: self.tiffRepresentation!)
        if let bytes = bitmapImage?.representation(using: .PNG, properties: [:]) {
            return bytes.base64EncodedString()
        }
        
        return nil
    }
}
