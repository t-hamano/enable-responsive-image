/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import {
	Button,
	Notice,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import { MediaUploadCheck } from '@wordpress/block-editor';
import { useViewportMatch } from '@wordpress/compose';
import type { BlockEditProps } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import SourceEditor from './source-editor';
import type { BlockAttributes, Source } from './types';
import { MAX_SOURCES } from './constants';

export default function ImageList( props: BlockEditProps< BlockAttributes > ) {
	const { attributes, setAttributes } = props;
	const { enableResponsiveImageSources: sources } = attributes;

	function onChange( newSource: Source, index: number ) {
		const newSources = [ ...sources ];
		newSources[ index ] = newSource;
		setAttributes( { enableResponsiveImageSources: newSources } );
	}

	function onAddSource() {
		const newSources = [ ...sources ];
		newSources.push( {
			srcset: undefined,
			id: undefined,
			slug: undefined,
			mediaType: undefined,
			mediaValue: undefined,
		} );
		setAttributes( { enableResponsiveImageSources: newSources } );
	}

	function onChangeOrder( direction: number, index: number ) {
		const newSources = [ ...sources ];
		const newIndex = index + direction;
		const movedSource = newSources.splice( index, 1 )[ 0 ];
		newSources.splice( newIndex, 0, movedSource );
		setAttributes( { enableResponsiveImageSources: newSources } );
	}

	function onRemoveSource( index: number ) {
		const newSources = [ ...sources ];
		newSources.splice( index, 1 );
		setAttributes( { enableResponsiveImageSources: newSources } );
	}
	const dropdownMenuProps = ! useViewportMatch( 'medium', '<' )
		? {
				popoverProps: {
					placement: 'left-start',
					offset: 259,
				},
				// TODO: Once the type is fixed upstream, remove this property.
				// See: https://github.com/WordPress/gutenberg/pull/76027
				label: '',
		  }
		: // TODO: Once the type is fixed upstream, remove this property.
		  // See: https://github.com/WordPress/gutenberg/pull/76027
		  { label: '' };

	return (
		<ToolsPanel
			label={ __( 'Image sources', 'enable-responsive-image' ) }
			resetAll={ () => setAttributes( { enableResponsiveImageSources: [] } ) }
			className="enable-responsive-image"
			dropdownMenuProps={ dropdownMenuProps }
		>
			<MediaUploadCheck
				fallback={
					<Notice
						className="enable-responsive-image__notice"
						status="warning"
						isDismissible={ false }
					>
						{ __(
							'To edit the image, you need permission to upload media.',
							'enable-responsive-image'
						) }
					</Notice>
				}
			>
				{ sources.length > 0 &&
					sources.map( ( source, index ) => (
						<ToolsPanelItem
							key={ index }
							hasValue={ () => true }
							isShownByDefault
							label={ sprintf(
								/* translators: %d: Image source number */
								__( 'Image source %d', 'enable-responsive-image' ),
								index + 1
							) }
							onDeselect={ () => onRemoveSource( index ) }
							className="enable-responsive-image__source"
						>
							<fieldset>
								<legend>
									{ sprintf(
										/* translators: %d: Image source number */
										__( 'Image source %d', 'enable-responsive-image' ),
										index + 1
									) }
								</legend>
								<SourceEditor
									{ ...props }
									disableMoveUp={ index === 0 }
									disableMoveDown={ index === sources.length - 1 }
									source={ source }
									onChangeOrder={ ( direction: number ) => onChangeOrder( direction, index ) }
									onChange={ ( newSource: Source ) => onChange( newSource, index ) }
									onRemove={ () => onRemoveSource( index ) }
								/>
								{ index < sources.length - 1 && <hr /> }
							</fieldset>
						</ToolsPanelItem>
					) ) }
				<Button
					variant="primary"
					className="enable-responsive-image__add-source"
					disabled={ sources.length >= MAX_SOURCES }
					onClick={ onAddSource }
					__next40pxDefaultSize
				>
					{ __( 'Add image source', 'enable-responsive-image' ) }
				</Button>
			</MediaUploadCheck>
		</ToolsPanel>
	);
}
