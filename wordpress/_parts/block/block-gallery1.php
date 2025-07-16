<?php
$images = get_field('aihhome_block_gallery_1'); // ACF gallery field
$gallery_class = '';

if ($images) {
  $gallery_count = count($images);

  if ($gallery_count > 1 && $gallery_count <= 7) {
    $gallery_class = 'c-gallery--some';
    if ($gallery_count % 2 != 0) {
      $gallery_class .= ' c-gallery--odd';
    }
  } elseif ($gallery_count > 7) {
    $gallery_class = 'c-gallery--many';

    if ($gallery_count % 4 != 0) {
      $remain = ($gallery_count % 3) + 1;
      $gallery_class .= ' c-gallery--remain-by-' . $remain;
    }
  }
?>
  <div class="c-gallery <?php echo esc_attr($gallery_class); ?>">
    <?php foreach ($images as $image) : ?>
      <div class="c-gallery__box">
        <img src="<?php echo esc_url($image['url']); ?>" alt="<?php echo esc_attr($image['alt']); ?>" class="c-gallery__img">
      </div>
    <?php endforeach; ?>
  </div>
<?php
}
?>