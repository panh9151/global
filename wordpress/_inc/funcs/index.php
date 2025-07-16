<?php
define('FUNCTION_ROOT', get_stylesheet_directory() . '/_inc/funcs/');
$files = [
  '_actions',
  '_format',
  '_helpers',
  '_scripts',
  '_title',
  '_block',
];
load_theme_files(FUNCTION_ROOT, $files);
