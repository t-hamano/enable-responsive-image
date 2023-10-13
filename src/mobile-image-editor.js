/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	Button,
	PanelBody,
	RangeControl,
	SelectControl,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { MediaUpload, MediaUploadCheck, store as blockEditorStore } from '@wordpress/block-editor';
import { useRef } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';

// const { ResolutionTool } = unlock( blockEditorPrivateApis );
const DEFAULT_MOBILE_MAX_WIDTH = 600;

export default function MobileImageEditor( { attributes, setAttributes, isSelected } ) {
	const { mobileUrl, mobileId, mobileSizeSlug, mobileMaxWidth, url } = attributes;

	const toggleRef = useRef();

	const { image } = useSelect(
		( select ) => {
			const { getMedia } = select( coreStore );
			return {
				image: mobileId && isSelected ? getMedia( mobileId, { context: 'view' } ) : null,
			};
		},
		[ mobileId, isSelected ]
	);
	const imageSizes = useSelect(
		( select ) => select( blockEditorStore ).getSettings().imageSizes,
		[]
	);

	if ( ! url ) {
		return null;
	}

	const imageSizeOptions = imageSizes
		.filter( ( { slug } ) => {
			return image?.media_details?.sizes?.[ slug ]?.source_url;
		} )
		.map( ( { name, slug } ) => ( {
			value: slug,
			label: name,
		} ) );

	function onUpdateImage( media ) {
		if ( ! media || ! media.url ) {
			setAttributes( {
				mobileUrl: undefined,
				mobileId: undefined,
				mobileSizeSlug: undefined,
				mobileMaxWidth: undefined,
			} );
		}

		setAttributes( {
			mobileUrl: media.url,
			mobileId: media.id,
			mobileSizeSlug: undefined,
		} );
	}

	function onRemoveImage() {
		setAttributes( {
			...attributes,
			mobileUrl: undefined,
			mobileId: undefined,
			mobileSizeSlug: undefined,
			mobileMaxWidth: undefined,
		} );
	}

	function onChangeMaxWidth( value ) {
		setAttributes( {
			...attributes,
			mobileMaxWidth: value,
		} );
	}

	function onChangeResolution( newSizeSlug ) {
		const newUrl = image?.media_details?.sizes?.[ newSizeSlug ]?.source_url;
		if ( ! newUrl ) {
			return null;
		}

		setAttributes( {
			mobileUrl: newUrl,
			mobileSizeSlug: newSizeSlug,
		} );
	}

	return (
		<PanelBody
			title={ __( 'Mobile Image', 'image-block-extension' ) }
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
					<MediaUpload
						onSelect={ onUpdateImage }
						allowedTypes={ [ 'image' ] }
						render={ ( { open } ) => (
							<div className="image-block-extension__container">
								<Button
									ref={ toggleRef }
									className={
										! mobileId ? 'image-block-extension__toggle' : 'image-block-extension__preview'
									}
									onClick={ open }
								>
									{ !! mobileId && mobileUrl ? (
										<img src={ mobileUrl } alt="" />
									) : (
										__( 'Set mobile image', 'image-block-extension' )
									) }
								</Button>
								{ !! mobileId && (
									<HStack className="image-block-extension__actions">
										<Button
											className="image-block-extension__action"
											onClick={ open }
											// Prefer that screen readers use the .image-block-extension__preview button.
											aria-hidden="true"
										>
											{ __( 'Replace', 'image-block-extension' ) }
										</Button>
										<Button
											className="image-block-extension__action"
											onClick={ () => {
												onRemoveImage();
												toggleRef.current.focus();
											} }
										>
											{ __( 'Remove', 'image-block-extension' ) }
										</Button>
									</HStack>
								) }
							</div>
						) }
						value={ mobileId }
					/>
					{ !! mobileId && mobileUrl && (
						<>
							<RangeControl
								label={ __( 'Max Width (px)', 'image-block-extension' ) }
								value={ mobileMaxWidth || DEFAULT_MOBILE_MAX_WIDTH }
								onChange={ onChangeMaxWidth }
								min={ 100 }
								max={ 2000 }
								allowReset
								initialPosition={ DEFAULT_MOBILE_MAX_WIDTH }
							/>
							<SelectControl
								label={ __( 'Resolution', 'image-block-extension' ) }
								value={ mobileSizeSlug }
								options={ imageSizeOptions }
								onChange={ onChangeResolution }
								help={ __( 'Select the size of the source image.', 'image-block-extension' ) }
								size={ '__unstable-large' }
							/>
						</>
					) }
				</VStack>
			</MediaUploadCheck>
		</PanelBody>
	);
}
