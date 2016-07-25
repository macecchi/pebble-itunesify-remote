#import <Foundation/Foundation.h>
#import "iTunes.h"

@interface iTunesBridge : NSObject

+ (iTunesBridge *)sharedInstance;

@property (nonatomic) iTunesTrack *currentTrack;
@property (nonatomic) iTunesEPlS playerState;
@property (nonatomic) NSInteger soundVolume;

- (void)playpause;
- (void)previousTrack;
- (void)nextTrack;

@end
