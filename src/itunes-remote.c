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
  APP_KEY_PLAYER
};

static AppMode appMode = APP_PLAYER_ITUNES;
static AppPlayer appPlayer;
static Window *window;
static ActionBarLayer *action_bar;
static BitmapLayer *player_layer;
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

	Tuplet value = TupletCString(1, message);
	dict_write_tuplet(iter, &value);

	app_message_outbox_send();
}

static void in_received_handler(DictionaryIterator *iter, void *context) {
	Tuple *tuple;


	tuple = dict_find(iter, APP_KEY_PLAYER);
	if (tuple) {
		if (strcmp(tuple->value->cstring, "spotify") == 0) {
			APP_LOG(APP_LOG_LEVEL_DEBUG, "Current player is Spotify.");
			appPlayer = APP_PLAYER_SPOTIFY;
			bitmap_layer_set_bitmap(player_layer, spotify_img);
		}
		else if (strcmp(tuple->value->cstring, "itunes") == 0) {
			APP_LOG(APP_LOG_LEVEL_DEBUG, "Current player is iTunes.");
			appPlayer = APP_PLAYER_ITUNES;
			bitmap_layer_set_bitmap(player_layer, itunes_img);
		}
		#ifdef PBL_PLATFORM_APLITE
		  bitmap_layer_set_compositing_mode(player_layer, GCompOpAssignInverted);
		#elif PBL_PLATFORM_BASALT
		  bitmap_layer_set_compositing_mode(player_layer, GCompOpSet);
		#endif
		layer_remove_from_parent(bitmap_layer_get_layer(player_layer));
		layer_add_child(window_get_root_layer(window), bitmap_layer_get_layer(player_layer));
	}
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

	#ifdef PBL_COLOR
		status_bar = status_bar_layer_create();
		status_bar_layer_set_colors(status_bar, GColorWhite, GColorBlack);
		status_bar_layer_set_separator_mode(status_bar, StatusBarLayerSeparatorModeNone);
		// Change the status bar width to make space for the action bar
		int16_t width = layer_get_bounds(window_layer).size.w - ACTION_BAR_WIDTH;
		GRect frame = GRect(0, 0, width, STATUS_BAR_LAYER_HEIGHT);
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
		player_layer = bitmap_layer_create(GRect(25,38,80,80));
	#elif PBL_PLATFORM_BASALT
		player_layer = bitmap_layer_create(GRect(18,45,80,80));
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