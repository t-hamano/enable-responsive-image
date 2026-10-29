<?php
/**
 * Plugin Name: Enable Responsive Image Test Hide Preview Button
 * Description: Hides the preview button for e2e tests.
 * Author: Aki Hamano
 * License: GPL2 or later
 */

add_filter( 'enable_responsive_image_show_preview_button', '__return_false' );
