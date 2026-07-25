/**
 * WordPress dependencies
 */
import { useRef } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import {
	Button,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import { Notice } from '@wordpress/ui';
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

	const toggleRefs = useRef< ( HTMLButtonElement | null )[] >( [] );
	const moveUpRefs = useRef< ( HTMLButtonElement | null )[] >( [] );
	const moveDownRefs = useRef< ( HTMLButtonElement | null )[] >( [] );
	const addSourceRef = useRef< HTMLButtonElement | null >( null );

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

		// Move focus to the mover button at the new position so it follows the
		// moved source, after the reorder has rendered.
		window.requestAnimationFrame( () => {
			const refs = direction < 0 ? moveUpRefs : moveDownRefs;
			refs.current[ newIndex ]?.focus();
		} );
	}

	function onRemoveSource( index: number, shouldFocus = false ) {
		const newSources = [ ...sources ];
		newSources.splice( index, 1 );
		setAttributes( { enableResponsiveImageSources: newSources } );

		if ( ! shouldFocus ) {
			return;
		}

		// Move focus to the previous source, falling back to the next one, or to
		// the add button when no source is left, after the removal has rendered.
		window.requestAnimationFrame( () => {
			if ( newSources.length === 0 ) {
				addSourceRef.current?.focus();
				return;
			}
			toggleRefs.current[ index > 0 ? index - 1 : 0 ]?.focus();
		} );
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
					<Notice.Root className="enable-responsive-image__notice" intent="warning">
						<Notice.Description>
							{ __(
								'To edit the image, you need permission to upload media.',
								'enable-responsive-image'
							) }
						</Notice.Description>
					</Notice.Root>
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
									index={ index }
									disableMoveUp={ index === 0 }
									disableMoveDown={ index === sources.length - 1 }
									toggleRef={ ( el ) => {
										toggleRefs.current[ index ] = el;
									} }
									moveUpRef={ ( el ) => {
										moveUpRefs.current[ index ] = el;
									} }
									moveDownRef={ ( el ) => {
										moveDownRefs.current[ index ] = el;
									} }
									source={ source }
									onChangeOrder={ ( direction ) => onChangeOrder( direction, index ) }
									onChange={ ( newSource ) => onChange( newSource, index ) }
									onRemove={ () => onRemoveSource( index, true ) }
								/>
								{ index < sources.length - 1 && <hr /> }
							</fieldset>
						</ToolsPanelItem>
					) ) }
				<Button
					ref={ addSourceRef }
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
