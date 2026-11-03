/**
 * WordPress dependencies
 */
import { _x } from '@wordpress/i18n';

export const DEFAULT_MEDIA_VALUE = window.enableResponsiveImage.defaultMediaValue;

export const SHOW_PREVIEW_BUTTON = window.enableResponsiveImage.showPreviewButton;

export const MEDIA_TYPES = [
	{
		label: _x( 'max-width', 'CSS media feature', 'enable-responsive-image' ),
		value: 'max-width',
	},
	{
		label: _x( 'min-width', 'CSS media feature', 'enable-responsive-image' ),
		value: 'min-width',
	},
];

export const MAX_SOURCES = 5;
export const MIN_MEDIA_VALUE = 100;
export const MAX_MEDIA_VALUE = 2000;
