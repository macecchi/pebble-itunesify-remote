#include <pebble.h>
#include "common.h"
#include "ui.h"

enum {
	APP_KEY_ACTION = 0,
	APP_KEY_PLAYER = 1,
	APP_KEY_TRACK_NAME = 2,
	APP_KEY_TRACK_ARTIST = 3,
	APP_KEY_ALERT = 4
} keys;

AppMode appMode = APP_MODE_PLAYBACK;
AppPlayer appPlayer = APP_PLAYER_ITUNES;

Window *window;
ActionBarLayer *action_bar;
BitmapLayer *player_layer;
TextLayer *track_name_layer;
TextLayer *track_artist_layer;
GBitmap *itunes_img;
GBitmap *spotify_img;
GBitmap *action_icon_previous;
GBitmap *action_icon_next;
GBitmap *action_icon_playpause;
GBitmap *action_icon_ellipsis;
GBitmap *action_icon_volume_up;
GBitmap *action_icon_volume_down;
StatusBarLayer *status_bar;
ActionMenu *s_action_menu;
ActionMenuLevel *s_root_level;

static void send_message(char* message) {
	DictionaryIterator *iter;
	app_message_outbox_begin(&iter);

	Tuplet value = TupletCString(APP_KEY_ACTION, message);
	dict_write_tuplet(iter, &value);

	app_message_outbox_send();
}

static void in_received_handler(DictionaryIterator *iter, void *context) {
	// Alert message
	Tuple *alert = dict_find(iter, APP_KEY_ALERT);
	if (alert) {
		char *alertType = alert->value->cstring;
		APP_LOG(APP_LOG_LEVEL_DEBUG, "Received alert message (%s).", alertType);

		if (strcmp(alertType, "not configured") == 0) {
			ui_display_error_msg("iTunesify not configured.");
		} else if (strcmp(alertType, "failed") == 0) {
			ui_display_error_msg("Could not connect.");
		} else if (strcmp(alertType, "closed") == 0) {
			ui_display_error_msg("Mac disconnected.");
		} else if (strcmp(alertType, "errored") == 0) {
			ui_display_error_msg("Trying to connect...");
		}

		ui_hide_player();
	}

	// Player message
	Tuple *player = dict_find(iter, APP_KEY_PLAYER);
	if (player) {
		char *selectedPlayer = player->value->cstring;
		if (strcmp(selectedPlayer, "spotify") == 0) {
			appPlayer = APP_PLAYER_SPOTIFY;
		} else if (strcmp(selectedPlayer, "itunes") == 0) {
			appPlayer = APP_PLAYER_ITUNES;
		}

		ui_update_player(appPlayer);
	}

	// Track name message
	Tuple *track_name = dict_find(iter, APP_KEY_TRACK_NAME);
	if (track_name) {
		ui_update_name(track_name->value->cstring);
	}

	// Track artist message
	Tuple *track_artist = dict_find(iter, APP_KEY_TRACK_ARTIST);
	if (track_artist) {
		ui_update_artist(track_artist->value->cstring);
	}

	ui_update_layers();
}

static void app_connection_handler(bool connected) {
  APP_LOG(APP_LOG_LEVEL_INFO, "Pebble app %sconnected", connected ? "" : "dis");
	if (!connected) {
		ui_display_error_msg("Pebble disconnected");
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
		send_message("playpause");
	} else {
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
	}
}

static void long_select_click_handler(ClickRecognizerRef recognizer, void *context) {
	if (appMode == APP_MODE_PLAYBACK) {
		appMode = APP_MODE_VOLUME;
	} else {
		appMode = APP_MODE_PLAYBACK;
	}

	ui_update_buttons(appMode);
}

void click_config_provider(void *context) {
	window_single_click_subscribe(BUTTON_ID_SELECT, select_click_handler);
	window_long_click_subscribe(BUTTON_ID_SELECT, 0, long_select_click_handler, NULL);
	window_single_click_subscribe(BUTTON_ID_UP, up_click_handler);
	window_single_click_subscribe(BUTTON_ID_DOWN, down_click_handler);
}

void action_performed_callback(ActionMenu *action_menu, const ActionMenuItem *action, void *action_data) {
	AppPlayer player = (AppPlayer)action_menu_item_get_action_data(action);

	if (player == APP_PLAYER_ITUNES) {
		APP_LOG(APP_LOG_LEVEL_DEBUG, "Requesting iTunes control.");
		send_message("control_itunes");
	}
	else if (player == APP_PLAYER_SPOTIFY) {
		APP_LOG(APP_LOG_LEVEL_DEBUG, "Requesting Spotify control.");
		send_message("control_spotify");
	}
}

static void init(void) {
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

	connection_service_subscribe((ConnectionHandlers) {
	  .pebble_app_connection_handler = app_connection_handler,
	});

	ui_init();
	ui_update_buttons(appMode);

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
