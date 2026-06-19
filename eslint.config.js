/**
 * WordPress dependencies
 */
const defaultConfig = require( '@wordpress/eslint-plugin' );

module.exports = [
	{
		ignores: [ '**/node_modules/**', '**/vendor/**', '**/build/**' ],
	},
	...defaultConfig.configs.recommended,
	{
		rules: {
			'react/jsx-boolean-value': 'error',
			'react/jsx-curly-brace-presence': [ 'error', { props: 'never', children: 'never' } ],
			'import/no-extraneous-dependencies': 'off',
			'import/no-unresolved': 'off',
			'@wordpress/no-unsafe-wp-apis': 'off',
			'@wordpress/dependency-group': 'error',
			'@wordpress/i18n-text-domain': [
				'error',
				{
					allowedTextDomain: 'enable-responsive-image',
				},
			],
			'no-nested-ternary': 'off',
			'prettier/prettier': [
				'error',
				{
					useTabs: true,
					tabWidth: 2,
					singleQuote: true,
					printWidth: 100,
					bracketSpacing: true,
					parenSpacing: true,
					bracketSameLine: false,
				},
			],
		},
	},
	{
		files: [ 'test/**' ],
		rules: {
			'react-hooks/rules-of-hooks': 'off',
		},
	},
];
