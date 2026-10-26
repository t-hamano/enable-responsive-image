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
		linterOptions: {
			reportUnusedDisableDirectives: 'error',
		},
		rules: {
			'react/jsx-boolean-value': 'error',
			'react/jsx-curly-brace-presence': [ 'error', { props: 'never', children: 'never' } ],
			'jsdoc/escape-inline-tags': 'error',
			'@wordpress/wp-global-usage': 'error',
			'import/no-extraneous-dependencies': 'off',
			'@wordpress/no-unsafe-wp-apis': 'off',
			'@wordpress/dependency-group': 'error',
			'@wordpress/i18n-text-domain': [
				'error',
				{
					allowedTextDomain: 'enable-responsive-image',
				},
			],
			'@wordpress/use-import-as': [
				'error',
				{
					'@wordpress/block-editor': {
						__experimentalGetBorderClassesAndStyles: 'getBorderClassesAndStyles',
						__experimentalGetShadowClassesAndStyles: 'getShadowClassesAndStyles',
					},
					'@wordpress/components': {
						__experimentalToggleGroupControl: 'ToggleGroupControl',
						__experimentalToggleGroupControlOption: 'ToggleGroupControlOption',
						__experimentalToolsPanel: 'ToolsPanel',
						__experimentalToolsPanelItem: 'ToolsPanelItem',
					},
				},
			],
			'no-nested-ternary': 'off',
		},
	},
	{
		files: [ '**/*.ts', '**/*.tsx' ],
		rules: {
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{
					prefer: 'type-imports',
					disallowTypeAnnotations: false,
				},
			],
			'@typescript-eslint/no-restricted-imports': [
				'error',
				{
					paths: [
						{
							name: 'react',
							message: 'Please use React API through `@wordpress/element` instead.',
							allowTypeImports: true,
						},
					],
				},
			],
		},
	},
	...defaultConfig.configs[ 'test-playwright' ].map( ( config ) => ( {
		...config,
		files: [ 'test/e2e/**/*.ts' ],
		rules: {
			...config.rules,
			'react-hooks/rules-of-hooks': 'off',
		},
	} ) ),
];
