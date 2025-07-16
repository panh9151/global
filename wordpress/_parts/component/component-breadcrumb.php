<?php
global $breadcrumb_post_title, $custom_breadcrumb;
if (!defined('ABSPATH')) {
  exit;
}

function display_breadcrumb_item($url, $title, $is_last = false)
{
  if ($is_last) {
    echo '<li class="c-breadcrumb__item">&gt;</li>';
    echo '<li class="c-breadcrumb__item">' . esc_html($title) . '</li>';
  } else {
    echo '<li class="c-breadcrumb__item">&gt;</li>';
    echo '<li class="c-breadcrumb__item"><a class="c-breadcrumb__link" href="' . esc_url($url) . '">' . esc_html($title) . '</a></li>';
  }
}

echo '<div class="l-container l-container--1160">';
echo '<nav><ul class="c-breadcrumb">';
echo '<li class="c-breadcrumb__item"><a class="c-breadcrumb__link" href="' . home_url() . '">Top</a></li>';

if (isset($custom_breadcrumb) && is_array($custom_breadcrumb)) {
  foreach ($custom_breadcrumb as $key => $item) {
    $url = isset($item['url']) ? $item['url'] : '';
    $title = isset($item['title']) ? $item['title'] : '';

    display_breadcrumb_item($url, $title, $key === count($custom_breadcrumb) - 1);
  }
} else {
  $current_url = $_SERVER['REQUEST_URI'];
  $url_parts = explode('/', trim($current_url, '/'));

  $total_parts = count($url_parts);
  foreach ($url_parts as $key => $part) {
    $breadcrumb_title = ucwords(str_replace('-', ' ', $part));

    if ($part === 'news') {
      $breadcrumb_title = 'News';
    }

    $url = home_url('/' . implode('/', array_slice($url_parts, 0, $key + 1)));

    if ($key === $total_parts - 1 && isset($breadcrumb_post_title)) {
      $breadcrumb_title = $breadcrumb_post_title;
    }

    display_breadcrumb_item($url, $breadcrumb_title, $key === $total_parts - 1);
  }
}

echo '</ul></nav></div>';
