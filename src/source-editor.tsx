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
import { chevronUp, chevronDown } from '@wordpress/icons';
import type { Media, Source } from './types';

const DEFAULT_MEDIA_VALUE = isNaN( parseInt( window?.enableResponsiveImage?.defaultMediaValue ) )
	? 600
	: parseInt( window?.enableResponsiveImage?.defaultMediaValue );

const MEDIA_TYPES = [
	{
		label: __( 'max-width', 'enable-responsive-image' ),
		value: 'max-width',
	},
	{
		label: __( 'min-width', 'enable-responsive-image' ),
		value: 'min-width',
	},
];

type Props = {
	source?: Source;
	disableMoveUp?: boolean;
	disableMoveDown?: boolean;
	onChange: ( {}: Source ) => void;
	onRemove: () => void;
	onChangeOrder?: ( direction: number ) => void;
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
	disableMoveUp = true,
	disableMoveDown = true,
	onChangeOrder,
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
					<div className="enable-responsive-image__container">
						<Button
							className={
								! id ? 'enable-responsive-image__toggle' : 'enable-responsive-image__preview'
							}
							onClick={ open }
						>
							{ !! id && srcset ? (
								<img src={ srcset } alt="" />
							) : (
								__( 'Set image source', 'enable-responsive-image' )
							) }
						</Button>
						<HStack className="enable-responsive-image__movers" justify="flex-end">
							<Button
								className="enable-responsive-image__mover"
								aria-label={ __( 'Move up', 'enable-responsive-image' ) }
								icon={ chevronUp }
								size="small"
								disabled={ disableMoveUp }
								onClick={ () => onChangeOrder?.( -1 ) }
							/>
							<Button
								className="enable-responsive-image__mover"
								aria-label={ __( 'Move up', 'enable-responsive-image' ) }
								icon={ chevronDown }
								size="small"
								disabled={ disableMoveDown }
								onClick={ () => onChangeOrder?.( 1 ) }
							/>
						</HStack>
						{ !! id && (
							<HStack className="enable-responsive-image__actions">
								<Button
									className="enable-responsive-image__action"
									onClick={ open }
									aria-hidden="true"
								>
									{ __( 'Replace', 'enable-responsive-image' ) }
								</Button>
								<Button className="enable-responsive-image__action" onClick={ onRemove }>
									{ __( 'Remove', 'enable-responsive-image' ) }
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
						label={ __( 'Media query type', 'enable-responsive-image' ) }
						onChange={ onChangeMediaType }
						value={ mediaType || MEDIA_TYPES[ 0 ].value }
					>
						{ MEDIA_TYPES.map( ( { label, value } ) => (
							<ToggleGroupControlOption key={ value } label={ label } value={ value } />
						) ) }
					</ToggleGroupControl>
					<RangeControl
						label={ __( 'Media query value', 'enable-responsive-image' ) }
						value={ mediaValue || DEFAULT_MEDIA_VALUE }
						onChange={ onChangeMediaValue }
						min={ 100 }
						max={ 2000 }
						allowReset
						initialPosition={ DEFAULT_MEDIA_VALUE }
					/>
					<SelectControl
						label={ __( 'Resolution', 'enable-responsive-image' ) }
						value={ srcsetSlug }
						options={ imageSizeOptions }
						onChange={ onChangeResolution }
						help={ __( 'Select the size of the source image.', 'enable-responsive-image' ) }
						// @ts-ignore
						size={ '__unstable-large' }
					/>
				</>
			) }
		</>
	);
}
