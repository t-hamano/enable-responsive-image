/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	Button,
	RangeControl,
	SelectControl,
	__experimentalHStack as HStack,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { MediaUpload, store as blockEditorStore } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';

const DEFAULT_MEDIA_VALUE = 600;
const MEDIA_TYPES = [
	{
		label: __( 'max-width', 'image-block-extension' ),
		value: 'max-width',
	},
	{
		label: __( 'min-width', 'image-block-extension' ),
		value: 'min-width',
	},
];

export default function SourceEditor( { source = {}, onChange, onRemove, isSelected } ) {
	const { id, srcset, mediaType, mediaValue, slug: srcsetSlug } = source;
	const { image } = useSelect(
		( select ) => {
			const { getMedia } = select( coreStore );
			return {
				image: id && isSelected ? getMedia( id, { context: 'view' } ) : null,
			};
		},
		[ id, isSelected ]
	);
	const imageSizes = useSelect(
		( select ) => select( blockEditorStore ).getSettings().imageSizes,
		[]
	);

	const imageSizeOptions = imageSizes
		.filter( ( { slug } ) => {
			return image?.media_details?.sizes?.[ slug ]?.source_url;
		} )
		.map( ( { name, slug } ) => ( {
			value: slug,
			label: name,
		} ) );

	function onSelectImage( media ) {
		if ( ! media || ! media.url ) {
			onChange( {
				srcset: undefined,
				id: undefined,
				slug: undefined,
				mediaType: undefined,
				mediaValue: undefined,
			} );
		}

		onChange( {
			...source,
			srcset: media.url,
			id: media.id,
			slug: source.slug || 'full',
			mediaType: source.mediaType || MEDIA_TYPES[ 0 ].value,
			mediaValue: source.mediaValue || DEFAULT_MEDIA_VALUE,
		} );
	}

	function onChangeMediaType( value ) {
		onChange( {
			...source,
			mediaType: value,
		} );
	}

	function onChangeMediaValue( value ) {
		onChange( {
			...source,
			mediaValue: value,
		} );
	}

	function onChangeResolution( newSlug ) {
		const newUrl = image?.media_details?.sizes?.[ newSlug ]?.source_url;
		if ( ! newUrl ) {
			return null;
		}

		onChange( {
			...source,
			srcset: newUrl,
			slug: newSlug,
		} );
	}

	return (
		<>
			<MediaUpload
				onSelect={ onSelectImage }
				allowedTypes={ [ 'image' ] }
				render={ ( { open } ) => (
					<div className="image-block-extension__container">
						<Button
							className={
								! id ? 'image-block-extension__toggle' : 'image-block-extension__preview'
							}
							onClick={ open }
						>
							{ !! id && srcset ? (
								<img src={ srcset } alt="" />
							) : (
								__( 'Set image source', 'image-block-extension' )
							) }
						</Button>
						{ !! id && (
							<HStack className="image-block-extension__actions">
								<Button
									className="image-block-extension__action"
									onClick={ open }
									aria-hidden="true"
								>
									{ __( 'Replace', 'image-block-extension' ) }
								</Button>
								<Button className="image-block-extension__action" onClick={ onRemove }>
									{ __( 'Remove', 'image-block-extension' ) }
								</Button>
							</HStack>
						) }
					</div>
				) }
				value={ id }
			/>
			{ !! id && srcset && (
				<>
					<ToggleGroupControl
						__nextHasNoMarginBottom
						isBlock
						label={ __( 'Media query type', 'image-block-extension' ) }
						onChange={ onChangeMediaType }
						value={ mediaType || MEDIA_TYPES[ 0 ].value }
					>
						{ MEDIA_TYPES.map( ( { label, value } ) => (
							<ToggleGroupControlOption key={ value } label={ label } value={ value } />
						) ) }
					</ToggleGroupControl>
					<RangeControl
						label={ __( 'Media query value', 'image-block-extension' ) }
						value={ mediaValue || DEFAULT_MEDIA_VALUE }
						onChange={ onChangeMediaValue }
						min={ 100 }
						max={ 2000 }
						allowReset
						initialPosition={ DEFAULT_MEDIA_VALUE }
					/>
					<SelectControl
						label={ __( 'Resolution', 'image-block-extension' ) }
						value={ srcsetSlug }
						options={ imageSizeOptions }
						onChange={ onChangeResolution }
						help={ __( 'Select the size of the source image.', 'image-block-extension' ) }
						size={ '__unstable-large' }
					/>
				</>
			) }
		</>
	);
}
