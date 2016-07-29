//
//  SBObject+Extensions.h
//  iTunesify Remote
//
//  Created by Mario Cecchi on 7/29/16.
//  Copyright © 2016 Mario Cecchi. All rights reserved.
//

@import ScriptingBridge;

@interface SBObject (Extensions)

- (id)debugQuickLookObject;
- (NSImage *)artworkImage;
- (NSData *)artworkRawData;

@end
