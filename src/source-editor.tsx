/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	Button,
	RangeControl,
	SelectControl,
	// @ts-ignore: has no exported member
	__experimentalHStack as HStack,
	// @ts-ignore: has no exported member
	__experimentalToggleGroupControl as ToggleGroupControl,
	// @ts-ignore: has no exported member
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { MediaUpload, store as blockEditorStore } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import type { Media, Source } from './types';

const DEFAULT_MEDIA_VALUE = isNaN( parseInt( window?.imageBlockExtension?.defaultMediaValue ) )
	? 600
	: parseInt( window?.imageBlockExtension?.defaultMediaValue );

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

type Props = {
	source?: Source;
	onChange: ( {}: Source ) => void;
	onRemove: () => void;
	isSelected: boolean;
};

export default function SourceEditor( {
	source = {
		srcset: undefined,
		id: undefined,
		slug: undefined,
		mediaType: undefined,
		mediaValue: undefined,
	},
	onChange,
	onRemove,
	isSelected,
}: Props ) {
	const { id, srcset, mediaType, mediaValue, slug: srcsetSlug } = source;
	const { image } = useSelect(
		( select ) => {
			const {
				// @ts-ignore
				getMedia,
			} = select( coreStore );
			return {
				image: id && isSelected ? getMedia( id, { context: 'view' } ) : null,
			};
		},
		[ id, isSelected ]
	);
	const imageSizes = useSelect(
		( select ) =>
			select( blockEditorStore )
				// @ts-ignore
				.getSettings().imageSizes,
		[]
	);

	const imageSizeOptions = imageSizes
		.filter( ( { slug }: { slug: string } ) => {
			return image?.media_details?.sizes?.[ slug ]?.source_url;
		} )
		.map( ( { name, slug }: { name: string; slug: string } ) => ( {
			value: slug,
			label: name,
		} ) );

	function onSelectImage( media: Media ) {
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

	function onChangeMediaType( value: string | number | undefined ) {
		const filteredMediaType = MEDIA_TYPES.find( ( type ) => type.value === value );
		if ( ! filteredMediaType ) {
			return;
		}
		onChange( {
			...source,
			mediaType: filteredMediaType.value,
		} );
	}

	function onChangeMediaValue( value: number | undefined ) {
		onChange( {
			...source,
			mediaValue: value,
		} );
	}

	function onChangeResolution( newSlug: string ) {
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
						// @ts-ignore
						size={ '__unstable-large' }
					/>
				</>
			) }
		</>
	);
}
