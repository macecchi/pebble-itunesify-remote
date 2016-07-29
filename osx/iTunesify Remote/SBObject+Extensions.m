//
//  SBObject+Extensions.m
//  iTunesify Remote
//
//  Created by Mario Cecchi on 7/29/16.
//  Copyright © 2016 Mario Cecchi. All rights reserved.
//

#import "SBObject+Extensions.h"

#import "iTunes.h"

@implementation SBObject (Extensions)

- (id)debugQuickLookObject
{
    NSString *className = self.className;
    NSLog(@"class name: %@", className);
    if ([className isEqualToString:@"ITunesTrack"]) {
        return [self handleITunesTrack];
    }
    else if ([className isEqualToString:@"ITunesArtwork"]) {
        return [self artworkImage];
    }
    
    return [self description];
}

- (NSString *)handleITunesTrack
{
    iTunesTrack *track = (iTunesTrack *)self;
    
    NSMutableString *s = [NSMutableString new];
    
    [s appendFormat:@"Title:    %@\n", track.name];
    [s appendFormat:@"Artist:   %@\n", track.artist];
    [s appendFormat:@"Album:    %@\n", track.album];
    [s appendFormat:@"Duration: %f seconds\n", track.duration];
    
    return s;
}

- (NSData *)artworkRawData {
    iTunesArtwork *artwork = (iTunesArtwork *)self;
    
    return [artwork rawData];
}

- (NSImage *)artworkImage
{
    NSData *data   = [self artworkRawData];
    NSImage *image = [[NSImage alloc] initWithData:data];
    
    return image;
}


@end
