<?php
/**
 * Plugin Name: Image Block Extension
 * Description: Add settings to the image block that allow you to register images for mobile devices.
 * Requires at least: 6.3
 * Requires PHP: 7.4
 * Version: 1.0.0
 * Author: Aki Hamano
 * Author URI: https://github.com/t-hamano
 * License: GPL2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: image-block-extension
 * @author Aki Hamano
 * @license GPL-2.0+
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

defined( 'ABSPATH' ) || exit;

function image_block_extension_enqueue_block_editor_assets() {
	$plugin_path = untrailingslashit( plugin_dir_path( __FILE__ ) );
	$plugin_url  = untrailingslashit( plugin_dir_url( __FILE__ ) );
	$asset_file  = include untrailingslashit( plugin_dir_path( __FILE__ ) ) . '/build/index.asset.php';

	wp_enqueue_script(
		'image-block-extension',
		$plugin_url . '/build/index.js',
		$asset_file['dependencies'],
		filemtime( $plugin_path . '/build/index.js' )
	);

	wp_set_script_translations(
		'image-block-extension',
		'image-block-extension',
		$plugin_path . '/languages'
	);

	wp_enqueue_style(
		'image-block-extension',
		$plugin_url . '/build/index.css',
		array(),
		filemtime( $plugin_path . '/build/index.css' )
	);
}
add_action( 'enqueue_block_editor_assets', 'image_block_extension_enqueue_block_editor_assets' );

function image_block_extension_render_block_image( $block_content, $block ) {
	if ( ! isset( $block['attrs']['mobileUrl'] ) || ! isset( $block['attrs']['mobileId'] ) ) {
		return $block_content;
	}

	preg_match( '/<img.*?\/>/', $block_content, $matches );

	if ( ! isset( $matches[0] ) ) {
		return $block_content;
	}

	$image_tag = $matches[0];
	$max_width = isset( $block['attrs']['mobileMaxWidth'] ) ? (int) $block['attrs']['mobileMaxWidth'] : 600;

	$new_image_tag = sprintf(
		'<picture><source srcset="%1$s" media="(max-width: %2$dpx)"/>%3$s</picture>',
		$block['attrs']['mobileUrl'],
		$max_width,
		$image_tag
	);

	$block_content = str_replace( $image_tag, $new_image_tag, $block_content );

	return $block_content;
}

add_filter( 'render_block_core/image', 'image_block_extension_render_block_image', 10, 2 );
