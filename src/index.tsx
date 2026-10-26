/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { useSelect, useDispatch } from '@wordpress/data';
import { BlockControls, InspectorControls } from '@wordpress/block-editor';
import { ToolbarButton } from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import type { BlockEditProps } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import BlockEditPreview from './block-edit-preview';
import SourceList from './source-list';
import './editor.scss';
import { store } from './store';
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

type ResponsiveImageEditProps = BlockEditProps< BlockAttributes > & {
	name: string;
};

function ResponsiveImageEdit( {
	BlockEdit,
	...props
}: ResponsiveImageEditProps & {
	BlockEdit: React.ComponentType< ResponsiveImageEditProps >;
} ) {
	const { attributes } = props;
	const { url, enableResponsiveImageSources: sources } = attributes;

	const isPreview = useSelect( ( select ) => select( store ).getIsPreview(), [] );

	const { setIsPreview } = useDispatch( store );

	return (
		<>
			{ url && sources?.length > 0 && isPreview ? (
				<BlockEditPreview { ...props } />
			) : (
				<BlockEdit { ...props } />
			) }
			{ url && sources?.length > 0 && SHOW_PREVIEW_BUTTON && (
				<BlockControls group="parent">
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
				</BlockControls>
			) }
			{ url && (
				<InspectorControls>
					<SourceList { ...props } />
				</InspectorControls>
			) }
		</>
	);
}

const withInspectorControl = createHigherOrderComponent(
	( BlockEdit: React.ComponentType< ResponsiveImageEditProps > ) =>
		( props: ResponsiveImageEditProps ) => {
			if ( props.name !== 'core/image' ) {
				return <BlockEdit { ...props } />;
			}

			return <ResponsiveImageEdit { ...props } BlockEdit={ BlockEdit } />;
		},
	'withInspectorControl'
);

addFilter(
	'editor.BlockEdit',
	'enable-responsive-image/with-inspector-control',
	withInspectorControl
);
