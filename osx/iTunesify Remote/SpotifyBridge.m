#import "SpotifyBridge.h"

@interface SpotifyBridge ()
@property (nonatomic, strong) SpotifyApplication *spotify;
@end

@implementation SpotifyBridge

+ (id)sharedInstance {
    static SpotifyBridge *staticInstance = nil;
    static dispatch_once_t onceToken;
    
    dispatch_once(&onceToken, ^{
        staticInstance = [[self alloc] init];
    });
    
    return staticInstance;
}


- (instancetype)init {
    self = [super init];
    if (self) {
        self.spotify = [SBApplication applicationWithBundleIdentifier:@"com.spotify.client"];
    }
    return self;
}

- (SpotifyTrack *)currentTrack {
    return self.spotify.currentTrack;
}

- (SpotifyEPlS)playerState {
    return self.spotify.playerState;
}

- (NSInteger)soundVolume {
    return self.spotify.soundVolume;
}

- (void)setSoundVolume:(NSInteger)soundVolume {
    self.spotify.soundVolume = soundVolume;
}

- (void)playpause {
    [self.spotify playpause];
}

- (void)nextTrack {
    [self.spotify nextTrack];
}

- (void)previousTrack {
    [self.spotify previousTrack];
}

@end
