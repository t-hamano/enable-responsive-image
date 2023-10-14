export interface BlockAttributes {
	sources: Source[];
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
}

declare global {
	interface Window {
		enableResponsiveImage: enableResponsiveImageVars;
	}
}
