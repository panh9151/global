<?php
#region - Functions
function theme_uri() {
  return get_stylesheet_directory_uri() . '/';
}

function theme_path() {
  return get_stylesheet_directory() . '/';
}

function get_site() {
  return home_url() . '/';
}

function html($txt) {
  return esc_html($txt);
}

function url($txt) {
  return esc_url($txt);
}

function attr($txt) {
  return esc_attr($txt);
}

function get_part($slug, $stuff = null) {
  get_template_part('_parts/' . $slug, $stuff);
}

#endregion

#region - Constants
define("BREAKPOINT_SP", "767px");
define("BREAKPOINT_TAB", "1024px");
#endregion