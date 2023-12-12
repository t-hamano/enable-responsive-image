/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	RichText,
	useBlockProps,
	// @ts-ignore: has no exported member
	__experimentalGetElementClassName,
	// @ts-ignore: has no exported member
	__experimentalGetBorderClassesAndStyles as getBorderClassesAndStyles,
} from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import type { BlockEditProps } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import type { BlockAttributes } from './types';

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
		enableResponsiveImageSources: sources,
	} = attributes;

	const borderProps = getBorderClassesAndStyles( attributes );

	const filteredSources = sources.filter( ( { srcset, mediaType, mediaValue } ) => {
		return srcset && mediaType && mediaValue;
	} );

	const classes = classnames( {
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
				{ filteredSources.length > 0 &&
					filteredSources.map( ( { srcset, mediaType, mediaValue }, index ) => (
						<source
							key={ index }
							srcSet={ srcset }
							media={ `(${ mediaType }: ${ mediaValue }px)` }
						/>
					) ) }
				<img
					src={ url }
					className={ borderProps.className || undefined }
					style={ {
						...borderProps.style,
						aspectRatio,
						objectFit: scale,
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
