#include <pebble.h>

static Window *window;
static ActionBarLayer *action_bar;
static Layer *logo_layer;
static GBitmap *logo_img;
static GBitmap *action_icon_previous;
static GBitmap *action_icon_next;
static GBitmap *action_icon_playpause;

static void send_message(char* message) {
  DictionaryIterator *iter;
  app_message_outbox_begin(&iter);

  Tuplet value = TupletCString(1, message);
  dict_write_tuplet(iter, &value);

  app_message_outbox_send();
}

static void up_click_handler(ClickRecognizerRef recognizer, void *context) {
  APP_LOG(APP_LOG_LEVEL_DEBUG, "Previous clicked.");
  send_message("previous");
}

static void down_click_handler(ClickRecognizerRef recognizer, void *context) {
  APP_LOG(APP_LOG_LEVEL_DEBUG, "Next clicked.");
  send_message("next");
}

static void select_click_handler(ClickRecognizerRef recognizer, void *context) {
  APP_LOG(APP_LOG_LEVEL_DEBUG, "Play/pause clicked.");
  send_message("playpause");
}

static void click_config_provider(void *context) {
  window_single_click_subscribe(BUTTON_ID_SELECT, select_click_handler);
  window_single_click_subscribe(BUTTON_ID_UP, up_click_handler);
  window_single_click_subscribe(BUTTON_ID_DOWN, down_click_handler);
}

static void logo_layer_update_callback(Layer *layer, GContext *ctx) {
  graphics_context_set_compositing_mode(ctx, GCompOpSet);
  graphics_draw_bitmap_in_rect(ctx, logo_img, layer_get_bounds(layer));
}

static void window_load(Window *window) {
  // Action Bar
  action_bar = action_bar_layer_create();
  action_bar_layer_add_to_window(action_bar, window);
  action_bar_layer_set_click_config_provider(action_bar, click_config_provider);

  action_bar_layer_set_icon(action_bar, BUTTON_ID_UP, action_icon_previous);
  action_bar_layer_set_icon(action_bar, BUTTON_ID_DOWN, action_icon_next);
  action_bar_layer_set_icon(action_bar, BUTTON_ID_SELECT, action_icon_playpause);

  // Window
  Layer *window_layer = window_get_root_layer(window);
  //GRect bounds = layer_get_bounds(window_layer);

  // Resources
  logo_img = gbitmap_create_with_resource(RESOURCE_ID_LOGO);
  logo_layer = layer_create(GRect(18,45,80,80));
  layer_set_update_proc(logo_layer, logo_layer_update_callback);

  // bitmap_layer_set_bitmap(logo_layer, logo_img);
  layer_add_child(window_layer, logo_layer);
}

static void window_unload(Window *window) {
  layer_destroy(logo_layer);
  gbitmap_destroy(logo_img);
  action_bar_layer_destroy(action_bar);
}

static void init(void) {
  action_icon_previous = gbitmap_create_with_resource(RESOURCE_ID_ICON_PREVIOUS);
  action_icon_next = gbitmap_create_with_resource(RESOURCE_ID_ICON_NEXT);
  action_icon_playpause = gbitmap_create_with_resource(RESOURCE_ID_ICON_PLAYPAUSE);

  window = window_create();
  window_set_click_config_provider(window, click_config_provider);
  window_set_window_handlers(window, (WindowHandlers) {
    .load = window_load,
    .unload = window_unload,
  });
  const bool animated = true;
  window_stack_push(window, animated);
}

static void deinit(void) {
  window_destroy(window);
}

int main(void) {
  init();

  APP_LOG(APP_LOG_LEVEL_DEBUG, "Done initializing, pushed window: %p", window);

  const uint32_t inbound_size = 64;
  const uint32_t outbound_size = 64;
  app_message_open(inbound_size, outbound_size);

  app_event_loop();
  deinit();
}