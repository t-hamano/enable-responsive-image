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
	if ( ! isset( $block['attrs']['sources'] ) ) {
		return $block_content;
	}

	if ( ! is_array( $block['attrs']['sources'] ) ) {
		return $block_content;
	}

	$filtered_sources = array_filter(
		$block['attrs']['sources'],
		function ( $source ) {
			return isset( $source['srcset'] ) && isset( $source['mediaType'] ) && isset( $source['mediaValue'] );
		}
	);

	if ( empty( $filtered_sources ) ) {
		return $block_content;
	}

	preg_match( '/<img.*?\/>/', $block_content, $matches );

	if ( ! isset( $matches[0] ) ) {
		return $block_content;
	}

	$image_tag           = $matches[0];
	$allowed_media_types = array( 'min-width', 'max-width' );

	$source_tags = '';

	foreach ( $filtered_sources as $source ) {
		$media_type   = in_array( $source['mediaType'], $allowed_media_types, true ) ? $source['mediaType'] : 'max-width';
		$source_tags .= sprintf(
			'<source srcset="%1$s" media="(%2$s: %3$dpx)"/>',
			esc_url( $source['srcset'] ),
			$source['mediaType'],
			$source['mediaValue'] ? (int) $source['mediaValue'] : 600,
		);
	}

	$new_image_tag = sprintf(
		'<picture>%1$s%2$s</picture>',
		$source_tags,
		$image_tag
	);

	$block_content = str_replace( $image_tag, $new_image_tag, $block_content );

	return $block_content;
}

add_filter( 'render_block_core/image', 'image_block_extension_render_block_image', 10, 2 );
