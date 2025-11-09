/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { useSelect, useDispatch } from '@wordpress/data';
import { BlockControls, InspectorControls } from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton } from '@wordpress/components';
import type { BlockEditProps } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import BlockEditPreview from './block-edit-preview';
import SourceList from './source-list';
import './editor.scss';
import './store';
import { SHOW_PREVIEW_BUTTON } from './constants';
import type { BlockAttributes } from './types';
import { icon } from './icon';

const addSourceAttributes = ( settings: { [ key: string ]: any } ) => {
	if ( 'core/image' !== settings.name ) {
		return settings;
	}

	return {
		...settings,
		attributes: {
			...settings.attributes,
			enableResponsiveImageSources: {
				type: 'array',
				items: {
					type: 'number',
				},
				default: [],
			},
		},
	};
};

addFilter(
	'blocks.registerBlockType',
	'enable-responsive-image/add-source-attributes',
	addSourceAttributes
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
		const { url, enableResponsiveImageSources: sources } = attributes;

		const isPreview = useSelect(
			( select ) =>
				select( 'enable-responsive-image' )
					// @ts-ignore
					.getIsPreview(),
			[]
		);

		const { setIsPreview } = useDispatch( 'enable-responsive-image' );

		return (
			<>
				{ url && sources?.length > 0 && isPreview ? (
					<BlockEditPreview { ...props } />
				) : (
					<BlockEdit { ...props } />
				) }
				{ url && sources?.length > 0 && SHOW_PREVIEW_BUTTON && (
					<BlockControls group="parent">
						<ToolbarGroup>
							<ToolbarButton
								icon={ icon }
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
