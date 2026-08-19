// @ts-check
const { test, expect } = require( '@playwright/test' );
const path = require( 'path' );

const fixtureUrl = `file://${ path.resolve( __dirname, 'fixtures/pong.html' ) }`;

test.beforeEach( async ( { page } ) => {
	await page.goto( fixtureUrl );
} );

test( 'renders the game container and canvas', async ( { page } ) => {
	await expect( page.locator( '.pong-block__game' ) ).toBeVisible();
	await expect( page.locator( '.pong-block__canvas' ) ).toBeVisible();
} );

test( 'canvas has correct accessibility attributes', async ( { page } ) => {
	const canvas = page.locator( '.pong-block__canvas' );
	await expect( canvas ).toHaveAttribute( 'role', 'img' );
	await expect( canvas ).toHaveAttribute( 'aria-label', 'Pong Game View' );
} );

test( 'shows difficulty selection overlay on load', async ( { page } ) => {
	const overlay = page.locator( '.pong-block__overlay' );
	await expect( overlay ).toBeVisible();
	await expect( page.getByRole( 'button', { name: 'Easy' } ) ).toBeVisible();
	await expect( page.getByRole( 'button', { name: 'Medium' } ) ).toBeVisible();
	await expect( page.getByRole( 'button', { name: 'Hard' } ) ).toBeVisible();
} );

test( 'clicking a difficulty button hides the overlay and starts the game', async ( { page } ) => {
	await page.getByRole( 'button', { name: 'Easy' } ).click();
	const overlay = page.locator( '.pong-block__overlay' );
	await expect( overlay ).toBeHidden();
} );

test( 'renders touch controls', async ( { page } ) => {
	await expect( page.getByRole( 'button', { name: 'Move Up' } ) ).toBeVisible();
	await expect( page.getByRole( 'button', { name: 'Move Down' } ) ).toBeVisible();
} );

test( 'touch controls are present for all difficulty modes', async ( { page } ) => {
	for ( const difficulty of [ 'Easy', 'Medium', 'Hard' ] ) {
		await page.goto( fixtureUrl );
		await page.getByRole( 'button', { name: difficulty } ).click();
		await expect( page.getByRole( 'button', { name: 'Move Up' } ) ).toBeVisible();
		await expect( page.getByRole( 'button', { name: 'Move Down' } ) ).toBeVisible();
	}
} );
