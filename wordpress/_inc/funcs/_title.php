<?php
// Enable support for dynamic title tag
add_theme_support('title-tag');

// Customize document title parts for better UX in Japanese
add_filter('document_title_parts', 'kawachi_customize_document_title');
function kawachi_customize_document_title($title) {
  $site_name = '河内みかん堂';
  $separator = '｜'; // Japanese-style separator

  if (is_front_page()) {
    $title['title'] = 'ホーム' . $separator . $site_name;
  } elseif (is_page('contact')) {
    $title['title'] = 'お問い合わせ' . $separator . $site_name;
  } elseif (is_page('confirm')) {
    $title['title'] = '内容確認' . $separator . $site_name;
  } elseif (is_page('complete')) {
    $title['title'] = '送信完了' . $separator . $site_name;
  } else {
    // Default pattern: Page Title | Site Name
    if (!empty($title['title'])) {
      $title['title'] .= $separator . $site_name;
    } else {
      $title['title'] = $site_name;
    }
  }

  return $title;
}
