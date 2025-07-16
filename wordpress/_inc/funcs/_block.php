<?php
function my_acf_block_types() {
  if (function_exists('acf_register_block_type')) {
      acf_register_block_type(array(
          'name'              => 'aihhome_block_gallery1',
          'title'             => __('AiHome Gallery 1'),
          'description'       => __('A custom gallery block created with ACF.'),
          'render_template'   => '_parts/block/block-gallery1.php',
          'category'          => 'formatting',
          'icon'              => 'images-alt2',
          'keywords'          => array('gallery', 'custom', 'AiHome'),
      ));
  }
}
add_action('acf/init', 'my_acf_block_types');
