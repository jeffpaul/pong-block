// Pong Block frontend logic
(function () {
	var __ = function(s) { return s; };
	if (window.wp && window.wp.i18n && typeof window.wp.i18n.__ === 'function') {
		__ = window.wp.i18n.__;
	}

	// Used for accessibility to announce winner.
	function announce(msg) {
		let el = document.createElement('div');
		el.setAttribute('role', 'status');
		el.setAttribute('aria-live', 'polite');
		el.style.position = 'absolute'; el.style.left = '-9999px';
		el.textContent = msg;
		document.body.appendChild(el);
		setTimeout(() => { el.remove(); }, 1500);
	}

	function getColorScheme(option) {
		return ({
			dark: {bg:'#111', fg:'#fff', accent:'#fff', secondary:'#333', contrast:'#fff'},
			light: {bg:'#f8f9fa', fg:'#222', accent:'#fff', secondary:'#e0e0e0', contrast:'#111'},
			highContrast: {bg:'#000', fg:'#fff', accent:'#fff', secondary:'#ffff00', contrast:'#ff0'}
		})[option] || {bg:'#111', fg:'#fff', accent:'#fff', secondary:'#333', contrast:'#fff'};
	}

	function getDifficultySettings(option) {
		return ({
			easy: { aiSpeed: 0.05, aiRandomness: 25 },
			medium: { aiSpeed: 0.09, aiRandomness: 15 },
			hard: { aiSpeed: 0.18, aiRandomness: 8 }
		})[option] || { aiSpeed: 0.09, aiRandomness: 15 };
	}

	function renderGame(container, settings) {
		let overlay, canvas, controls, focusBtn;
		const width = 520, height = 320;
		const paddleW = 12;
		const paddleH = Number(settings.paddleSize) || 80;
		const ballSpeed = Number(settings.ballSpeed) || 5;
		const ballSize = 18; // Square ball size
		const winningScore = Number(settings.winningScore) || 10;
		const defaultDifficulty = settings.difficulty || 'medium';
		const color = getColorScheme(settings.colorScheme);

		let selectedDifficulty = defaultDifficulty;
		let difficultySettings = getDifficultySettings(selectedDifficulty);

		container.innerHTML = `
			<div class="pong-block__game"
				 style="background:${color.bg};color:${color.fg};border-color:${color.secondary};position:relative;max-width:650px;margin:0 auto;
				 border-radius:12px;border-width:4px;border-style:solid;box-sizing:border-box;padding:.5em;">
				<canvas width="${width}" height="${height}" class="pong-block__canvas" role="img" aria-label="${__( 'Pong Game View', 'pong-block' )}"
					style="width:100%;height:auto;display:block;border-radius:10px;outline:none"></canvas>
				<div class="pong-block__overlay" style="display:flex;" aria-modal="true" role="dialog">
					<div class="pong-block__overlay-content" style="color:${color.fg};text-align:center;">
						<h3 style="margin-bottom:1em;">${__( 'Select Game Mode', 'pong-block' )}</h3>
						<button class="pong-block__overlay-btn" data-difficulty="easy" style="margin:0.5em;background:#fff;color:#000;border:2px solid #000;">${__( 'Easy', 'pong-block' )}</button>
						<button class="pong-block__overlay-btn" data-difficulty="medium" style="margin:0.5em;background:#fff;color:#000;border:2px solid #000;">${__( 'Medium', 'pong-block' )}</button>
						<button class="pong-block__overlay-btn" data-difficulty="hard" style="margin:0.5em;background:#fff;color:#000;border:2px solid #000;">${__( 'Hard', 'pong-block' )}</button>
					</div>
				</div>
				<div class="pong-block__touch-controls" style="display:flex;flex-direction:column;gap:18px;position:absolute;right:7px;bottom:7px;">
					<button class="pong-block__touch-btn" type="button" aria-label="${__( 'Move Up', 'pong-block' )}">↑</button>
					<button class="pong-block__touch-btn" type="button" aria-label="${__( 'Move Down', 'pong-block' )}">↓</button>
				</div>
			</div>
		`;

		overlay = container.querySelector('.pong-block__overlay');
		canvas  = container.querySelector('.pong-block__canvas');
		controls= container.querySelector('.pong-block__touch-controls');

		let ctx = canvas.getContext('2d');
		let state = 'prestart', finishSide = null;
		let raf, running = false;

		let user = { x: 8, y: height/2-paddleH/2, vy: 0 };
		let cpu  = { x: width-paddleW-8, y: height/2-paddleH/2, vy: 0 };
		let ball, score;
		let keys = {up: false, down: false};
		
		function resetGame() {
			state = 'playing';
			score = { user: 0, computer: 0 };
			user.y = cpu.y = height/2-paddleH/2;
			serve(Math.random() > 0.5 ? 1 : -1);
			draw();
		}
		
		function serve(dir) {
			ball = {
				x: width/2,
				y: height/2,
				vx: dir * ballSpeed,
				vy: (Math.random()-0.5) * ballSpeed * 1.0
			};
		}
		
		function draw() {
			ctx.fillStyle = color.bg;
			ctx.fillRect(0, 0, width, height);
			// Center line (now white to match paddles)
			ctx.strokeStyle = color.fg;
			ctx.setLineDash([10,11]);
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.moveTo(width/2, 0); ctx.lineTo(width/2, height); ctx.stroke();
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
			ctx.fillText(score.user, width/2-58, 36);
			ctx.fillText(score.computer, width/2+58, 36);
		}
		
		function tick() {
			// User
			if (keys.up) user.y -= 6;
			if (keys.down) user.y += 6;
			if (user.y < 0) user.y = 0;
			if (user.y > height-paddleH) user.y = height-paddleH;
			// CPU AI with difficulty settings
			let cpuTarget = ball.y - paddleH/2 + Math.random() * difficultySettings.aiRandomness - (difficultySettings.aiRandomness / 2);
			cpu.y += (cpuTarget-cpu.y) * difficultySettings.aiSpeed;
			if (cpu.y < 0) cpu.y=0;
			if (cpu.y > height-paddleH) cpu.y=height-paddleH;
			// Ball
			ball.x += ball.vx;
			ball.y += ball.vy;
			// Bounce
			if (ball.y<ballSize/2 || ball.y>height-ballSize/2) ball.vy *= -1;
			// Paddle collisions
			if (ball.x-ballSize/2 < user.x+paddleW && ball.y>user.y && ball.y<user.y+paddleH) {
				ball.x = user.x+paddleW+ballSize/2;
				ball.vx *= -1.08;
				ball.vy += (ball.y - (user.y+paddleH/2))/28;
			}
			if (ball.x+ballSize/2 > cpu.x && ball.y>cpu.y && ball.y<cpu.y+paddleH) {
				ball.x = cpu.x-ballSize/2;
				ball.vx *= -1.08;
				ball.vy += (ball.y - (cpu.y+paddleH/2))/30;
			}
			// Scoring
			if (ball.x<0) {
				score.computer +=1;
				if (score.computer >= winningScore) { finish('computer'); return; }
				serve(1); return raf = requestAnimationFrame(tick);
			}
			if (ball.x>width) {
				score.user +=1;
				if (score.user >= winningScore) { finish('user'); return; }
				serve(-1); return raf = requestAnimationFrame(tick);
			}
			draw();
			if (running) raf = requestAnimationFrame(tick);
		}
		
		function finish(side) {
			state = 'ended';
			finishSide = side;
			running = false;
			announce( side === 'user' ? __( 'You win!', 'pong-block' ) : __( 'Computer wins!', 'pong-block' ) );
			showOverlay(side);
		}
		
		function showOverlay(type) {
			overlay.style.display = 'flex';
			const html =
				type === 'user'
				? `<h3>${__( 'You win!', 'pong-block' )}</h3>
				   <button class="pong-block__overlay-btn" style="background:#fff;color:#000;border:2px solid #000;">${__( 'Play Again', 'pong-block' )}</button>`
				: type === 'computer'
				? `<h3>${__( 'Computer wins!', 'pong-block' )}</h3>
				   <button class="pong-block__overlay-btn" style="background:#fff;color:#000;border:2px solid #000;">${__( 'Play Again', 'pong-block' )}</button>`
				: `<h3 style="margin-bottom:1em;">${__( 'Select Game Mode', 'pong-block' )}</h3>
					<div style="text-align:center;">
						<button class="pong-block__overlay-btn" data-difficulty="easy" style="margin:0.5em;background:#fff;color:#000;border:2px solid #000;">${__( 'Easy', 'pong-block' )}</button>
						<button class="pong-block__overlay-btn" data-difficulty="medium" style="margin:0.5em;background:#fff;color:#000;border:2px solid #000;">${__( 'Medium', 'pong-block' )}</button>
						<button class="pong-block__overlay-btn" data-difficulty="hard" style="margin:0.5em;background:#fff;color:#000;border:2px solid #000;">${__( 'Hard', 'pong-block' )}</button>
					</div>`;
			overlay.querySelector('.pong-block__overlay-content').innerHTML = html;
			
			const firstBtn = overlay.querySelector('button');
			setTimeout(() => { firstBtn && firstBtn.focus(); }, 100);
			
			if (type === 'user' || type === 'computer') {
				// Play again button
				firstBtn.onclick = function () {
					overlay.style.display = 'none';
					state = 'prestart';
					showOverlay('prestart');
				};
			} else {
				// Difficulty selection buttons
				const difficultyButtons = overlay.querySelectorAll('[data-difficulty]');
				difficultyButtons.forEach(btn => {
					btn.onclick = function() {
						selectedDifficulty = this.getAttribute('data-difficulty');
						difficultySettings = getDifficultySettings(selectedDifficulty);
						overlay.style.display = 'none'; 
						resetGame(); 
						running = true; 
						raf = requestAnimationFrame(tick);
					};
				});
			}
		}

		// Initial overlay setup
		if (overlay) {
			const difficultyButtons = overlay.querySelectorAll('[data-difficulty]');
			difficultyButtons.forEach(btn => {
				btn.onclick = function() {
					selectedDifficulty = this.getAttribute('data-difficulty');
					difficultySettings = getDifficultySettings(selectedDifficulty);
					overlay.style.display = 'none'; 
					resetGame(); 
					running = true; 
					raf = requestAnimationFrame(tick);
				};
			});
			
			setTimeout(() => {
				const firstBtn = overlay.querySelector('button');
				if (firstBtn) firstBtn.focus();
			}, 250);
		}
		
		// Keyboard controls
		function handleKeyDown(e) {
			if (e.code==='ArrowUp'||e.key==='ArrowUp') { keys.up=true; }
			if (e.code==='ArrowDown'||e.key==='ArrowDown') { keys.down=true; }
		}
		function handleKeyUp(e) {
			if (e.code==='ArrowUp'||e.key==='ArrowUp') { keys.up=false; }
			if (e.code==='ArrowDown'||e.key==='ArrowDown') { keys.down=false; }
		}
		canvas.tabIndex = 0;
		canvas.addEventListener('keydown', function(e){
			if ([38,40].includes(e.keyCode)) e.preventDefault();
		});
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
		
		// Touch buttons
		const btns = controls.querySelectorAll('.pong-block__touch-btn');
		btns[0].onclick = function(){ if (state==='playing'){keys.up=true; setTimeout(()=>{keys.up=false}, 90)}};
		btns[1].onclick = function(){ if (state==='playing'){keys.down=true; setTimeout(()=>{keys.down=false}, 90)}};
		Array.from(btns).forEach(b => { b.disabled=false; });
		
		// Cleanup on unmount
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
			cancelAnimationFrame(raf);
		}
	}

	function mountPongBlock() {
		const blocks = document.querySelectorAll('.pong-block__frontend');
		blocks.forEach((elm) => {
			// Prevent double mount
			if (elm.hasAttribute('data-pong-mounted')) return;
			elm.setAttribute('data-pong-mounted', 'true');
			const settings = {
				paddleSize: elm.getAttribute('data-paddle-size'),
				ballSpeed: elm.getAttribute('data-ball-speed'),
				winningScore: elm.getAttribute('data-winning-score'),
				colorScheme: elm.getAttribute('data-color-scheme'),
				difficulty: elm.getAttribute('data-difficulty'),
			};
			renderGame(elm, settings);
		});
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", mountPongBlock);
	} else {
		mountPongBlock();
	}
})();