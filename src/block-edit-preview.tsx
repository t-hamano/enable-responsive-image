/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import {
	RichText,
	useBlockProps,
	// @ts-expect-error Not exported in the type definitions.
	__experimentalGetElementClassName,
	// @ts-expect-error Not exported in the type definitions.
	__experimentalGetBorderClassesAndStyles as getBorderClassesAndStyles,
	// @ts-expect-error Not exported in the type definitions.
	__experimentalGetShadowClassesAndStyles as getShadowClassesAndStyles,
} from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { DEFAULT_MEDIA_VALUE } from './constants';
import type { BlockAttributes } from './types';

function mediaPosition( { x, y } = { x: 0.5, y: 0.5 } ) {
	return `${ Math.round( x * 100 ) }% ${ Math.round( y * 100 ) }%`;
}

export default function BlockEditPreview( { attributes }: BlockEditProps< BlockAttributes > ) {
	const {
		url,
		alt,
		caption,
		align,
		width,
		height,
		aspectRatio,
		scale,
		focalPoint,
		enableResponsiveImageSources: sources,
	} = attributes;

	const borderProps = getBorderClassesAndStyles( attributes );
	const shadowProps = getShadowClassesAndStyles( attributes );

	const filteredSources = sources.filter( ( { srcset, mediaType } ) => {
		return srcset && mediaType;
	} );

	const classes = clsx( {
		[ `align${ align }` ]: align,
		'has-custom-border':
			!! borderProps.className ||
			( borderProps.style && Object.keys( borderProps.style ).length > 0 ),
	} );

	const blockProps = useBlockProps( {
		className: classes,
	} );

	return (
		<figure { ...blockProps }>
			<picture>
				{ filteredSources.map( ( { srcset, mediaType, mediaValue }, index ) => (
					<source
						key={ index }
						srcSet={ srcset }
						media={ `(${ mediaType }: ${ mediaValue || DEFAULT_MEDIA_VALUE }px)` }
					/>
				) ) }
				<img
					src={ url }
					className={ borderProps.className || undefined }
					style={ {
						...borderProps.style,
						...shadowProps.style,
						aspectRatio,
						objectFit: scale,
						objectPosition: focalPoint && scale ? mediaPosition( focalPoint ) : undefined,
						width,
						height,
					} }
					alt={ alt }
				/>
			</picture>
			{ ! RichText.isEmpty( caption ) && (
				<RichText.Content
					className={ __experimentalGetElementClassName( 'caption' ) }
					tagName="figcaption"
					value={ caption }
				/>
			) }
		</figure>
	);
}
