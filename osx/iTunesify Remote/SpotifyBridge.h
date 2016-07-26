#import <Foundation/Foundation.h>
#import "Spotify.h"

@interface SpotifyBridge : NSObject

+ (SpotifyBridge *)sharedInstance;

@property (nonatomic) SpotifyTrack *currentTrack;
@property (nonatomic) SpotifyEPlS playerState;
@property (nonatomic) NSInteger soundVolume;

- (void)playpause;
- (void)previousTrack;
- (void)nextTrack;

@end
