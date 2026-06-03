/* Ball Tracker - Game Logic */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  
  // UI Bindings
  const targetsFoundEl = document.getElementById('targets-found');
  const targetsTotalEl = document.getElementById('targets-total');
  const statusBanner = document.getElementById('game-status-banner');
  
  // Overlays
  const overlayPause = document.getElementById('overlay-pause');
  const overlayGameOver = document.getElementById('overlay-gameover');
  const gameoverTitle = document.getElementById('gameover-title');
  const gameoverDesc = document.getElementById('gameover-desc');
  const finalScoreEl = document.getElementById('final-score');
  const bestScoreEl = document.getElementById('best-score');
  
  // Buttons
  const btnPause = document.getElementById('btn-pause');
  const btnRestart = document.getElementById('btn-restart');
  const btnResume = document.getElementById('btn-resume');
  const btnRetry = document.getElementById('btn-retry');

  // Game Engine settings
  const config = {
    gameId: 'ball-tracker',
    timeLimit: 0, // No timer needed since the game is phase-based
    maxLevels: 20,
    initLives: 3
  };

  // Ball properties
  let balls = [];
  const ballRadius = 24;
  let gamePhase = 'memorize'; // 'memorize' | 'shuffling' | 'select' | 'paused'
  let phaseTimer = null;
  let targetCount = 2;
  let ballCount = 5;
  let moveSpeed = 2.5;
  let shuffleDuration = 5000; // ms
  let selectedTargetsCount = 0;
  
  // Animation Frame Handle
  let animFrameId = null;

  const engine = new GameEngine(config);

  // Hook Engine event callbacks
  engine.on('onStart', (state) => {
    overlayPause.classList.remove('overlay--active');
    overlayGameOver.classList.remove('overlay--active');
    initLevel(state.level);
  });

  engine.on('onPause', () => {
    overlayPause.classList.add('overlay--active');
    cancelAnimationFrame(animFrameId);
  });

  engine.on('onResume', () => {
    overlayPause.classList.remove('overlay--active');
    loop();
  });

  engine.on('onGameOver', (state, reason) => {
    cancelAnimationFrame(animFrameId);
    overlayGameOver.classList.add('overlay--active');
    finalScoreEl.textContent = state.score;
    bestScoreEl.textContent = state.highScore;
    
    if (reason === 'win') {
      gameoverTitle.textContent = '🎉 Absolute Focus!';
      gameoverTitle.style.color = 'var(--color-success)';
      gameoverDesc.textContent = `You tracked all target balls successfully through every level! Perfect score.`;
    } else {
      gameoverTitle.textContent = '💔 Focus Lost!';
      gameoverTitle.style.color = 'var(--color-danger)';
      gameoverDesc.textContent = `You selected the wrong balls. Sharpen your attention and try again!`;
    }
  });

  // Level Setup
  function initLevel(levelNum) {
    // Tune level difficulty programmatically
    // Ball count: scales from 5 to 9
    ballCount = Math.min(9, 5 + Math.floor((levelNum - 1) / 4));
    
    // Target count: scales from 1 to 4
    targetCount = Math.min(4, 1 + Math.floor((levelNum - 1) / 6));
    if (targetCount >= ballCount) {
      targetCount = ballCount - 1;
    }
    
    // Move speed: scales from 2.2 to 5.0
    moveSpeed = 2.2 + (levelNum - 1) * 0.15;
    
    // Shuffle duration: scales from 4500ms to 7500ms
    shuffleDuration = 4500 + (levelNum - 1) * 160;
    
    // Scale timer dynamically
    let levelTime = 0;
    if (levelNum >= 6) {
      levelTime = Math.max(20, 60 - (levelNum - 6) * 3); // Level 6 = 60s, Level 20 = 18s (clamps to 20s)
    }
    
    engine.timeLimit = levelTime;
    engine.state.timeLeft = levelTime;
    engine.updateTimerUI();
    
    // Always start a level with timer stopped (timer runs during selection phase only)
    engine.stopTimer();

    selectedTargetsCount = 0;
    targetsFoundEl.textContent = '0';
    targetsTotalEl.textContent = targetCount.toString();
    
    generateBalls();
    startMemorizePhase();
  }

  // Generate non-overlapping balls
  function generateBalls() {
    balls = [];
    for (let i = 0; i < ballCount; i++) {
      let x, y, overlap;
      let retries = 0;
      do {
        overlap = false;
        x = Math.random() * (canvas.width - ballRadius * 2) + ballRadius;
        y = Math.random() * (canvas.height - ballRadius * 2) + ballRadius;
        
        // Check collision with already added balls
        for (let j = 0; j < balls.length; j++) {
          const dist = Math.hypot(x - balls[j].x, y - balls[j].y);
          if (dist < ballRadius * 2.5) {
            overlap = true;
            break;
          }
        }
        retries++;
      } while (overlap && retries < 100);

      // Random angles
      const angle = Math.random() * Math.PI * 2;
      balls.push({
        id: i,
        x: x,
        y: y,
        vx: Math.cos(angle) * moveSpeed,
        vy: Math.sin(angle) * moveSpeed,
        isTarget: i < targetCount, // First targetCount balls are targets
        isClicked: false,
        isCorrect: false
      });
    }
  }

  // Phase Transitions
  function startMemorizePhase() {
    gamePhase = 'memorize';
    canvas.classList.remove('clickable');
    statusBanner.textContent = 'Memorize the Target Balls!';
    statusBanner.style.color = 'var(--color-success)';
    
    if (phaseTimer) clearTimeout(phaseTimer);
    phaseTimer = setTimeout(() => {
      startShufflePhase();
    }, 2500);

    loop();
  }

  function startShufflePhase() {
    gamePhase = 'shuffling';
    statusBanner.textContent = 'Watch Closely... Track Them!';
    statusBanner.style.color = 'var(--theme-accent)';
    
    if (phaseTimer) clearTimeout(phaseTimer);
    phaseTimer = setTimeout(() => {
      startSelectPhase();
    }, shuffleDuration);
  }

  function startSelectPhase() {
    gamePhase = 'select';
    canvas.classList.add('clickable');
    statusBanner.textContent = 'Click the Target Balls!';
    statusBanner.style.color = 'var(--color-info)';
    
    if (engine.timeLimit > 0) {
      engine.startTimer();
    }
  }

  // Canvas Draw Helper
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw balls
    balls.forEach(ball => {
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);

      // Styling based on phase and state
      if (gamePhase === 'memorize') {
        if (ball.isTarget) {
          ctx.fillStyle = 'rgba(16, 185, 129, 0.8)';
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 4;
          ctx.shadowColor = '#34d399';
          ctx.shadowBlur = 12;
        } else {
          ctx.fillStyle = '#475569';
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 2;
        }
      } else if (gamePhase === 'shuffling') {
        // Hide identities during shuffling
        ctx.fillStyle = '#475569';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
      } else if (gamePhase === 'select') {
        if (ball.isClicked) {
          if (ball.isTarget) {
            ctx.fillStyle = '#10b981';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 4;
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 12;
          } else {
            ctx.fillStyle = '#ef4444';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 4;
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 12;
          }
        } else {
          // Unclicked state
          ctx.fillStyle = '#475569';
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 2;
        }
      }

      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0; // reset
      
      // If selected target, draw a tiny checkmark inside
      if (gamePhase === 'select' && ball.isClicked && ball.isTarget) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Outfit';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✓', ball.x, ball.y);
      }
      
      // If wrong selection, draw cross
      if (gamePhase === 'select' && ball.isClicked && !ball.isTarget) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Outfit';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✗', ball.x, ball.y);
      }
    });
  }

  // Animation Loop
  function loop() {
    if (!engine.state.isPlaying || engine.state.isPaused) return;

    if (gamePhase === 'shuffling') {
      // Update positions
      balls.forEach(ball => {
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Border bounce
        if (ball.x - ballRadius < 0) {
          ball.x = ballRadius;
          ball.vx *= -1;
        } else if (ball.x + ballRadius > canvas.width) {
          ball.x = canvas.width - ballRadius;
          ball.vx *= -1;
        }

        if (ball.y - ballRadius < 0) {
          ball.y = ballRadius;
          ball.vy *= -1;
        } else if (ball.y + ballRadius > canvas.height) {
          ball.y = canvas.height - ballRadius;
          ball.vy *= -1;
        }
        
        // Simple ball-to-ball repulsion to look nice
        balls.forEach(other => {
          if (ball.id !== other.id) {
            const dist = Math.hypot(ball.x - other.x, ball.y - other.y);
            if (dist < ballRadius * 2) {
              // Elastic-like bounce
              const dx = (other.x - ball.x) / dist;
              const dy = (other.y - ball.y) / dist;
              
              // Reverse velocities relative to normal
              const normalX = dx;
              const normalY = dy;
              
              const p = 2 * (ball.vx * normalX + ball.vy * normalY - other.vx * normalX - other.vy * normalY) / 2;
              
              ball.vx -= p * normalX;
              ball.vy -= p * normalY;
              other.vx += p * normalX;
              other.vy += p * normalY;
              
              // Push apart slightly to prevent overlapping stickiness
              const overlap = ballRadius * 2 - dist;
              ball.x -= normalX * (overlap / 2);
              ball.y -= normalY * (overlap / 2);
              other.x += normalX * (overlap / 2);
              other.y += normalY * (overlap / 2);
            }
          }
        });
      });
    }

    draw();
    animFrameId = requestAnimationFrame(loop);
  }

  // Helper to handle snapping taps and preventing drag click triggers on canvas
  function bindTapHandler(canvasElement, handler) {
    let pointerStart = null;
    
    canvasElement.addEventListener('pointerdown', (e) => {
      pointerStart = {
        x: e.clientX,
        y: e.clientY,
        time: Date.now()
      };
    });
    
    canvasElement.addEventListener('pointerup', (e) => {
      if (!pointerStart) return;
      const dx = e.clientX - pointerStart.x;
      const dy = e.clientY - pointerStart.y;
      const dist = Math.hypot(dx, dy);
      const elapsed = Date.now() - pointerStart.time;
      
      if (dist < 10 && elapsed < 300) {
        handler({
          clientX: pointerStart.x,
          clientY: pointerStart.y,
          target: e.target
        });
      }
      pointerStart = null;
    });
    
    canvasElement.addEventListener('pointercancel', () => {
      pointerStart = null;
    });
  }

  // Canvas Click Handler
  bindTapHandler(canvas, (e) => {
    if (gamePhase !== 'select' || !engine.state.isPlaying || engine.state.isPaused) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Check which ball was clicked
    balls.forEach(ball => {
      if (ball.isClicked) return; // already clicked

      const dist = Math.hypot(clickX - ball.x, clickY - ball.y);
      if (dist <= ballRadius) {
        ball.isClicked = true;
        
        if (ball.isTarget) {
          selectedTargetsCount++;
          engine.updateScore(150);
          targetsFoundEl.textContent = selectedTargetsCount.toString();
          
          if (selectedTargetsCount === targetCount) {
            // Found all targets! Advance level
            setTimeout(() => {
              if (engine.state.level < config.maxLevels) {
                engine.updateScore(400); // Level bonus
                engine.setLevel(engine.state.level + 1);
                initLevel(engine.state.level);
              } else {
                engine.updateScore(1000); // Win clear bonus
                engine.end('win');
              }
            }, 1000);
          }
        } else {
          // Clicked distractor -> Lose a life
          engine.decrementLives();
        }
      }
    });
  });

  // Action listeners
  btnPause.addEventListener('click', () => engine.pause());
  btnResume.addEventListener('click', () => engine.resume());
  btnRestart.addEventListener('click', () => engine.start());
  btnRetry.addEventListener('click', () => engine.start());

  // Start engine automatically on load
  engine.start();
});
