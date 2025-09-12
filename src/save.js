import { useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes }) {
	const { paddleSize, ballSpeed, winningScore, colorScheme, difficulty } = attributes;
	return (
		<div
			{ ...useBlockProps.save() }
			data-paddle-size={paddleSize}
			data-ball-speed={ballSpeed}
			data-winning-score={winningScore}
			data-color-scheme={colorScheme}
			data-difficulty={difficulty}
			className={`pong-block__frontend`}
		>
			{/* The actual canvas/game overlays will be rendered by view.js */}
			<noscript>
				<span>
					Pong Block requires JavaScript to play the game.
				</span>
			</noscript>
		</div>
	);
}