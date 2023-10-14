/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Fragment } from '@wordpress/element';
import {
	Button,
	PanelBody,
	// @ts-ignore: has no exported member
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { MediaUploadCheck } from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import SourceEditor from './source-editor';
import type { BlockAttributes, Source } from './types';

export default function ImageList( props: BlockEditProps< BlockAttributes > ) {
	const { attributes, setAttributes } = props;
	const { sources, url } = attributes;

	function onChange( newSource: Source, index: number ) {
		const newSources = [ ...sources ];
		newSources[ index ] = newSource;
		setAttributes( { sources: newSources } );
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
		setAttributes( { sources: newSources } );
	}

	function onChangeOrder( direction: number, index: number ) {
		const newSources = [ ...sources ];
		const newIndex = index + direction;
		const movedSource = newSources.splice( index, 1 )[ 0 ];
		newSources.splice( newIndex, 0, movedSource );
		setAttributes( { sources: newSources } );
	}

	function onRemoveSource( index: number ) {
		const newSources = [ ...sources ];
		newSources.splice( index, 1 );
		setAttributes( { sources: newSources } );
	}

	if ( ! url ) {
		return null;
	}

	return (
		<PanelBody
			title={ __( 'Image sources', 'enable-responsive-image' ) }
			className="enable-responsive-image"
		>
			<MediaUploadCheck
				fallback={
					<p>
						{ __(
							'To edit the image, you need permission to upload media.',
							'enable-responsive-image'
						) }
					</p>
				}
			>
				<VStack>
					{ sources.length > 0 ? (
						<>
							{ sources.map( ( source, index ) => (
								<Fragment key={ index }>
									<SourceEditor
										{ ...props }
										disableMoveUp={ index === 0 }
										disableMoveDown={ index === sources.length - 1 }
										source={ source }
										onChangeOrder={ ( direction ) => onChangeOrder( direction, index ) }
										onChange={ ( newSource ) => onChange( newSource, index ) }
										onRemove={ () => onRemoveSource( index ) }
									/>
									<hr />
								</Fragment>
							) ) }
							<Button
								variant="primary"
								className="enable-responsive-image__add-source"
								onClick={ onAddSource }
							>
								{ __( 'Add image source', 'enable-responsive-image' ) }
							</Button>
						</>
					) : (
						<SourceEditor
							{ ...props }
							onChange={ ( newSource ) => onChange( newSource, 0 ) }
							onRemove={ () => onRemoveSource( 0 ) }
						/>
					) }
				</VStack>
			</MediaUploadCheck>
		</PanelBody>
	);
}
