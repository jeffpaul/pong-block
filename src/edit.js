import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, RangeControl, RadioControl, SelectControl, __experimentalHeading as Heading } from '@wordpress/components';
import { useState, useRef, useEffect } from '@wordpress/element';

const COLOR_SCHEMES = {
	dark: {
		label: __('Dark (Classic)', 'pong-block'),
		bg: '#111',
		fg: '#fff',
		accent: '#fff', // Ball is always white
		secondary: '#333',
		contrast: '#fff'
	},
	light: {
		label: __('Light', 'pong-block'),
		bg: '#f8f9fa',
		fg: '#222',
		accent: '#fff', // Ball is always white
		secondary: '#e0e0e0',
		contrast: '#111'
	},
	highContrast: {
		label: __('High Contrast', 'pong-block'),
		bg: '#000',
		fg: '#fff',
		accent: '#fff', // Ball is always white
		secondary: '#ffff00',
		contrast: '#ff0'
	}
};

const DIFFICULTY_LEVELS = {
	easy: {
		label: __('Easy', 'pong-block'),
		aiSpeed: 0.05,
		aiRandomness: 25,
		description: __('Computer moves slowly with high randomness', 'pong-block')
	},
	medium: {
		label: __('Medium', 'pong-block'),
		aiSpeed: 0.09,
		aiRandomness: 15,
		description: __('Balanced computer opponent', 'pong-block')
	},
	hard: {
		label: __('Hard', 'pong-block'),
		aiSpeed: 0.18,
		aiRandomness: 8,
		description: __('Fast and precise computer opponent', 'pong-block')
	}
};

function getColorScheme(option) {
	return COLOR_SCHEMES[option] || COLOR_SCHEMES["dark"];
}

function getDifficultySettings(option) {
	return DIFFICULTY_LEVELS[option] || DIFFICULTY_LEVELS["medium"];
}

/**
 * Accessible overlay for start/gameover/instructions
 */
function Overlay({ show, message, subMessage, buttonText, buttonRef, onButton, ariaLive, children }) {
	if (!show) return null;
	return (
		<div
			className="pong-block__overlay"
			role="dialog"
			aria-modal="true"
			aria-live={ariaLive || "polite"}
		>
			<div className="pong-block__overlay-content">
				{message && <Heading level={3}>{message}</Heading>}
				{subMessage && <p>{subMessage}</p>}
				{children}
				{buttonText &&
					<button
						ref={buttonRef}
						className="pong-block__overlay-btn"
						onClick={onButton}
					>
						{buttonText}
					</button>
				}
			</div>
		</div>
	);
}

/**
 * On-screen large mobile controls
 */
function TouchControls({ up, down, disabled, color, labelUp, labelDown }) {
	return (
		<div className="pong-block__touch-controls" aria-hidden={disabled}>
			<button
				className="pong-block__touch-btn"
				onClick={up}
				style={{ background: color }}
				tabIndex={disabled ? -1 : 0}
				aria-label={labelUp}
				type="button"
				disabled={disabled}
			>
				↑
			</button>
			<button
				className="pong-block__touch-btn"
				onClick={down}
				style={{ background: color }}
				tabIndex={disabled ? -1 : 0}
				aria-label={labelDown}
				type="button"
				disabled={disabled}
			>
				↓
			</button>
		</div>
	);
}

export default function Edit({ attributes, setAttributes, isSelected }) {
	const {
		paddleSize,
		ballSpeed,
		winningScore,
		colorScheme,
		difficulty
	} = attributes;

	const [gameState, setGameState] = useState('prestart'); // prestart | playing | ended
	const [winner, setWinner] = useState(null); // "user", "computer" | null
	const [score, setScore] = useState({ user: 0, computer: 0 });
	const [selectedDifficulty, setSelectedDifficulty] = useState(difficulty);
	const canvasRef = useRef();
	const playAgainRef = useRef();
	const startRef = useRef();

	const color = getColorScheme(colorScheme);
	const difficultySettings = getDifficultySettings(selectedDifficulty);

	const GAME_WIDTH = 520;
	const GAME_HEIGHT = 320;

	// Main pong logic (editor live preview)
	useEffect(() => {
		let raf, keys = { up: false, down: false }, touchMove = 0;

		function resetGame() {
			setWinner(null);
			setScore({ user: 0, computer: 0 });
		}

		function startGame() {
			resetGame();
			// Store the selected difficulty in attributes when game starts
			setAttributes({ difficulty: selectedDifficulty });
			setGameState('playing');
			tick();
		}

		if (gameState === 'playing') {
			let ctx = canvasRef.current.getContext('2d');
			let w = GAME_WIDTH, h = GAME_HEIGHT;
			let paddleH = paddleSize;
			let paddleW = 12;
			let ballSize = 18; // Square ball size

			let user = { x: 8, y: h / 2 - paddleH / 2, vy: 0 };
			let cpu = { x: w - paddleW - 8, y: h / 2 - paddleH / 2, vy: 0 };
			let ball = {
				x: w / 2,
				y: h / 2,
				vx: (Math.random() > 0.5 ? 1 : -1) * ballSpeed,
				vy: (Math.random() - 0.5) * ballSpeed
			};

			let moveUp = () => { keys.up = true; keys.down = false; };
			let moveDown = () => { keys.down = true; keys.up = false; };

			const handleKeyDown = (e) => {
				if (e.code === 'ArrowUp' || e.key === 'ArrowUp') { keys.up = true; }
				if (e.code === 'ArrowDown' || e.key === 'ArrowDown') { keys.down = true; }
			};
			const handleKeyUp = (e) => {
				if (e.code === 'ArrowUp' || e.key === 'ArrowUp') { keys.up = false; }
				if (e.code === 'ArrowDown' || e.key === 'ArrowDown') { keys.down = false; }
			};

			window.addEventListener('keydown', handleKeyDown);
			window.addEventListener('keyup', handleKeyUp);

			let running = true;
			function tick() {
				// User
				if (keys.up) user.y -= 6;
				if (keys.down) user.y += 6;
				if (user.y < 0) user.y = 0;
				if (user.y > h - paddleH) user.y = h - paddleH;
				// CPU with difficulty-based AI
				let cpuTarget = ball.y - paddleH / 2 + Math.random() * difficultySettings.aiRandomness - (difficultySettings.aiRandomness / 2);
				cpu.y += (cpuTarget - cpu.y) * difficultySettings.aiSpeed;
				if (cpu.y < 0) cpu.y = 0;
				if (cpu.y > h - paddleH) cpu.y = h - paddleH;
				// Ball
				ball.x += ball.vx;
				ball.y += ball.vy;
				// Bounce
				if (ball.y < ballSize/2 || ball.y > h - ballSize/2) ball.vy *= -1;
				// Paddle collisions
				if (
					ball.x - ballSize/2 < user.x + paddleW &&
					ball.y > user.y &&
					ball.y < user.y + paddleH
				) {
					ball.x = user.x + paddleW + ballSize/2;
					ball.vx *= -1.08;
					ball.vy += (ball.y - (user.y + paddleH / 2)) / 28;
				}
				if (
					ball.x + ballSize/2 > cpu.x &&
					ball.y > cpu.y &&
					ball.y < cpu.y + paddleH
				) {
					ball.x = cpu.x - ballSize/2;
					ball.vx *= -1.08;
					ball.vy += (ball.y - (cpu.y + paddleH / 2)) / 30;
				}
				// Score
				if (ball.x < 0) {
					setScore((s) => ({ user: s.user, computer: s.computer + 1 }));
					winCheck('computer');
					return;
				} else if (ball.x > w) {
					setScore((s) => ({ user: s.user + 1, computer: s.computer }));
					winCheck('user');
					return;
				}
				// Draw
				ctx.fillStyle = color.bg;
				ctx.fillRect(0, 0, w, h);
				// Middle line (now white to match paddles)
				ctx.strokeStyle = color.fg;
				ctx.setLineDash([10, 11]);
				ctx.lineWidth = 3;
				ctx.beginPath();
				ctx.moveTo(w / 2, 0);
				ctx.lineTo(w / 2, h);
				ctx.stroke();
				ctx.setLineDash([]);

				// Paddles
				ctx.fillStyle = color.fg;
				ctx.fillRect(user.x, user.y, paddleW, paddleH);
				ctx.fillRect(cpu.x, cpu.y, paddleW, paddleH);

				// Ball (white square)
				ctx.fillStyle = '#fff';
				ctx.fillRect(ball.x - ballSize/2, ball.y - ballSize/2, ballSize, ballSize);

				// Score
				ctx.fillStyle = color.contrast;
				ctx.font = "bold 28px system-ui, sans-serif";
				ctx.textAlign = "center";
				ctx.fillText(score.user, w / 2 - 58, 36);
				ctx.fillText(score.computer, w / 2 + 58, 36);

				if (running)
					raf = requestAnimationFrame(tick);
			}

			function winCheck(side) {
				let nextScore = (side === 'user' ? score.user + 1 : score.computer + 1);
				if (nextScore >= winningScore) {
					setWinner(side);
					setGameState('ended');
				} else {
					ball.x = w / 2; ball.y = h / 2;
					ball.vx = (side === 'user' ? -1 : 1) * ballSpeed;
					ball.vy = (Math.random() - 0.5) * ballSpeed;
					if (running) raf = requestAnimationFrame(tick);
				}
			}

			const handleTouchUp = () => { moveUp(); setTimeout(()=>{keys.up = false;}, 100); };
			const handleTouchDown = () => { moveDown(); setTimeout(()=>{keys.down = false;}, 100); };

			// For touch controls disable arrow key scrolling
			canvasRef.current.tabIndex = 0;
			const preventScroll = (e) => { if ([38,40].includes(e.keyCode)) e.preventDefault(); };
			canvasRef.current.addEventListener('keydown', preventScroll);

			return () => {
				running = false;
				cancelAnimationFrame(raf);
				window.removeEventListener('keydown', handleKeyDown);
				window.removeEventListener('keyup', handleKeyUp);
				if (canvasRef.current) {
					canvasRef.current.removeEventListener('keydown', preventScroll);
				}
			}
		}
	}, [gameState, paddleSize, ballSpeed, winningScore, colorScheme, score.user, score.computer, selectedDifficulty, difficultySettings]);

	// Focus logic for accessibility
	useEffect(() => {
		if (gameState === 'ended' && playAgainRef.current) {
			playAgainRef.current.focus();
		} else if (gameState === 'prestart' && startRef.current) {
			startRef.current.focus();
		}
	}, [gameState]);

	function onPlayAgain() {
		setWinner(null);
		setScore({ user: 0, computer: 0 });
		setGameState('prestart'); // Go back to difficulty selection
	}

	function onStartGame(diff) {
		setSelectedDifficulty(diff);
		setAttributes({ difficulty: diff });
		setGameState('playing');
	}

	// Inspector Sidebar
	const updateAttr = (k) => (v) => setAttributes({ [k]: v });

	return (
		<div {...useBlockProps()}>
			<InspectorControls>
				<PanelBody title={__('Game Difficulty', 'pong-block')} initialOpen={true}>
					<RangeControl
						label={__('Paddle Size', 'pong-block')}
						value={paddleSize}
						onChange={updateAttr('paddleSize')}
						min={40} max={140}
						help={__('Larger paddles make the game easier.', 'pong-block')}
						required
					/>
					<RangeControl
						label={__('Ball Speed', 'pong-block')}
						value={ballSpeed}
						onChange={updateAttr('ballSpeed')}
						min={3} max={12}
						help={__('Higher speeds make the game harder.', 'pong-block')}
						required
					/>
					<RangeControl
						label={__('Winning Score', 'pong-block')}
						value={winningScore}
						onChange={updateAttr('winningScore')}
						min={3} max={20}
						help={__('First to this score wins the game.', 'pong-block')}
						required
					/>
					<SelectControl
						label={__('Default Difficulty', 'pong-block')}
						value={difficulty}
						onChange={updateAttr('difficulty')}
						options={[
							{ label: DIFFICULTY_LEVELS.easy.label, value: 'easy' },
							{ label: DIFFICULTY_LEVELS.medium.label, value: 'medium' },
							{ label: DIFFICULTY_LEVELS.hard.label, value: 'hard' }
						]}
						help={__('Players can choose their preferred difficulty when starting the game.', 'pong-block')}
					/>
				</PanelBody>
				<PanelBody title={__('Color Scheme', 'pong-block')} initialOpen={false}>
					<RadioControl
						selected={colorScheme}
						options={[
							{ label: COLOR_SCHEMES.dark.label, value: 'dark' },
							{ label: COLOR_SCHEMES.light.label, value: 'light' },
							{ label: COLOR_SCHEMES.highContrast.label, value: 'highContrast' }
						]}
						onChange={updateAttr('colorScheme')}
					/>
				</PanelBody>
			</InspectorControls>
			<div
				className="pong-block__game"
				style={{
					background: color.bg,
					color: color.fg,
					borderColor: color.secondary,
					position: "relative",
					maxWidth: 650,
					margin: "0 auto",
					borderRadius: 12,
					borderWidth: 4,
					borderStyle: "solid",
					boxSizing: "border-box",
					padding: "0.5em"
				}}
				aria-label={__("Pong Game", 'pong-block')}
			>
				<canvas
					ref={canvasRef}
					width={GAME_WIDTH}
					height={GAME_HEIGHT}
					role="img"
					aria-label={__("Pong Game View", 'pong-block')}
					className="pong-block__canvas"
					style={{
						width: "100%",
						height: "auto",
						display: "block",
						borderRadius: 10
					}}
				/>
				{/* Overlays */}
				<Overlay
					show={gameState === 'prestart'}
					message={null}
					subMessage={null}
					buttonText={null}
					buttonRef={null}
					onButton={null}
					ariaLive="polite"
				>
					<div style={{ textAlign: 'center' }}>
						<Heading level={3} style={{ marginBottom: '1em' }}>
							{__('Select Game Mode', 'pong-block')}
						</Heading>
						<button
							ref={startRef}
							className="pong-block__overlay-btn"
							onClick={() => onStartGame('easy')}
							style={{ margin: '0.5em' }}
						>
							{__('Easy', 'pong-block')}
						</button>
						<button
							className="pong-block__overlay-btn"
							onClick={() => onStartGame('medium')}
							style={{ margin: '0.5em' }}
						>
							{__('Medium', 'pong-block')}
						</button>
						<button
							className="pong-block__overlay-btn"
							onClick={() => onStartGame('hard')}
							style={{ margin: '0.5em' }}
						>
							{__('Hard', 'pong-block')}
						</button>
					</div>
				</Overlay>
				<Overlay
					show={gameState === 'ended'}
					message={
						winner
							? (winner === 'user'
								? __('You win!', 'pong-block')
								: __('Computer wins!', 'pong-block'))
						: null
					}
					subMessage={null}
					buttonText={__('Play Again', 'pong-block')}
					buttonRef={playAgainRef}
					onButton={onPlayAgain}
					ariaLive="assertive"
				/>
				<TouchControls
					up={() => { if (gameState === 'playing') { const e = new KeyboardEvent("keydown", {key: "ArrowUp"}); window.dispatchEvent(e); } }}
					down={() => { if (gameState === 'playing') { const e = new KeyboardEvent("keydown", {key: "ArrowDown"}); window.dispatchEvent(e); } }}
					disabled={gameState !== 'playing'}
					color={color.secondary}
					labelUp={__('Move Up', 'pong-block')}
					labelDown={__('Move Down', 'pong-block')}
				/>
			</div>
		</div>
	);
}