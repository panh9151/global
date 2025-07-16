<?php
// Loading function
function load_theme_files($base_path, $files = [])
{
  foreach ($files as $file) {
    $path = $base_path . $file . '.php';
    if (file_exists($path)) {
      require_once $path;
    } else {
      error_log("404 Not Found: {$path}");
    }
  }
}
require_once get_stylesheet_directory() . '/_inc/index.php';