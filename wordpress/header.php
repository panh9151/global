<body <?php echo current_user_can('administrator') ? 'class="is-admin"' : ''; ?>>
  <main class="<?= $main; ?>" id="<?= $main; ?>">
    <?php
    // Header Main 
    get_part('header/header-main')
    ?>