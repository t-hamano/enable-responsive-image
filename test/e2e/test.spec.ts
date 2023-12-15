/**
 * External dependencies
 */
import type { Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { v4 as uuid } from 'uuid';

/**
 * WordPress dependencies
 */
import { test as base, expect } from '@wordpress/e2e-test-utils-playwright';

const test = base.extend< {
	mediaUtils: MediaUtils;
} >( {
	mediaUtils: async ( { page }, use ) => {
		await use( new MediaUtils( { page } ) );
	},
} );

test.describe( 'Image Block', () => {
	test.beforeEach( async ( { admin } ) => {
		await admin.createNewPost();
	} );

	test.afterAll( async ( { requestUtils } ) => {
		await requestUtils.deleteAllMedia();
	} );

	test( 'should create image with image sources', async ( { editor, page, mediaUtils } ) => {
		// Insert Image block.
		await editor.insertBlock( { name: 'core/image' } );
		const imageBlock = editor.canvas.getByRole( 'document', {
			name: 'Block: Image',
		} );
		await expect( imageBlock ).toBeVisible();

		// Upload image.
		await mediaUtils.uploadImage(
			imageBlock.locator( 'data-testid=form-file-upload-input' ),
			'1000x750.png'
		);

		// Add first image source.
		await editor.openDocumentSettingsSidebar();
		const firstSourceFilename = await mediaUtils.uploadSource( '600x450.png' );
		const firstSource = page.getByRole( 'region', { name: 'Editor settings' } ).locator( 'img' );
		await expect( firstSource ).toBeVisible();
		await expect( firstSource ).toHaveAttribute( 'src', new RegExp( firstSourceFilename ) );

		// Change first image setting.
		await mediaUtils.changeMediaQueryValue( '800' );
		await mediaUtils.changeResolution( 'Medium' );

		// Add second image source.
		await page.getByRole( 'button', { name: 'Add image source' } ).click();
		const secondSourceFilename = await mediaUtils.uploadSource( '400x300.png' );
		const secondSource = page
			.getByRole( 'region', { name: 'Editor settings' } )
			.locator( 'img' )
			.nth( 1 );

		await expect( secondSource ).toBeVisible();
		await expect( secondSource ).toHaveAttribute( 'src', new RegExp( secondSourceFilename ) );

		// Chage second image setting.
		await mediaUtils.changeMediaQueryValue( '500', 1 );
		await mediaUtils.changeMediaQueryType( 'min-width', 1 );
		await mediaUtils.changeResolution( 'Thumbnail', 1 );

		const blocks = await editor.getBlocks();

		await expect.poll( editor.getBlocks ).toMatchObject( [
			{
				name: 'core/image',
				attributes: {
					enableResponsiveImageSources: [
						{
							slug: 'medium',
							mediaType: 'max-width',
							mediaValue: 800,
						},
						{
							slug: 'thumbnail',
							mediaType: 'min-width',
							mediaValue: 500,
						},
					],
				},
			},
		] );

		const sources = blocks[ 0 ].attributes.enableResponsiveImageSources;
		expect( sources[ 0 ].srcset.includes( firstSourceFilename ) ).toBe( true );
		expect( sources[ 1 ].srcset.includes( secondSourceFilename ) ).toBe( true );
	} );
} );

class MediaUtils {
	page: Page;
	basePath: string;

	constructor( { page } ) {
		this.page = page;
		this.basePath = path.join( __dirname, 'assets' );
	}

	async uploadImage( inputElement, customFile ) {
		const tmpDirectory = await fs.mkdtempSync( path.join( os.tmpdir(), 'test-image-' ) );
		const filename = uuid();
		const tmpFileName = path.join( tmpDirectory, filename + '.png' );
		const filepath = path.join( this.basePath, customFile );
		await fs.copyFileSync( filepath, tmpFileName );
		await inputElement.setInputFiles( tmpFileName );
		return filename;
	}

	async uploadSource( customFile ) {
		await this.page.getByRole( 'button', { name: 'Set image source' } ).click();
		const filename = await this.uploadImage(
			this.page.locator( '.media-modal .moxie-shim input[type=file]' ),
			customFile
		);
		await this.page
			.getByRole( 'dialog' )
			.getByRole( 'button', { name: 'Select', exact: true } )
			.click();
		return filename;
	}

	async changeMediaQueryType( option, index = 0 ) {
		const blockSettings = this.page.getByRole( 'region', {
			name: 'Editor settings',
		} );
		await blockSettings
			.getByRole( 'radiogroup', { name: 'Media query type' } )
			.nth( index )
			.getByRole( 'radio', { name: option } )
			.setChecked( true );
	}

	async changeMediaQueryValue( value, index = 0 ) {
		const blockSettings = this.page.getByRole( 'region', {
			name: 'Editor settings',
		} );
		await blockSettings
			.getByRole( 'spinbutton', { name: 'Media query value' } )
			.nth( index )
			.fill( value );
	}

	async changeResolution( option, index = 0 ) {
		const blockSettings = this.page.getByRole( 'region', {
			name: 'Editor settings',
		} );
		await blockSettings.getByRole( 'combobox', { name: 'Resolution' } ).nth( index ).selectOption( {
			label: option,
		} );
	}
}
