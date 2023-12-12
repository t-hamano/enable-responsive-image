/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

export const DEFAULT_MEDIA_VALUE = isNaN(
	parseInt( window?.enableResponsiveImage?.defaultMediaValue )
)
	? 600
	: parseInt( window?.enableResponsiveImage?.defaultMediaValue );

export const SHOW_PREVIEW_BUTTON = window?.enableResponsiveImage?.showPreviewButton === '1';

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

export const MAX_SOURCES = 5;
export const MIN_MEDIA_VALUE = 100;
export const MAX_MEDIA_VALUE = 2000;
