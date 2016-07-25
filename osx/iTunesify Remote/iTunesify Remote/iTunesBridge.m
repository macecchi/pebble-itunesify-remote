#import "iTunesBridge.h"

@interface iTunesBridge ()
@property (nonatomic, strong) iTunesApplication *iTunes;
@end

@implementation iTunesBridge

+ (id)sharedInstance {
    static iTunesBridge *staticInstance = nil;
    static dispatch_once_t onceToken;
    
    dispatch_once(&onceToken, ^{
        staticInstance = [[self alloc] init];
    });
    
    return staticInstance;
}


- (instancetype)init {
    self = [super init];
    if (self) {
        self.iTunes = [SBApplication applicationWithBundleIdentifier:@"com.apple.iTunes"];
    }
    return self;
}

- (iTunesTrack *)currentTrack {
    return self.iTunes.currentTrack;
}

- (iTunesEPlS)playerState {
    return self.iTunes.playerState;
}

- (NSInteger)soundVolume {
    return self.iTunes.soundVolume;
}

- (void)setSoundVolume:(NSInteger)soundVolume {
    self.iTunes.soundVolume = soundVolume;
}

- (void)playpause {
    [self.iTunes playpause];
}

- (void)nextTrack {
    [self.iTunes nextTrack];
}

- (void)previousTrack {
    [self.iTunes previousTrack];
}

@end
