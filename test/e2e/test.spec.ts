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

test.describe( 'Block', () => {
	test.beforeEach( async ( { admin } ) => {
		await admin.createNewPost();
	} );

	test( 'should create image block with image sources', async ( { editor, page, mediaUtils } ) => {
		// Insert Image block.
		await editor.insertBlock( { name: 'core/image' } );

		const imageBlock = editor.canvas.locator( 'role=document[name="Block: Image"i]' );
		await expect( imageBlock ).toBeVisible();

		// Upload image.
		await mediaUtils.uploadImage(
			imageBlock.locator( 'data-testid=form-file-upload-input' ),
			'1000x750.png'
		);

		// Add first image source.
		await editor.openDocumentSettingsSidebar();
		const firstSourceFilename = await mediaUtils.uploadSource( '600x450.png' );
		const firstSource = page.locator( 'role=region[name="Editor settings"i] >> img' );
		await expect( firstSource ).toBeVisible();
		await expect( firstSource ).toHaveAttribute( 'src', new RegExp( firstSourceFilename ) );

		const enableResponsiveImagePanel = page.locator( '.enable-responsive-image' );

		// Change first image setting.
		await page.fill( 'role=spinbutton[name="Media query value"i]', '800' );
		await enableResponsiveImagePanel.locator( 'role=combobox[name="Resolution"i]' ).selectOption( {
			label: 'Medium',
		} );

		// Add second image source.
		await page.click( 'role=button[name="Add image source"i]' );
		const secondSourceFilename = await mediaUtils.uploadSource( '400x300.png' );
		const secondSource = page.locator( 'role=region[name="Editor settings"i] >> img' ).nth( 1 );
		await expect( secondSource ).toBeVisible();
		await expect( secondSource ).toHaveAttribute( 'src', new RegExp( secondSourceFilename ) );

		// Chage second image setting.
		await page.locator( 'role=spinbutton[name="Media query value"i]' ).nth( 1 ).fill( '500' );
		await enableResponsiveImagePanel
			.locator( 'role=radiogroup[name="Media query type"i]' )
			.nth( 1 )
			.getByRole( 'radio', { name: 'min-width' } )
			.setChecked( true );

		await enableResponsiveImagePanel
			.locator( 'role=combobox[name="Resolution"i]' )
			.nth( 1 )
			.selectOption( {
				label: 'Thumbnail',
			} );

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
		await this.page.click( 'role=button[name="Set image source"i]' );
		const filename = await this.uploadImage(
			this.page.locator( '.media-modal .moxie-shim input[type=file]' ),
			customFile
		);
		await this.page.click( 'role=dialog >> role=button[name="Select"i]' );
		return filename;
	}
}
