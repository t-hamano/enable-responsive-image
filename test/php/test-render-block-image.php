<?php
/**
 * @package Enable_Responsive_Image
 */

/**
 * Tests for enable_responsive_image_render_block_image().
 */
class Test_Render_Block_Image extends WP_UnitTestCase {

	/**
	 * Image tag used in the block content.
	 */
	const IMAGE_TAG = '<img src="https://example.com/image.jpg" alt=""/>';

	/**
	 * Render the image block content with the given responsive image sources.
	 *
	 * @param array  $sources       Responsive image sources.
	 * @param string $block_content Block content.
	 *
	 * @return string
	 */
	private function render( $sources, $block_content = '<figure class="wp-block-image">' . self::IMAGE_TAG . '</figure>' ) {
		return enable_responsive_image_render_block_image(
			$block_content,
			array(
				'blockName' => 'core/image',
				'attrs'     => array(
					'enableResponsiveImageSources' => $sources,
				),
			)
		);
	}

	/**
	 * Tests that the image is wrapped in a picture element with a source for each image source.
	 */
	public function test_wraps_image_in_picture() {
		$this->assertEqualHTML(
			'<figure class="wp-block-image"><picture><source srcset="https://example.com/mobile.jpg" media="(max-width: 600px)"/><source srcset="https://example.com/desktop.jpg" media="(min-width: 1200px)"/>' . self::IMAGE_TAG . '</picture></figure>',
			$this->render(
				array(
					array(
						'srcset'    => 'https://example.com/mobile.jpg',
						'mediaType' => 'max-width',
					),
					array(
						'srcset'     => 'https://example.com/desktop.jpg',
						'mediaType'  => 'min-width',
						'mediaValue' => 1200,
					),
				)
			)
		);
	}

	/**
	 * Tests that an unsupported media type falls back to `max-width` instead of being output as is.
	 *
	 * @dataProvider data_invalid_media_type
	 *
	 * @param mixed $media_type Media type.
	 */
	public function test_invalid_media_type_falls_back_to_max_width( $media_type ) {
		$this->assertEqualHTML(
			'<figure class="wp-block-image"><picture><source srcset="https://example.com/mobile.jpg" media="(max-width: 600px)"/>' . self::IMAGE_TAG . '</picture></figure>',
			$this->render(
				array(
					array(
						'srcset'    => 'https://example.com/mobile.jpg',
						'mediaType' => $media_type,
					),
				)
			)
		);
	}

	/**
	 * Data provider for test_invalid_media_type_falls_back_to_max_width().
	 *
	 * @return array[] Media types that are not `max-width` or `min-width`.
	 */
	public function data_invalid_media_type() {
		return array(
			'unknown media type' => array( 'min-height' ),
			'empty string'       => array( '' ),
			'attribute breakout' => array( 'max-width: 1px)" onload="alert(1)" data-x="(' ),
			'not a string'       => array( array( 'min-width' ) ),
		);
	}

	/**
	 * Tests that the srcset URL is escaped so that it cannot break out of the attribute.
	 */
	public function test_srcset_is_escaped() {
		$output = $this->render(
			array(
				array(
					'srcset'    => 'https://example.com/mobile.jpg" onerror="alert(1)',
					'mediaType' => 'max-width',
				),
			)
		);

		$this->assertStringContainsString( '<source srcset="' . esc_url( 'https://example.com/mobile.jpg" onerror="alert(1)' ) . '" media="(max-width: 600px)"/>', $output );
		$this->assertStringNotContainsString( 'onerror="', $output );
	}

	/**
	 * Tests that the default breakpoint is used when no breakpoint is set.
	 *
	 * @dataProvider data_empty_media_value
	 *
	 * @param array $source Image source without a valid media value.
	 */
	public function test_empty_media_value_uses_default_media_value( $source ) {
		$this->assertEqualHTML(
			'<figure class="wp-block-image"><picture><source srcset="https://example.com/mobile.jpg" media="(max-width: 600px)"/>' . self::IMAGE_TAG . '</picture></figure>',
			$this->render( array( $source ) )
		);
	}

	/**
	 * Data provider for test_empty_media_value_uses_default_media_value().
	 *
	 * @return array[] Image sources whose media value is missing or empty.
	 */
	public function data_empty_media_value() {
		$source = array(
			'srcset'    => 'https://example.com/mobile.jpg',
			'mediaType' => 'max-width',
		);

		return array(
			'missing' => array( $source ),
			'zero'    => array( array_merge( $source, array( 'mediaValue' => 0 ) ) ),
			'empty'   => array( array_merge( $source, array( 'mediaValue' => '' ) ) ),
		);
	}

	/**
	 * Tests that the `enable_responsive_image_default_media_value` filter changes the default breakpoint,
	 * but not a breakpoint that is set explicitly.
	 */
	public function test_default_media_value_filter_is_applied() {
		$callback = static function () {
			return 1000;
		};

		add_filter( 'enable_responsive_image_default_media_value', $callback );

		$output = $this->render(
			array(
				array(
					'srcset'    => 'https://example.com/mobile.jpg',
					'mediaType' => 'max-width',
				),
				array(
					'srcset'     => 'https://example.com/tablet.jpg',
					'mediaType'  => 'max-width',
					'mediaValue' => 800,
				),
			)
		);

		remove_filter( 'enable_responsive_image_default_media_value', $callback );

		$this->assertEqualHTML(
			'<figure class="wp-block-image"><picture><source srcset="https://example.com/mobile.jpg" media="(max-width: 1000px)"/><source srcset="https://example.com/tablet.jpg" media="(max-width: 800px)"/>' . self::IMAGE_TAG . '</picture></figure>',
			$output
		);
	}

	/**
	 * Tests that image sources without `srcset` or `mediaType` are skipped.
	 */
	public function test_ignores_source_without_required_keys() {
		$this->assertEqualHTML(
			'<figure class="wp-block-image"><picture><source srcset="https://example.com/mobile.jpg" media="(max-width: 600px)"/>' . self::IMAGE_TAG . '</picture></figure>',
			$this->render(
				array(
					array(
						'mediaType' => 'max-width',
					),
					array(
						'srcset' => 'https://example.com/tablet.jpg',
					),
					array(
						'srcset'    => 'https://example.com/mobile.jpg',
						'mediaType' => 'max-width',
					),
				)
			)
		);
	}

	/**
	 * Tests that the block content is returned as is when there is nothing to change.
	 *
	 * @dataProvider data_unchanged_content
	 *
	 * @param array  $block         Parsed block.
	 * @param string $block_content Block content.
	 */
	public function test_returns_content_unchanged( $block, $block_content ) {
		$this->assertSame( $block_content, enable_responsive_image_render_block_image( $block_content, $block ) );
	}

	/**
	 * Data provider for test_returns_content_unchanged().
	 *
	 * @return array[] Blocks that have no valid image sources or no img tag, and their block content.
	 */
	public function data_unchanged_content() {
		$block_content = '<figure class="wp-block-image">' . self::IMAGE_TAG . '</figure>';
		$valid_sources = array(
			array(
				'srcset'    => 'https://example.com/mobile.jpg',
				'mediaType' => 'max-width',
			),
		);

		return array(
			'no attribute'         => array(
				array( 'attrs' => array() ),
				$block_content,
			),
			'attribute not array'  => array(
				array( 'attrs' => array( 'enableResponsiveImageSources' => 'https://example.com/mobile.jpg' ) ),
				$block_content,
			),
			'empty sources'        => array(
				array( 'attrs' => array( 'enableResponsiveImageSources' => array() ) ),
				$block_content,
			),
			'only invalid sources' => array(
				array( 'attrs' => array( 'enableResponsiveImageSources' => array( array( 'srcset' => 'https://example.com/mobile.jpg' ) ) ) ),
				$block_content,
			),
			'no img tag'           => array(
				array( 'attrs' => array( 'enableResponsiveImageSources' => $valid_sources ) ),
				'<figure class="wp-block-image"></figure>',
			),
		);
	}

	/**
	 * Tests that the lightbox button added by core is placed after the picture element, not inside it.
	 */
	public function test_lightbox_button_is_outside_picture() {
		$output = do_blocks(
			'<!-- wp:image {"lightbox":{"enabled":true},"enableResponsiveImageSources":[{"srcset":"https://example.com/mobile.jpg","mediaType":"max-width"}]} -->
<figure class="wp-block-image"><img src="https://example.com/image.jpg" alt=""/></figure>
<!-- /wp:image -->'
		);

		$this->assertMatchesRegularExpression( '/<picture><source [^>]*\/><img [^>]*\/><\/picture>/', $output );
		$this->assertMatchesRegularExpression( '/<\/picture>\s*<button[^>]*>/', $output );
		$this->assertDoesNotMatchRegularExpression( '/<picture>(?:(?!<\/picture>).)*<button/s', $output );
	}
}
