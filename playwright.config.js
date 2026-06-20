/**
 * WordPress dependencies
 */
const config = require( '@wordpress/scripts/config/playwright.config.js' );

module.exports = {
	...config,
	testDir: './test/e2e',
	webServer: {
		...config.webServer,
		command: 'npm run wp-env-test -- start',
	},
};
