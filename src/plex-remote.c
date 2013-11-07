#include <pebble.h>

static Window *window;
static BitmapLayer *previous_layer;
static BitmapLayer *playpause_layer;
static BitmapLayer *next_layer;

static GBitmap *previous_img;
static GBitmap *playpause_img;
static GBitmap *next_img;
static GBitmap *previous_selected_img;
static GBitmap *playpause_selected_img;
static GBitmap *next_selected_img;

static const uint32_t ACTION_KEY = 0xabbababe;

static void send_message(char* message) {

  DictionaryIterator *iter;
  app_message_outbox_begin(&iter);

  Tuplet value = TupletCString(ACTION_KEY, message);
  dict_write_tuplet(iter, &value);

  app_message_outbox_send();
}

static void select_click_handler(ClickRecognizerRef recognizer, void *context) {
  APP_LOG(APP_LOG_LEVEL_DEBUG, "Play/pause clicked.");
  send_message("playpause");
  //bitmap_layer_set_bitmap(playpause_layer, playpause_selected_img);
}

static void up_click_handler(ClickRecognizerRef recognizer, void *context) {
  APP_LOG(APP_LOG_LEVEL_DEBUG, "Previous clicked.");
  send_message("previous");
  //bitmap_layer_set_bitmap(previous_layer, previous_selected_img);
}

static void down_click_handler(ClickRecognizerRef recognizer, void *context) {
  send_message("next");
  APP_LOG(APP_LOG_LEVEL_DEBUG, "Next clicked.");
  //bitmap_layer_set_bitmap(next_layer, next_selected_img);
}

static void click_config_provider(void *context) {
  window_single_click_subscribe(BUTTON_ID_SELECT, select_click_handler);
  window_single_click_subscribe(BUTTON_ID_UP, up_click_handler);
  window_single_click_subscribe(BUTTON_ID_DOWN, down_click_handler);
}

static void window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  window_set_fullscreen(window, true);

  // Resources
  previous_img  = gbitmap_create_with_resource(RESOURCE_ID_IMAGE_PREVIOUS);
  playpause_img = gbitmap_create_with_resource(RESOURCE_ID_IMAGE_PLAYPAUSE);
  next_img      = gbitmap_create_with_resource(RESOURCE_ID_IMAGE_NEXT);

  previous_selected_img   = gbitmap_create_with_resource(RESOURCE_ID_IMAGE_PREVIOUS_SELECTED);
  playpause_selected_img  = gbitmap_create_with_resource(RESOURCE_ID_IMAGE_PLAYPAUSE_SELECTED);
  next_selected_img       = gbitmap_create_with_resource(RESOURCE_ID_IMAGE_NEXT_SELECTED);

  previous_layer = bitmap_layer_create(GRect(114, 10, 30, 52));
  bitmap_layer_set_bitmap(previous_layer, previous_img);
  layer_add_child(window_layer, bitmap_layer_get_layer(previous_layer));

  playpause_layer = bitmap_layer_create(GRect(114, 60, 30, 52));
  bitmap_layer_set_bitmap(playpause_layer, playpause_img);
  layer_add_child(window_layer, bitmap_layer_get_layer(playpause_layer));

  next_layer = bitmap_layer_create(GRect(114, 108, 30, 52));
  bitmap_layer_set_bitmap(next_layer, next_img);
  layer_add_child(window_layer, bitmap_layer_get_layer(next_layer));  

}

static void window_unload(Window *window) {

  bitmap_layer_destroy(previous_layer);
  bitmap_layer_destroy(playpause_layer);
  bitmap_layer_destroy(next_layer);

  gbitmap_destroy(previous_img);
  gbitmap_destroy(playpause_img);
  gbitmap_destroy(next_img);

  gbitmap_destroy(previous_selected_img);
  gbitmap_destroy(playpause_selected_img);
  gbitmap_destroy(next_selected_img);
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