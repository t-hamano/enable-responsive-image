const config = require( '@wordpress/scripts/config/playwright.config.js' );
const { fileURLToPath } = require( 'url' );

export default {
	...config,
	globalSetup: fileURLToPath( new URL( './test/e2e/global-setup.ts', 'file:' + __filename ).href ),
	testDir: './test/e2e',
};
