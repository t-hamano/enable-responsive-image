/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { useSelect, useDispatch } from '@wordpress/data';
import { BlockControls, InspectorControls } from '@wordpress/block-editor';
import { seen } from '@wordpress/icons';
import type { BlockEditProps } from '@wordpress/blocks';
import { ToolbarGroup, ToolbarButton } from '@wordpress/components';

/**
 * Internal dependencies
 */
import BlockEditPreview from './block-edit-preview';
import SourceList from './source-list';
import './editor.scss';
import './store';
import type { BlockAttributes } from './types';

const addImageSourceAttributes = ( settings: { [ key: string ]: any } ) => {
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
	'enable-responsive-image/add-image-source-attributes',
	addImageSourceAttributes
);

const withInspectorControl =
	( BlockEdit: React.ComponentType< BlockEditProps< BlockAttributes > > ) =>
	(
		props: BlockEditProps< BlockAttributes > & {
			name: string;
		}
	) => {
		if ( props.name !== 'core/image' ) {
			return <BlockEdit { ...props } />;
		}

		const { attributes } = props;
		const { url, sources } = attributes;

		// @ts-ignore
		const isPreview = useSelect( ( select ) => select( 'enable-responsive-image' ).getIsPreview() );

		const { setIsPreview } = useDispatch( 'enable-responsive-image' );

		return (
			<>
				{ url && sources?.length > 0 && isPreview ? (
					<BlockEditPreview { ...props } />
				) : (
					<BlockEdit { ...props } />
				) }
				{ url && sources?.length > 0 && (
					// @ts-ignore
					<BlockControls group="parent">
						<ToolbarGroup>
							<ToolbarButton
								icon={ seen }
								isPressed={ isPreview }
								label={
									isPreview
										? __( 'Disable responsive image preview', 'enable-responsive-image' )
										: __( 'Enable responsive image preview', 'enable-responsive-image' )
								}
								onClick={ () => setIsPreview( ! isPreview ) }
							/>
						</ToolbarGroup>
					</BlockControls>
				) }
				{ url && (
					<InspectorControls>
						<SourceList { ...props } />
					</InspectorControls>
				) }
			</>
		);
	};

addFilter(
	'editor.BlockEdit',
	'enable-responsive-image/with-inspector-control',
	withInspectorControl
);
