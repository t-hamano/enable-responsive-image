/**
 * WordPress dependencies
 */
import { addFilter } from '@wordpress/hooks';
import { InspectorControls } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import MobileImageEditor from './mobile-image-editor';
import './editor.scss';

const addMobileImageAttributes = ( settings ) => {
	if ( 'core/image' !== settings.name ) {
		return settings;
	}

	const newSettings = {
		...settings,
		attributes: {
			...settings.attributes,
			mobileUrl: {
				type: 'string',
			},
			mobileId: {
				type: 'number',
			},
			mobileSizeSlug: {
				type: 'string',
			},
			mobileMaxWidth: {
				type: 'number',
			},
		},
	};
	return newSettings;
};

addFilter(
	'blocks.registerBlockType',
	'image-block-extension/add-mobile-image-setting',
	addMobileImageAttributes
);

const withInspectorControl = ( BlockEdit ) => ( props ) => {
	return props.name === 'core/image' ? (
		<>
			<BlockEdit { ...props } />
			<InspectorControls>
				<MobileImageEditor { ...props } />
			</InspectorControls>
		</>
	) : (
		<BlockEdit { ...props } />
	);
};

addFilter( 'editor.BlockEdit', 'core/query', withInspectorControl );
