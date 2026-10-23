/**
 * External dependencies
 */
const { devices } = require( '@playwright/test' );

/**
 * WordPress dependencies
 */
const config = require( '@wordpress/scripts/config/playwright.config.js' );

module.exports = {
	...config,
	testDir: './test/e2e',
	// Snapshots are serialized block markup, which does not depend on the browser.
	snapshotPathTemplate: '{testDir}/{testFileDir}/__snapshots__/{arg}{ext}',
	webServer: {
		...config.webServer,
		command: 'npm run wp-env-test -- start',
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices[ 'Desktop Chrome' ] },
		},
		{
			name: 'firefox',
			use: { ...devices[ 'Desktop Firefox' ] },
		},
		{
			name: 'webkit',
			use: { ...devices[ 'Desktop Safari' ] },
		},
	],
};
