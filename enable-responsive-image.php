<?php
/**
 * Plugin Name: Enable Responsive Image
 * Description: Adds settings to the Image block to display different images depending on the width of the screen.
 * Requires at least: 6.8
 * Requires PHP: 8.0
 * Version: 1.5.0
 * Author: Aki Hamano
 * Author URI: https://github.com/t-hamano
 * License: GPL2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: enable-responsive-image
 * @author Aki Hamano
 * @license GPL-2.0+
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function enable_responsive_image_enqueue_block_editor_assets() {
	$plugin_path = untrailingslashit( plugin_dir_path( __FILE__ ) );
	$plugin_url  = untrailingslashit( plugin_dir_url( __FILE__ ) );
	$asset_file  = include untrailingslashit( plugin_dir_path( __FILE__ ) ) . '/build/index.asset.php';

	wp_enqueue_script(
		'enable-responsive-image',
		$plugin_url . '/build/index.js',
		$asset_file['dependencies'],
		filemtime( $plugin_path . '/build/index.js' )
	);

	wp_localize_script(
		'enable-responsive-image',
		'enableResponsiveImage',
		array(
			'defaultMediaValue' => (int) apply_filters( 'enable_responsive_image_default_media_value', 600 ),
			'showPreviewButton' => (bool) apply_filters( 'enable_responsive_image_show_preview_button', true ),
		)
	);

	wp_set_script_translations(
		'enable-responsive-image',
		'enable-responsive-image',
	);

	wp_enqueue_style(
		'enable-responsive-image',
		$plugin_url . '/build/index.css',
		array(),
		filemtime( $plugin_path . '/build/index.css' )
	);
}

add_action( 'enqueue_block_editor_assets', 'enable_responsive_image_enqueue_block_editor_assets' );

function enable_responsive_image_render_block_image( $block_content, $block ) {
	if ( ! isset( $block['attrs']['enableResponsiveImageSources'] ) ) {
		return $block_content;
	}

	if ( ! is_array( $block['attrs']['enableResponsiveImageSources'] ) ) {
		return $block_content;
	}

	$filtered_sources = array_filter(
		$block['attrs']['enableResponsiveImageSources'],
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

	/**
	 * Filters the default media value (px).
	 *
	 * @since 1.0.0
	 *
	 * @param int $media_value The media value (px). Default is 600.
	 */
	$default_media_value = (int) apply_filters( 'enable_responsive_image_default_media_value', 600 );

	$source_tags = '';

	foreach ( $filtered_sources as $source ) {
		$media_type   = in_array( $source['mediaType'], $allowed_media_types, true ) ? $source['mediaType'] : 'max-width';
		$source_tags .= sprintf(
			'<source srcset="%1$s" media="(%2$s: %3$dpx)"/>',
			esc_url( $source['srcset'] ),
			$source['mediaType'],
			$source['mediaValue'] ? (int) $source['mediaValue'] : $default_media_value,
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

// The image block has the same hook with priority 10 and
// adds a button element for the Lightbox after the img tag.
// This hook must be run after so that this button element is
// not wrapped in a picture tag.
add_filter( 'render_block_core/image', 'enable_responsive_image_render_block_image', 20, 2 );
