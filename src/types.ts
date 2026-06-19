export interface BlockAttributes {
	enableResponsiveImageSources: Source[];
	[ key: string ]: any;
}

export interface Source {
	srcset?: string;
	id?: number;
	slug?: string;
	mediaType?: string;
	mediaValue?: number;
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
