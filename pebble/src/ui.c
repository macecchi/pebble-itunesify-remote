#include "ui.h"

void click_config_provider(void *context);
void action_performed_callback(ActionMenu *action_menu, const ActionMenuItem *action, void *action_data);

void ui_init() {
		action_icon_previous = gbitmap_create_with_resource(RESOURCE_ID_ICON_PREVIOUS);
		action_icon_next = gbitmap_create_with_resource(RESOURCE_ID_ICON_NEXT);
		action_icon_playpause = gbitmap_create_with_resource(RESOURCE_ID_ICON_PLAYPAUSE);
		action_icon_ellipsis = gbitmap_create_with_resource(RESOURCE_ID_ICON_ELLIPSIS);
		action_icon_volume_up = gbitmap_create_with_resource(RESOURCE_ID_ICON_VOLUME_UP);
		action_icon_volume_down = gbitmap_create_with_resource(RESOURCE_ID_ICON_VOLUME_DOWN);
}

void ui_display_error_msg(char* message) {
	text_layer_set_text(track_artist_layer, "Error");
	text_layer_set_text(track_name_layer, message);
}

void ui_update_artist(char *text) {
  text_layer_set_text(track_artist_layer, text);
}

void ui_update_name(char *text) {
  text_layer_set_text(track_name_layer, text);
}

void ui_update_layers() {
  Layer *window_layer = window_get_root_layer(window);

  layer_remove_from_parent(bitmap_layer_get_layer(player_layer));
  layer_add_child(window_layer, bitmap_layer_get_layer(player_layer));

	layer_remove_from_parent(text_layer_get_layer(track_artist_layer));
	layer_remove_from_parent(text_layer_get_layer(track_name_layer));

  layer_add_child(window_layer, text_layer_get_layer(track_artist_layer));
	layer_add_child(window_layer, text_layer_get_layer(track_name_layer));
}

void ui_update_player(AppPlayer player) {
  if (player == APP_PLAYER_SPOTIFY) {
    bitmap_layer_set_bitmap(player_layer, spotify_img);
  } else {
    bitmap_layer_set_bitmap(player_layer, itunes_img);
  }

  bitmap_layer_set_compositing_mode(player_layer, GCompOpSet);
}

void ui_hide_player() {
	bitmap_layer_set_bitmap(player_layer, NULL);
}

void ui_update_buttons(AppMode mode) {
  if (mode == APP_MODE_VOLUME) {
    action_bar_layer_set_icon(action_bar, BUTTON_ID_SELECT, action_icon_ellipsis);
    action_bar_layer_set_icon(action_bar, BUTTON_ID_UP, action_icon_volume_up);
    action_bar_layer_set_icon(action_bar, BUTTON_ID_DOWN, action_icon_volume_down);
  } else {
    action_bar_layer_set_icon(action_bar, BUTTON_ID_SELECT, action_icon_playpause);
    action_bar_layer_set_icon(action_bar, BUTTON_ID_UP, action_icon_previous);
    action_bar_layer_set_icon(action_bar, BUTTON_ID_DOWN, action_icon_next);
  }
}

void window_load(Window *window) {
	// Action Bar
	action_bar = action_bar_layer_create();
	action_bar_layer_add_to_window(action_bar, window);
	action_bar_layer_set_click_config_provider(action_bar, click_config_provider);

  ui_update_buttons(APP_MODE_PLAYBACK);

	// Window
	Layer *window_layer = window_get_root_layer(window);
	int16_t width = layer_get_bounds(window_layer).size.w - ACTION_BAR_WIDTH;

	status_bar = status_bar_layer_create();
	status_bar_layer_set_colors(status_bar, GColorWhite, GColorBlack);
	status_bar_layer_set_separator_mode(status_bar, StatusBarLayerSeparatorModeNone);
	// Change the status bar width to make space for the action bar
	#ifdef PBL_PLATFORM_CHALK
		GRect frame = GRect(0, 0, layer_get_bounds(window_layer).size.w, STATUS_BAR_LAYER_HEIGHT);
	#else
		GRect frame = GRect(0, 0, width, STATUS_BAR_LAYER_HEIGHT);
	#endif

	layer_set_frame(status_bar_layer_get_layer(status_bar), frame);
	layer_add_child(window_layer, status_bar_layer_get_layer(status_bar));

	// Create the root level
	s_root_level = action_menu_level_create(2);
	action_menu_level_add_action(s_root_level, "Control iTunes", action_performed_callback, (void *)APP_PLAYER_ITUNES);
	action_menu_level_add_action(s_root_level, "Control Spotify", action_performed_callback, (void *)APP_PLAYER_SPOTIFY);

	// Resources
	itunes_img = gbitmap_create_with_resource(RESOURCE_ID_ITUNES_FACE);
	spotify_img = gbitmap_create_with_resource(RESOURCE_ID_SPOTIFY_FACE);

	#if PBL_PLATFORM_CHALK
		player_layer = bitmap_layer_create(GRect(70,130,40,40));
	#else
		player_layer = bitmap_layer_create(GRect(10,115,40,40));
	#endif


	// Texts
	#if PBL_PLATFORM_CHALK
		int track_info_y = 40;
		int track_info_w = width - 20;
	#else
		int track_info_y = 25;
		int track_info_w = width - 15;
	#endif
	track_artist_layer = text_layer_create(GRect(10, track_info_y, track_info_w, 25));
	text_layer_set_font(track_artist_layer, fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD));
	text_layer_set_text(track_artist_layer, "Loading...");
	layer_add_child(window_layer, text_layer_get_layer(track_artist_layer));

	track_name_layer = text_layer_create(GRect(10, track_info_y+20, track_info_w, 53));
	text_layer_set_overflow_mode(track_name_layer, GTextOverflowModeWordWrap);
	text_layer_set_font(track_name_layer, fonts_get_system_font(FONT_KEY_GOTHIC_24_BOLD));

	#if PBL_PLATFORM_CHALK
		text_layer_set_text_alignment(track_name_layer, GTextAlignmentRight);
		text_layer_set_text_alignment(track_artist_layer, GTextAlignmentRight);
	#endif
}

void window_unload(Window *window) {
	bitmap_layer_destroy(player_layer);
	gbitmap_destroy(itunes_img);
	gbitmap_destroy(spotify_img);
	action_bar_layer_destroy(action_bar);
	status_bar_layer_destroy(status_bar);
}
