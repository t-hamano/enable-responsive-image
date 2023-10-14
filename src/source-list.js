/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Fragment } from '@wordpress/element';
import { Button, PanelBody, __experimentalVStack as VStack } from '@wordpress/components';
import { MediaUploadCheck } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import SourceEditor from './source-editor';

export default function ImageList( props ) {
	const { attributes, setAttributes } = props;
	const { sources, url } = attributes;

	function onChange( newSource, index ) {
		const newSources = [ ...sources ];
		newSources[ index ] = newSource;
		setAttributes( { sources: newSources } );
	}

	function onAddSource() {
		const newSources = [ ...sources ];
		newSources.push( {} );
		setAttributes( { sources: newSources } );
	}

	function onRemoveSource( index ) {
		const newSources = [ ...sources ];
		newSources.splice( index, 1 );
		setAttributes( { sources: newSources } );
	}

	if ( ! url ) {
		return null;
	}

	return (
		<PanelBody
			title={ __( 'Image sources', 'image-block-extension' ) }
			className="image-block-extension"
		>
			<MediaUploadCheck
				fallback={ () => (
					<p>
						{ __(
							'To edit the image, you need permission to upload media.',
							'image-block-extension'
						) }
					</p>
				) }
			>
				<VStack>
					{ sources.length > 0 ? (
						<>
							{ sources.map( ( source, index ) => (
								<Fragment key={ index }>
									<SourceEditor
										{ ...props }
										source={ source }
										onChange={ ( newSource ) => onChange( newSource, index ) }
										onRemove={ () => onRemoveSource( index ) }
									/>
									<hr />
								</Fragment>
							) ) }
							<Button
								variant="primary"
								className="image-block-extension__add-source"
								onClick={ onAddSource }
							>
								{ __( 'Add image source', 'image-block-extension' ) }
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
