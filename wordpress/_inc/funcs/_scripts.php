<?php
global $theme_global_scripts, $theme_page_scripts;
define('JQUERY_CDN', [
  'src'    => 'https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js',
  'deps'   => [],
  'footer' => true,
]);

define('GSAP_CDN', [
  'src'    => 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
  'deps'   => ['jquery'],
  'footer' => true,
]);

define('THEME_JS_BASE', [
  'src'    => theme_uri() . 'assets/js/base.js',
  'deps'   => ['jquery'],
  'footer' => true,
]);

define('THEME_JS_MAIN', [
  'src'    => theme_uri() . 'assets/js/main.js',
  'deps'   => ['jquery'],
  'footer' => true,
]);

$theme_global_scripts = [
  'script-base' => THEME_JS_BASE,
];

$theme_page_scripts = [
  // 'single' => [
    // 'script-masonry' => MASONRY_CDN,
  // ],
];

function theme_register_jquery_cdn()
{
  if (!is_admin()) {
    wp_deregister_script('jquery');
    $jquery = JQUERY_CDN;
    wp_register_script('jquery', $jquery['src'], $jquery['deps'], null, $jquery['footer']);
    wp_enqueue_script('jquery');
  }
}
add_action('wp_enqueue_scripts', 'theme_register_jquery_cdn');

function theme_enqueue_all_scripts()
{
  global $theme_global_scripts, $theme_page_scripts;
  foreach ($theme_global_scripts as $handle => $script) {
    wp_enqueue_script($handle, $script['src'], $script['deps'], null, $script['footer']);
  }

  foreach ($theme_page_scripts as $page => $scripts) {
    if (($page == 'single' && is_single())) {
      foreach ($scripts as $handle => $script) {
        if (!wp_script_is($handle, 'enqueued')) {
          wp_enqueue_script($handle, $script['src'], $script['deps'], null, $script['footer']);
        }
      }
    }
  }
}
add_action('wp_enqueue_scripts', 'theme_enqueue_all_scripts');
