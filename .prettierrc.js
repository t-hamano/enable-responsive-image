const config = {
	...require( '@wordpress/prettier-config' ),
	semi: true,
	useTabs: true,
	tabWidth: 2,
	singleQuote: true,
	printWidth: 100,
	bracketSpacing: true,
	parenSpacing: true,
	parser: 'typescript',
	bracketSameLine: false,
};

module.exports = config;
