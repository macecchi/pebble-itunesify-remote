#include <pebble.h>

typedef enum {
	APP_MODE_PLAYBACK,
	APP_MODE_VOLUME
} AppMode;

typedef enum {
	APP_PLAYER_ITUNES,
	APP_PLAYER_SPOTIFY
} AppPlayer;

enum {
	APP_KEY_ACTION = 0,
	APP_KEY_PLAYER = 1,
	APP_KEY_TRACK_NAME = 2,
	APP_KEY_TRACK_ARTIST = 3
};

static AppMode appMode = APP_PLAYER_ITUNES;
static AppPlayer appPlayer;
static Window *window;
static ActionBarLayer *action_bar;
static BitmapLayer *player_layer;
static TextLayer *track_name_layer;
static TextLayer *track_artist_layer;
static GBitmap *itunes_img;
static GBitmap *spotify_img;
static GBitmap *action_icon_previous;
static GBitmap *action_icon_next;
static GBitmap *action_icon_playpause;
static GBitmap *action_icon_ellipsis;
static GBitmap *action_icon_volume_up;
static GBitmap *action_icon_volume_down;

#ifdef PBL_COLOR
	static StatusBarLayer *status_bar;
	static ActionMenu *s_action_menu;
	static ActionMenuLevel *s_root_level;
#endif

static void send_message(char* message) {
	DictionaryIterator *iter;
	app_message_outbox_begin(&iter);

	Tuplet value = TupletCString(0, message);
	dict_write_tuplet(iter, &value);

	app_message_outbox_send();
}

static void in_received_handler(DictionaryIterator *iter, void *context) {
	Layer *window_layer = window_get_root_layer(window);

	Tuple *player = dict_find(iter, APP_KEY_PLAYER);
	if (player) {
		if (strcmp(player->value->cstring, "spotify") == 0) {
			APP_LOG(APP_LOG_LEVEL_DEBUG, "Current player is Spotify.");
			appPlayer = APP_PLAYER_SPOTIFY;
			bitmap_layer_set_bitmap(player_layer, spotify_img);
		} else if (strcmp(player->value->cstring, "itunes") == 0) {
			APP_LOG(APP_LOG_LEVEL_DEBUG, "Current player is iTunes.");
			appPlayer = APP_PLAYER_ITUNES;
			bitmap_layer_set_bitmap(player_layer, itunes_img);
		}
		#ifdef PBL_PLATFORM_APLITE
		  bitmap_layer_set_compositing_mode(player_layer, GCompOpAssignInverted);
		#elif PBL_PLATFORM_BASALT || PBL_PLATFORM_CHALK
		  bitmap_layer_set_compositing_mode(player_layer, GCompOpSet);
		#endif
		
		// Re-add image
		layer_remove_from_parent(bitmap_layer_get_layer(player_layer));
		layer_add_child(window_layer, bitmap_layer_get_layer(player_layer));
		
	}
	
	Tuple *track_name = dict_find(iter, APP_KEY_TRACK_NAME);
	if (track_name) {
		APP_LOG(APP_LOG_LEVEL_DEBUG, "Received track name info.");
		text_layer_set_text(track_name_layer, track_name->value->cstring);
	}
	
	Tuple *track_artist = dict_find(iter, APP_KEY_TRACK_ARTIST);
	if (track_artist) {
		APP_LOG(APP_LOG_LEVEL_DEBUG, "Received track artist info.");
		text_layer_set_text(track_artist_layer, track_artist->value->cstring);
	}
	
	// Re-add text layers
	layer_remove_from_parent(text_layer_get_layer(track_artist_layer));
	layer_remove_from_parent(text_layer_get_layer(track_name_layer));
	layer_add_child(window_layer, text_layer_get_layer(track_artist_layer));
	layer_add_child(window_layer, text_layer_get_layer(track_name_layer));
}

static void up_click_handler(ClickRecognizerRef recognizer, void *context) {
	if (appMode == APP_MODE_PLAYBACK) {
		APP_LOG(APP_LOG_LEVEL_DEBUG, "Previous clicked.");
		send_message("previous");
	} else {
		APP_LOG(APP_LOG_LEVEL_DEBUG, "Volume up clicked.");
		send_message("volume_up");
	}
}

static void down_click_handler(ClickRecognizerRef recognizer, void *context) {
	if (appMode == APP_MODE_PLAYBACK) {
		APP_LOG(APP_LOG_LEVEL_DEBUG, "Next clicked.");
		send_message("next");
	} else {
		APP_LOG(APP_LOG_LEVEL_DEBUG, "Volume down clicked.");
		send_message("volume_down");
	}
}

static void select_click_handler(ClickRecognizerRef recognizer, void *context) {
	if (appMode == APP_MODE_PLAYBACK) {
		APP_LOG(APP_LOG_LEVEL_DEBUG, "Play/pause clicked.");
		send_message("playpause");
	} else {
		APP_LOG(APP_LOG_LEVEL_DEBUG, "Ellipsis clicked.");
		#ifdef PBL_COLOR
		// Configure the ActionMenu Window about to be shown
		ActionMenuConfig config = (ActionMenuConfig) {
		  .root_level = s_root_level,
		  .colors = {
		    .background = GColorGreen,
		    .foreground = GColorBlack,
		  },
		  .align = ActionMenuAlignCenter
		};

		// Show the ActionMenu
		s_action_menu = action_menu_open(&config);
		#else
		appMode = APP_MODE_PLAYBACK;
		action_bar_layer_set_icon(action_bar, BUTTON_ID_SELECT, action_icon_playpause);
		action_bar_layer_set_icon(action_bar, BUTTON_ID_UP, action_icon_previous);
		action_bar_layer_set_icon(action_bar, BUTTON_ID_DOWN, action_icon_next);
		#endif
	}
}

static void long_select_click_handler(ClickRecognizerRef recognizer, void *context) {
	APP_LOG(APP_LOG_LEVEL_DEBUG, "Middle button long press.");

	if (appMode == APP_MODE_PLAYBACK) {
		appMode = APP_MODE_VOLUME;
		action_bar_layer_set_icon(action_bar, BUTTON_ID_SELECT, action_icon_ellipsis);
		action_bar_layer_set_icon(action_bar, BUTTON_ID_UP, action_icon_volume_up);
		action_bar_layer_set_icon(action_bar, BUTTON_ID_DOWN, action_icon_volume_down);
	}
	else {
		appMode = APP_MODE_PLAYBACK;
		action_bar_layer_set_icon(action_bar, BUTTON_ID_SELECT, action_icon_playpause);
		action_bar_layer_set_icon(action_bar, BUTTON_ID_UP, action_icon_previous);
		action_bar_layer_set_icon(action_bar, BUTTON_ID_DOWN, action_icon_next);
	}
}

static void click_config_provider(void *context) {
	window_single_click_subscribe(BUTTON_ID_SELECT, select_click_handler);
	window_long_click_subscribe(BUTTON_ID_SELECT, 0, long_select_click_handler, NULL);
	window_single_click_subscribe(BUTTON_ID_UP, up_click_handler);
	window_single_click_subscribe(BUTTON_ID_DOWN, down_click_handler);
}

#ifdef PBL_COLOR
static void action_performed_callback(ActionMenu *action_menu, const ActionMenuItem *action, void *action_data) {
	AppPlayer player = (AppPlayer)action_menu_item_get_action_data(action);

	if (player == APP_PLAYER_ITUNES) {
		APP_LOG(APP_LOG_LEVEL_DEBUG, "Selected iTunes control.");
		send_message("control_itunes");
	}
	else if (player == APP_PLAYER_SPOTIFY) {
		APP_LOG(APP_LOG_LEVEL_DEBUG, "Selected Spotify control.");
		send_message("control_spotify");
	}
}
#endif

static void window_load(Window *window) {
	// Action Bar
	action_bar = action_bar_layer_create();
	action_bar_layer_add_to_window(action_bar, window);
	action_bar_layer_set_click_config_provider(action_bar, click_config_provider);

	appMode = APP_MODE_PLAYBACK;
	action_bar_layer_set_icon(action_bar, BUTTON_ID_SELECT, action_icon_playpause);
	action_bar_layer_set_icon(action_bar, BUTTON_ID_UP, action_icon_previous);
	action_bar_layer_set_icon(action_bar, BUTTON_ID_DOWN, action_icon_next);

	// Window
	Layer *window_layer = window_get_root_layer(window);
	int16_t width = layer_get_bounds(window_layer).size.w - ACTION_BAR_WIDTH;

	#ifdef PBL_COLOR
		status_bar = status_bar_layer_create();
		status_bar_layer_set_colors(status_bar, GColorWhite, GColorBlack);
		status_bar_layer_set_separator_mode(status_bar, StatusBarLayerSeparatorModeNone);
		// Change the status bar width to make space for the action bar
		#ifdef PBL_PLATFORM_BASALT
			GRect frame = GRect(0, 0, width, STATUS_BAR_LAYER_HEIGHT);
		#elif PBL_PLATFORM_CHALK
			GRect frame = GRect(0, 0, layer_get_bounds(window_layer).size.w, STATUS_BAR_LAYER_HEIGHT);
		#endif
		
		layer_set_frame(status_bar_layer_get_layer(status_bar), frame);
		layer_add_child(window_layer, status_bar_layer_get_layer(status_bar));

		// Create the root level
		s_root_level = action_menu_level_create(2);
		action_menu_level_add_action(s_root_level, "Control iTunes", action_performed_callback, (void *)APP_PLAYER_ITUNES);
		action_menu_level_add_action(s_root_level, "Control Spotify", action_performed_callback, (void *)APP_PLAYER_SPOTIFY);
	#endif
	
	// Resources
	itunes_img = gbitmap_create_with_resource(RESOURCE_ID_ITUNES_FACE);
	spotify_img = gbitmap_create_with_resource(RESOURCE_ID_SPOTIFY_FACE);
	
	#ifdef PBL_PLATFORM_APLITE
		player_layer = bitmap_layer_create(GRect(10,105,40,40));
	#elif PBL_PLATFORM_BASALT
		player_layer = bitmap_layer_create(GRect(10,115,40,40));
	#elif PBL_PLATFORM_CHALK
		player_layer = bitmap_layer_create(GRect(70,130,40,40));
	#endif
	
	
	// Texts
	#ifdef PBL_PLATFORM_APLITE
		int track_info_y = 15;
		int track_info_w = width - 15;
	#elif PBL_PLATFORM_BASALT
		int track_info_y = 25;
		int track_info_w = width - 15;
	#elif PBL_PLATFORM_CHALK
		int track_info_y = 40;
		int track_info_w = width - 20;
	#endif
	track_artist_layer = text_layer_create(GRect(10, track_info_y, track_info_w, 25));
	text_layer_set_font(track_artist_layer, fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD));
	text_layer_set_text(track_artist_layer, "Loading...");
	layer_add_child(window_layer, text_layer_get_layer(track_artist_layer));
	
	track_name_layer = text_layer_create(GRect(10, track_info_y+20,track_info_w, 53));
	text_layer_set_overflow_mode(track_name_layer, GTextOverflowModeWordWrap);
	text_layer_set_font(track_name_layer, fonts_get_system_font(FONT_KEY_GOTHIC_24_BOLD));
	
	#if PBL_PLATFORM_CHALK
		text_layer_set_text_alignment(track_name_layer, GTextAlignmentRight);
		text_layer_set_text_alignment(track_artist_layer, GTextAlignmentRight);
	#endif
}

static void window_unload(Window *window) {
	bitmap_layer_destroy(player_layer);
	gbitmap_destroy(itunes_img);
	gbitmap_destroy(spotify_img);
	action_bar_layer_destroy(action_bar);

	#ifdef PBL_COLOR
		status_bar_layer_destroy(status_bar);
	#endif
}

static void init(void) {
	action_icon_previous = gbitmap_create_with_resource(RESOURCE_ID_ICON_PREVIOUS);
	action_icon_next = gbitmap_create_with_resource(RESOURCE_ID_ICON_NEXT);
	action_icon_playpause = gbitmap_create_with_resource(RESOURCE_ID_ICON_PLAYPAUSE);
	action_icon_ellipsis = gbitmap_create_with_resource(RESOURCE_ID_ICON_ELLIPSIS);
	action_icon_volume_up = gbitmap_create_with_resource(RESOURCE_ID_ICON_VOLUME_UP);
	action_icon_volume_down = gbitmap_create_with_resource(RESOURCE_ID_ICON_VOLUME_DOWN);

	window = window_create();
	window_set_click_config_provider(window, click_config_provider);
	window_set_window_handlers(window, (WindowHandlers) {
		.load = window_load,
		.unload = window_unload,
	});
	const bool animated = true;
	window_stack_push(window, animated);

	app_message_register_inbox_received(in_received_handler);
	app_message_open(256, 256);

	APP_LOG(APP_LOG_LEVEL_DEBUG, "Done initializing, pushed window: %p", window);
}

static void deinit(void) {
	window_destroy(window);
}

int main(void) {
	init();
	app_event_loop();
	deinit();
}