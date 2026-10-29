<?php
/**
 * PHPUnit bootstrap file.
 *
 * @package Enable_Responsive_Image
 */

// `WP_TESTS_DIR` is provided by wp-env and points to the WordPress PHPUnit
// test library matching the installed WordPress version.
$eri_tests_dir = getenv( 'WP_TESTS_DIR' );

if ( ! $eri_tests_dir || ! file_exists( $eri_tests_dir . '/includes/functions.php' ) ) {
	echo 'Could not find the WordPress test library. Run the tests with `npm run test:php`.' . PHP_EOL; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	exit( 1 );
}

define( 'WP_TESTS_PHPUNIT_POLYFILLS_PATH', dirname( __DIR__, 2 ) . '/vendor/yoast/phpunit-polyfills' );

require_once $eri_tests_dir . '/includes/functions.php';

tests_add_filter(
	'muplugins_loaded',
	static function () {
		require dirname( __DIR__, 2 ) . '/enable-responsive-image.php';
	}
);

require $eri_tests_dir . '/includes/bootstrap.php';
