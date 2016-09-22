#ifndef __UI_H_
#define __UI_H_

#include <pebble.h>
#include "common.h"

extern Window *window;
extern ActionBarLayer *action_bar;
extern BitmapLayer *player_layer;
extern TextLayer *track_name_layer;
extern TextLayer *track_artist_layer;
extern GBitmap *itunes_img;
extern GBitmap *spotify_img;
extern GBitmap *action_icon_previous;
extern GBitmap *action_icon_next;
extern GBitmap *action_icon_playpause;
extern GBitmap *action_icon_ellipsis;
extern GBitmap *action_icon_volume_up;
extern GBitmap *action_icon_volume_down;
extern StatusBarLayer *status_bar;
extern ActionMenu *s_action_menu;
extern ActionMenuLevel *s_root_level;

void ui_init();
void ui_display_error_msg(char* message);
void ui_update_artist(char *text);
void ui_update_name(char *text);
void ui_update_layers();
void ui_update_player(AppPlayer player);
void ui_hide_player();
void ui_update_buttons(AppMode mode);

void window_load(Window *window);
void window_unload(Window *window);

#endif
