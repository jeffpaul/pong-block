<?php
/**
 * Plugin Name:       Pong Block
 * Plugin URI:        https://github.com/jeffpaul/pong-block
 * Description:       Adds a playable, accessible Pong game to your posts and pages. Customize difficulty, color scheme, and controls for the ultimate classic game experience.
 * Requires at least: 6.8
 * Requires PHP:      8.1
 * Version:           0.1.0
 * Author:            Jeffrey Paul
 * Author URI:        https://jeffpaul.com
 * License:           GPL-2.0-or-later
 * License URI:       https://spdx.org/licenses/GPL-2.0-or-later.html
 * Text Domain:       pong-block
 *
 * @package           Pong Block
 */

// Useful global constants.
define( 'PONG_BLOCK_VERSION', '0.1.0' );

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function pong_block_init() {
	register_block_type( __DIR__ . '/build/' );
}
add_action( 'init', 'pong_block_init' );
	
