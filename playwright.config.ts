const config = require( '@wordpress/scripts/config/playwright.config.js' );
const { fileURLToPath } = require( 'url' );

export default {
	...config,
	testDir: './test/e2e',
};
