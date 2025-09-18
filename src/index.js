import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import save from './save';
import metadata from './block.json';

registerBlockType( metadata.name, {
	edit: Edit,
	save,
	attributes: {
		paddleSize: {
			type: 'number',
			default: 80,
		},
		ballSpeed: {
			type: 'number',
			default: 5,
		},
		winningScore: {
			type: 'number',
			default: 10,
		},
		colorScheme: {
			type: 'string',
			default: 'dark',
		},
		difficulty: {
			type: 'string',
			default: 'medium',
		},
	},
} );