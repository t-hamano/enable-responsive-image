/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	Button,
	DropZone,
	ExternalLink,
	RangeControl,
	Spinner,
	SelectControl,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';

import { MediaUpload, store as blockEditorStore } from '@wordpress/block-editor';
import { useDispatch, useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { store as noticesStore } from '@wordpress/notices';
import { chevronUp, chevronDown } from '@wordpress/icons';
import { isBlobURL } from '@wordpress/blob';

/**
 * Internal dependencies
 */
import type { Media, Source } from './types';
import { DEFAULT_MEDIA_VALUE, MEDIA_TYPES, MIN_MEDIA_VALUE, MAX_MEDIA_VALUE } from './constants';

type Props = {
	source?: Source;
	disableMoveUp: boolean;
	disableMoveDown: boolean;
	disableActions?: boolean;
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
	disableMoveUp = false,
	disableMoveDown = false,
	disableActions = false,
	onChangeOrder,
	onChange,
	onRemove,
	isSelected,
}: Props ) {
	const { id, srcset, mediaType, mediaValue, slug: srcsetSlug } = source;
	const image = useSelect(
		( select ) => {
			if ( ! id || ! isSelected ) {
				return null;
			}
			return (
				select( coreStore )
					// @ts-ignore
					.getEntityRecord( 'postType', 'attachment', id )
			);
		},
		[ id, isSelected ]
	);

	const { mediaUpload, imageSizes } = useSelect(
		( select ) => ( {
			imageSizes: select( blockEditorStore )
				// @ts-ignore
				.getSettings().imageSizes,
			mediaUpload: select( blockEditorStore )
				// @ts-ignore
				.getSettings().mediaUpload,
		} ),
		[]
	);

	const { createErrorNotice, removeAllNotices } = useDispatch( noticesStore );

	const [ isLoading, setIsLoading ] = useState( false );

	const imageSizeOptions = imageSizes
		.filter( ( { slug }: { slug: string } ) => {
			return image?.media_details?.sizes?.[ slug ]?.source_url;
		} )
		.map( ( { name, slug }: { name: string; slug: string } ) => ( {
			value: slug,
			label: name,
		} ) );

	function onSelectImage( media: Media ) {
		if ( ! media ) {
			return;
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

	function onDropFiles( filesList: File[] ) {
		mediaUpload( {
			allowedTypes: [ 'image' ],
			filesList,
			onFileChange( [ newImage ]: Media[] ) {
				if ( isBlobURL( newImage?.url ) ) {
					setIsLoading( true );
					return;
				}
				onSelectImage( newImage );
				setIsLoading( false );
			},
			onError( message: string ) {
				// @ts-ignore
				removeAllNotices();
				// @ts-ignore
				createErrorNotice( message, { type: 'snackbar' } );
			},
		} );
	}

	return (
		<VStack spacing={ 4 }>
			<VStack spacing={ 2 }>
				<MediaUpload
					onSelect={ onSelectImage }
					allowedTypes={ [ 'image' ] }
					value={ id }
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
								) : isLoading ? (
									<Spinner />
								) : (
									__( 'Set image source', 'enable-responsive-image' )
								) }
							</Button>
							<HStack className="enable-responsive-image__movers" expanded={ false }>
								{ ! ( disableMoveUp && disableMoveDown ) && (
									<>
										<Button
											className="enable-responsive-image__mover"
											label={ __( 'Move up', 'enable-responsive-image' ) }
											icon={ chevronUp }
											size="small"
											disabled={ disableMoveUp }
											onClick={ () => onChangeOrder?.( -1 ) }
										/>
										<Button
											className="enable-responsive-image__mover"
											label={ __( 'Move down', 'enable-responsive-image' ) }
											icon={ chevronDown }
											size="small"
											disabled={ disableMoveDown }
											onClick={ () => onChangeOrder?.( 1 ) }
										/>
									</>
								) }
							</HStack>
							{ ! disableActions && (
								<HStack className="enable-responsive-image__actions">
									<Button
										className="enable-responsive-image__action"
										onClick={ open }
										aria-hidden="true"
										size="compact"
									>
										{ !! id
											? __( 'Replace', 'enable-responsive-image' )
											: __( 'Select', 'enable-responsive-image' ) }
									</Button>
									<Button
										className="enable-responsive-image__action"
										onClick={ onRemove }
										size="compact"
									>
										{ __( 'Remove', 'enable-responsive-image' ) }
									</Button>
								</HStack>
							) }
							<DropZone onFilesDrop={ onDropFiles } />
						</div>
					) }
				/>
				{ !! id && srcset && (
					<ExternalLink className="enable-responsive-image__url" href={ srcset }>
						{ srcset }
					</ExternalLink>
				) }
			</VStack>
			{ !! id && srcset && (
				<>
					<ToggleGroupControl
						__nextHasNoMarginBottom
						isBlock
						label={ __( 'Media query type', 'enable-responsive-image' ) }
						onChange={ onChangeMediaType }
						value={ mediaType || MEDIA_TYPES[ 0 ].value }
						size="__unstable-large"
					>
						{ MEDIA_TYPES.map( ( { label, value } ) => (
							<ToggleGroupControlOption key={ value } label={ label } value={ value } />
						) ) }
					</ToggleGroupControl>
					<RangeControl
						__nextHasNoMarginBottom
						label={ __( 'Media query value (px)', 'enable-responsive-image' ) }
						value={ mediaValue || DEFAULT_MEDIA_VALUE }
						onChange={ onChangeMediaValue }
						min={ MIN_MEDIA_VALUE }
						max={ MAX_MEDIA_VALUE }
						allowReset
						initialPosition={ DEFAULT_MEDIA_VALUE }
						__next40pxDefaultSize
					/>
					<SelectControl
						__nextHasNoMarginBottom
						label={ __( 'Resolution', 'enable-responsive-image' ) }
						value={ srcsetSlug }
						options={ imageSizeOptions }
						onChange={ onChangeResolution }
						help={ __( 'Select the size of the source image.', 'enable-responsive-image' ) }
						size="__unstable-large"
					/>
				</>
			) }
		</VStack>
	);
}
