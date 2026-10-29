/// <reference types="node" />
/**
 * External dependencies
 */
import type { Locator, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import os from 'os';
import crypto from 'crypto';

/**
 * WordPress dependencies
 */
import { test as base, expect } from '@wordpress/e2e-test-utils-playwright';
import type { Editor } from '@wordpress/e2e-test-utils-playwright';

/**
 * Internal dependencies
 */
import type { Source } from '../../src/types';

// Same as `MAX_SOURCES` in `src/constants.ts`, which cannot be imported here
// because it reads a global that only exists in the editor.
const MAX_SOURCES = 5;

const test = base.extend< {
	mediaUtils: MediaUtils;
} >( {
	mediaUtils: async ( { page, editor }, use ) => {
		const mediaUtils = new MediaUtils( { page, editor } );
		await use( mediaUtils );
		mediaUtils.cleanup();
	},
} );

test.describe( 'Image Block', () => {
	test.beforeEach( async ( { admin } ) => {
		await admin.createNewPost();
	} );

	test.afterAll( async ( { requestUtils } ) => {
		await requestUtils.deleteAllPosts();
		await requestUtils.deleteAllMedia();
	} );

	test( 'should create image with image sources', async ( { editor, page, mediaUtils } ) => {
		await mediaUtils.insertImageBlock();
		const panel = page
			.getByRole( 'region', { name: 'Editor settings' } )
			.locator( '.enable-responsive-image' );

		// Add first image source.
		await page.getByRole( 'button', { name: 'Add image source' } ).click();
		await page.getByRole( 'button', { name: 'Set image source' } ).click();
		const firstSourceFilename = await mediaUtils.uploadSource( '600x450.png' );
		const firstSource = panel.locator( 'img' );
		await expect( firstSource ).toBeVisible();
		await expect( firstSource ).toHaveAttribute( 'src', new RegExp( firstSourceFilename ) );

		// Change first image setting.
		await mediaUtils.changeMediaQueryValue( '800' );
		await mediaUtils.changeResolution( 'Medium' );

		// Add second image source.
		await page.getByRole( 'button', { name: 'Add image source' } ).click();
		await page.getByRole( 'button', { name: 'Set image source' } ).click();
		const secondSourceFilename = await mediaUtils.uploadSource( '400x300.png' );
		const secondSource = panel.locator( 'img' ).nth( 1 );

		await expect( secondSource ).toBeVisible();
		await expect( secondSource ).toHaveAttribute( 'src', new RegExp( secondSourceFilename ) );

		// Chage second image setting.
		await mediaUtils.changeMediaQueryValue( '500', 1 );
		await mediaUtils.changeMediaQueryType( 'min-width', 1 );
		await mediaUtils.changeResolution( 'Thumbnail', 1 );

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

		const blocks = await editor.getBlocks();
		const sources = blocks[ 0 ].attributes.enableResponsiveImageSources as Source[];
		expect( sources?.[ 0 ]?.srcset?.includes( firstSourceFilename ) ).toBe( true );
		expect( sources?.[ 1 ]?.srcset?.includes( secondSourceFilename ) ).toBe( true );
	} );

	test( 'should move an image source up', async ( { editor, page, mediaUtils } ) => {
		await mediaUtils.insertImageBlock();
		const panel = page
			.getByRole( 'region', { name: 'Editor settings' } )
			.locator( '.enable-responsive-image' );

		// Add three image sources.
		await mediaUtils.addImageSource( '1000x750.png' );
		await mediaUtils.addImageSource( '600x450.png' );
		await mediaUtils.addImageSource( '400x300.png' );

		// Capture the srcset of each source in its original order.
		const [ firstSrcset, secondSrcset, thirdSrcset ] = await mediaUtils.getSrcsets();
		await panel.getByRole( 'button', { name: 'Move up' } ).nth( 1 ).click();

		await expect.poll( editor.getBlocks ).toMatchObject( [
			{
				attributes: {
					enableResponsiveImageSources: [
						{ srcset: secondSrcset },
						{ srcset: firstSrcset },
						{ srcset: thirdSrcset },
					],
				},
			},
		] );

		// Focus follows the moved source to its new position.
		await expect( panel.getByRole( 'button', { name: 'Move up' } ).nth( 0 ) ).toBeFocused();
	} );

	test( 'should move an image source down', async ( { editor, page, mediaUtils } ) => {
		await mediaUtils.insertImageBlock();
		const panel = page
			.getByRole( 'region', { name: 'Editor settings' } )
			.locator( '.enable-responsive-image' );

		// Add three image sources.
		await mediaUtils.addImageSource( '1000x750.png' );
		await mediaUtils.addImageSource( '600x450.png' );
		await mediaUtils.addImageSource( '400x300.png' );

		const [ firstSrcset, secondSrcset, thirdSrcset ] = await mediaUtils.getSrcsets();

		// Move the second image source down.
		await panel.getByRole( 'button', { name: 'Move down' } ).nth( 1 ).click();

		await expect.poll( editor.getBlocks ).toMatchObject( [
			{
				attributes: {
					enableResponsiveImageSources: [
						{ srcset: firstSrcset },
						{ srcset: thirdSrcset },
						{ srcset: secondSrcset },
					],
				},
			},
		] );

		// Focus follows the moved source to its new position.
		await expect( panel.getByRole( 'button', { name: 'Move down' } ).nth( 2 ) ).toBeFocused();
	} );

	test( 'should move focus to the add button when the last image source is removed', async ( {
		editor,
		page,
		mediaUtils,
	} ) => {
		await mediaUtils.insertImageBlock();
		const panel = page
			.getByRole( 'region', { name: 'Editor settings' } )
			.locator( '.enable-responsive-image' );

		// Add a single image source.
		await mediaUtils.addImageSource( '1000x750.png' );

		await panel.getByRole( 'button', { name: 'Remove', exact: true } ).click();

		await expect.poll( editor.getBlocks ).toMatchObject( [
			{
				attributes: {
					enableResponsiveImageSources: [],
				},
			},
		] );

		// Focus moves to the add button because no image source is left.
		await expect( page.getByRole( 'button', { name: 'Add image source' } ) ).toBeFocused();
	} );

	test( 'should move focus to the previous image source when a source is removed', async ( {
		editor,
		page,
		mediaUtils,
	} ) => {
		await mediaUtils.insertImageBlock();
		const panel = page
			.getByRole( 'region', { name: 'Editor settings' } )
			.locator( '.enable-responsive-image' );

		// Add three image sources.
		await mediaUtils.addImageSource( '1000x750.png' );
		await mediaUtils.addImageSource( '600x450.png' );
		await mediaUtils.addImageSource( '400x300.png' );

		// Capture the srcset of each source in its original order.
		const [ firstSrcset, , thirdSrcset ] = await mediaUtils.getSrcsets();

		// Remove the second image source.
		await panel.getByRole( 'button', { name: 'Remove', exact: true } ).nth( 1 ).click();

		await expect.poll( editor.getBlocks ).toMatchObject( [
			{
				attributes: {
					enableResponsiveImageSources: [ { srcset: firstSrcset }, { srcset: thirdSrcset } ],
				},
			},
		] );

		// Focus moves to the previous image source.
		await expect(
			panel.getByRole( 'button', { name: 'Replace image source', exact: true } ).nth( 0 )
		).toBeFocused();
	} );

	test( 'should move focus to the next image source when the first source is removed', async ( {
		editor,
		page,
		mediaUtils,
	} ) => {
		await mediaUtils.insertImageBlock();
		const panel = page
			.getByRole( 'region', { name: 'Editor settings' } )
			.locator( '.enable-responsive-image' );

		// Add three image sources.
		await mediaUtils.addImageSource( '1000x750.png' );
		await mediaUtils.addImageSource( '600x450.png' );
		await mediaUtils.addImageSource( '400x300.png' );

		// Capture the srcset of each source in its original order.
		const [ , secondSrcset, thirdSrcset ] = await mediaUtils.getSrcsets();

		// Remove the first image source.
		await panel.getByRole( 'button', { name: 'Remove', exact: true } ).nth( 0 ).click();

		await expect.poll( editor.getBlocks ).toMatchObject( [
			{
				attributes: {
					enableResponsiveImageSources: [ { srcset: secondSrcset }, { srcset: thirdSrcset } ],
				},
			},
		] );

		// Focus moves to the next image source, which is now the first one.
		await expect(
			panel.getByRole( 'button', { name: 'Replace image source', exact: true } ).nth( 0 )
		).toBeFocused();
	} );

	test( 'should render image sources on the frontend', async ( { editor, page, mediaUtils } ) => {
		await mediaUtils.insertImageBlock();
		const sourceFilename = await mediaUtils.addImageSource( '600x450.png' );
		await mediaUtils.changeMediaQueryValue( '800' );

		await expect.poll( editor.getBlocks ).toMatchObject( [
			{
				attributes: {
					enableResponsiveImageSources: [ { mediaType: 'max-width', mediaValue: 800 } ],
				},
			},
		] );

		const postId = await editor.publishPost();
		await page.goto( `/?p=${ postId }` );

		const source = page.locator( 'picture > source' );
		await expect( source ).toHaveAttribute( 'media', '(max-width: 800px)' );
		await expect( source ).toHaveAttribute( 'srcset', new RegExp( sourceFilename ) );
		await expect( page.locator( 'picture > img' ) ).toBeVisible();
	} );

	test( 'should toggle the responsive image preview', async ( { editor, mediaUtils } ) => {
		const imageBlock = await mediaUtils.insertImageBlock();
		const sourceFilename = await mediaUtils.addImageSource( '600x450.png' );

		await expect( imageBlock.locator( 'picture' ) ).toHaveCount( 0 );

		// Enable the preview.
		await editor.clickBlockToolbarButton( 'Enable responsive image preview' );
		await expect( imageBlock.locator( 'picture > source' ) ).toHaveAttribute(
			'srcset',
			new RegExp( sourceFilename )
		);

		// Disable the preview.
		await editor.clickBlockToolbarButton( 'Disable responsive image preview' );
		await expect( imageBlock.locator( 'picture' ) ).toHaveCount( 0 );
	} );

	test( 'should disable the add button at the maximum number of image sources', async ( {
		editor,
		page,
		mediaUtils,
	} ) => {
		await mediaUtils.insertImageBlock();

		const addButton = page.getByRole( 'button', { name: 'Add image source' } );
		for ( let i = 0; i < MAX_SOURCES; i++ ) {
			await expect( addButton ).toBeEnabled();
			await addButton.click();
		}

		await expect
			.poll( async () => ( await editor.getBlocks() )[ 0 ].attributes.enableResponsiveImageSources )
			.toHaveLength( MAX_SOURCES );
		await expect( addButton ).toBeDisabled();
	} );

	test( 'should reset all image sources', async ( { editor, page, mediaUtils } ) => {
		await mediaUtils.insertImageBlock();
		const panel = page
			.getByRole( 'region', { name: 'Editor settings' } )
			.locator( '.enable-responsive-image' );
		await mediaUtils.addImageSource( '600x450.png' );
		await mediaUtils.addImageSource( '400x300.png' );

		await panel.getByRole( 'button', { name: 'Image sources options' } ).click();
		await page.getByRole( 'menuitem', { name: 'Reset all' } ).click();

		await expect.poll( editor.getBlocks ).toMatchObject( [
			{
				attributes: {
					enableResponsiveImageSources: [],
				},
			},
		] );
		await expect( panel.locator( 'img' ) ).toHaveCount( 0 );
	} );

	test.describe( 'with the preview button disabled by the filter', () => {
		test.beforeAll( async ( { requestUtils } ) => {
			await requestUtils.activatePlugin( 'enable-responsive-image-test-hide-preview-button' );
		} );

		test.afterAll( async ( { requestUtils } ) => {
			await requestUtils.deactivatePlugin( 'enable-responsive-image-test-hide-preview-button' );
		} );

		test( 'should not show the preview button', async ( { editor, page, mediaUtils } ) => {
			await mediaUtils.insertImageBlock();
			await mediaUtils.addImageSource( '600x450.png' );

			await editor.showBlockToolbar();
			const blockToolbar = page.getByRole( 'toolbar', { name: 'Block tools' } );
			await expect( blockToolbar ).toBeVisible();
			await expect(
				blockToolbar.getByRole( 'button', { name: 'Enable responsive image preview' } )
			).toHaveCount( 0 );
		} );
	} );
} );

test.describe( 'Image Block without upload permission', () => {
	const contributor = {
		username: 'contributor',
		email: 'contributor@example.com',
		password: 'password',
		roles: [ 'contributor' ],
	};

	// Start each test logged out so that the page can log in as the contributor.
	test.use( { storageState: { cookies: [], origins: [] } } );

	test.beforeAll( async ( { requestUtils } ) => {
		await requestUtils.createUser( contributor );
	} );

	test.afterAll( async ( { requestUtils } ) => {
		await requestUtils.deleteAllPosts();
		await requestUtils.deleteAllMedia();
		await requestUtils.deleteAllUsers();
	} );

	test( 'should show a notice', async ( { admin, editor, page, requestUtils } ) => {
		const media = await requestUtils.uploadMedia(
			path.join( __dirname, 'assets', '1000x750.png' )
		);

		await page.goto( '/wp-login.php' );
		await page.locator( '#user_login' ).fill( contributor.username );
		await page.locator( '#user_pass' ).fill( contributor.password );
		await page.locator( '#wp-submit' ).click();
		await page.waitForURL( /wp-admin/ );

		await admin.createNewPost();
		await editor.insertBlock( {
			name: 'core/image',
			attributes: { id: media.id, url: media.source_url },
		} );
		await editor.openDocumentSettingsSidebar();
		await page.getByRole( 'tab', { name: 'Settings' } ).click();

		const panel = page
			.getByRole( 'region', { name: 'Editor settings' } )
			.locator( '.enable-responsive-image' );
		await expect(
			panel.getByText( 'To edit the image, you need permission to upload media.' )
		).toBeVisible();
		await expect( panel.getByRole( 'button', { name: 'Add image source' } ) ).toHaveCount( 0 );
	} );
} );

class MediaUtils {
	page: Page;
	editor: Editor;
	basePath: string;
	tmpDirectories: string[] = [];

	constructor( { page, editor }: { page: Page; editor: Editor } ) {
		this.page = page;
		this.editor = editor;
		this.basePath = path.join( __dirname, 'assets' );
	}

	cleanup() {
		for ( const tmpDirectory of this.tmpDirectories ) {
			fs.rmSync( tmpDirectory, { recursive: true, force: true } );
		}
		this.tmpDirectories = [];
	}

	// Inserts an Image block with a main image and opens its settings sidebar.
	async insertImageBlock() {
		await this.editor.insertBlock( { name: 'core/image' } );
		const imageBlock = this.editor.canvas.getByRole( 'document', { name: 'Block: Image' } );
		await expect( imageBlock ).toBeVisible();
		await this.uploadImage(
			imageBlock.locator( 'data-testid=form-file-upload-input' ),
			'1000x750.png'
		);

		await this.editor.openDocumentSettingsSidebar();
		await this.page.getByRole( 'tab', { name: 'Settings' } ).click();
		return imageBlock;
	}

	async getSrcsets() {
		const blocks = await this.editor.getBlocks();
		return ( blocks[ 0 ].attributes.enableResponsiveImageSources as Source[] ).map(
			( source ) => source.srcset
		);
	}

	async uploadImage( inputElement: Locator, customFile: string ) {
		const tmpDirectory = fs.mkdtempSync( path.join( os.tmpdir(), 'test-image-' ) );
		this.tmpDirectories.push( tmpDirectory );
		const filename = crypto.randomUUID();
		const tmpFileName = path.join( tmpDirectory, filename + '.png' );
		const filepath = path.join( this.basePath, customFile );
		fs.copyFileSync( filepath, tmpFileName );
		await inputElement.setInputFiles( tmpFileName );
		return filename;
	}

	async uploadSource( customFile: string ) {
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

	async addImageSource( customFile: string ) {
		await this.page.getByRole( 'button', { name: 'Add image source' } ).click();
		await this.page.getByRole( 'button', { name: 'Set image source' } ).click();
		return this.uploadSource( customFile );
	}

	async changeMediaQueryType( option: string, index = 0 ) {
		const panel = this.page
			.getByRole( 'region', { name: 'Editor settings' } )
			.locator( '.enable-responsive-image' );
		await panel
			.getByRole( 'radiogroup', { name: 'Media query type' } )
			.nth( index )
			.getByRole( 'radio', { name: option } )
			.setChecked( true );
	}

	async changeMediaQueryValue( value: string, index = 0 ) {
		const panel = this.page
			.getByRole( 'region', { name: 'Editor settings' } )
			.locator( '.enable-responsive-image' );
		await panel
			.getByRole( 'spinbutton', { name: 'Media query value (px)' } )
			.nth( index )
			.fill( value );
	}

	async changeResolution( option: string, index = 0 ) {
		const panel = this.page
			.getByRole( 'region', { name: 'Editor settings' } )
			.locator( '.enable-responsive-image' );
		await panel.getByRole( 'combobox', { name: 'Resolution' } ).nth( index ).click();
		await this.page.getByRole( 'listbox' ).getByRole( 'option', { name: option } ).click();
	}
}
