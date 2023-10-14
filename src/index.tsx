/**
 * WordPress dependencies
 */
import { addFilter } from '@wordpress/hooks';
import { InspectorControls } from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import SourceList from './source-list';
import './editor.scss';
import type { BlockAttributes } from './types';

const addMobileImageAttributes = ( settings: { [ key: string ]: any } ) => {
	if ( 'core/image' !== settings.name ) {
		return settings;
	}

	const newSettings = {
		...settings,
		attributes: {
			...settings.attributes,
			sources: {
				type: 'array',
				items: {
					type: 'number',
				},
				default: [],
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

const withInspectorControl =
	( BlockEdit: React.ComponentType< BlockEditProps< BlockAttributes > > ) =>
	(
		props: BlockEditProps< BlockAttributes > & {
			name: string;
		}
	) => {
		return props.name === 'core/image' ? (
			<>
				<BlockEdit { ...props } />
				<InspectorControls>
					<SourceList { ...props } />
				</InspectorControls>
			</>
		) : (
			<BlockEdit { ...props } />
		);
	};

addFilter(
	'editor.BlockEdit',
	'image-block-extension/with-inspector-control',
	withInspectorControl
);
