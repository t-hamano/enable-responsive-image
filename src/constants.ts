/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

export const DEFAULT_MEDIA_VALUE = isNaN(
	parseInt( window?.enableResponsiveImage?.defaultMediaValue )
)
	? 600
	: parseInt( window?.enableResponsiveImage?.defaultMediaValue );

export const MEDIA_TYPES = [
	{
		label: __( 'max-width', 'enable-responsive-image' ),
		value: 'max-width',
	},
	{
		label: __( 'min-width', 'enable-responsive-image' ),
		value: 'min-width',
	},
];
