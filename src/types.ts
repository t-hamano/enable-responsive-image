export interface BlockAttributes {
	enableResponsiveImageSources: Source[];
	[ key: string ]: any;
}

export interface Source {
	srcset: string | undefined;
	id: number | undefined;
	slug: string | undefined;
	mediaType: string | undefined;
	mediaValue: number | undefined;
}

export interface Media {
	id: number | undefined;
	[ key: string ]: any;
}

export interface enableResponsiveImageVars {
	defaultMediaValue: string;
	showPreviewButton: string;
}

declare global {
	interface Window {
		enableResponsiveImage: enableResponsiveImageVars;
	}
}
