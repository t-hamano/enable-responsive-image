/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

export const DEFAULT_MEDIA_VALUE = Number.isInteger(
	window?.enableResponsiveImage?.defaultMediaValue
)
	? window.enableResponsiveImage.defaultMediaValue
	: 600;

export const SHOW_PREVIEW_BUTTON = window?.enableResponsiveImage?.showPreviewButton === true;

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
