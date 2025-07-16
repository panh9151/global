<?php
#region - Handle unnecessary wp_head()
// Disable style contain-intrinsic-size: auto
add_filter('wp_img_tag_add_auto_sizes', '__return_false');

// Remove type=text/javascript|CSS & />
add_action('template_redirect', function () {
  ob_start('process_html_output');
});

function process_html_output($content)
{
  $content = remove_text_type_attributes($content);
  $content = fix_self_closing_tags($content);
  $content = sanitize_invalid_roles($content);
  return $content;
}

function remove_text_type_attributes($content)
{
  $pattern = '/\s+type=[\'"]text\/(javascript|css)[\'"]/i';
  return preg_replace($pattern, '', $content);
}

function fix_self_closing_tags($content)
{
  return str_replace('/>', '>', $content);
}

function sanitize_invalid_roles($content)
{
  return preg_replace('/\s+role=["\']group["\']/', '', $content);
}
#endregion