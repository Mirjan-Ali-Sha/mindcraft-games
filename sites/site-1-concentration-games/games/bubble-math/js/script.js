/* Bubble Math - Game Logic */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('bubble-canvas');
  const ctx = canvas.getContext('bubble-canvas') ? canvas.getContext('bubble-canvas') : canvas.getContext('2d');
  
  // UI Bindings
  const pairsPoppedEl = document.getElementById('pairs-popped');
  const pairsTotalEl = document.getElementById('pairs-total');
  const statusBanner = document.getElementById('game-status-banner');
  
  // Overlays
  const overlayPause = document.getElementById('overlay-pause');
  const overlayGameOver = document.getElementById('overlay-gameover');
  const gameoverTitle = document.getElementById('gameover-title');
  const gameoverDesc = document.getElementById('gameover-desc');
  const finalScoreEl = document.getElementById('final-score');
  const bestScoreEl = document.getElementById('best-score');
  
  // Controls
  const btnPause = document.getElementById('btn-pause');
  const btnRestart = document.getElementById('btn-restart');
  const btnResume = document.getElementById('btn-resume');
  const btnRetry = document.getElementById('btn-retry');

  // Game Engine settings
  const config = {
    gameId: 'bubble-math',
    timeLimit: 0,
    maxLevels: 20,
    initLives: 3
  };

  // Bubble states
  let bubbles = [];
  let particles = [];
  const bubbleRadius = 32;
  let firstSelected = null;
  let animFrameId = null;
  
  // Level specs
  let maxBubblesOnBoard = 6;
  let speedMultiplier = 1.0;
  let poppedPairsCount = 0;
  let targetPairsNeeded = 5;

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
      gameoverTitle.textContent = '🎉 Math Genius!';
      gameoverTitle.style.color = 'var(--color-success)';
      gameoverDesc.textContent = `Fantastic! You popped all math pairs and finished every level before time ran out!`;
    } else if (reason === 'lives') {
      gameoverTitle.textContent = '💔 Out of Lives!';
      gameoverTitle.style.color = 'var(--color-danger)';
      gameoverDesc.textContent = `You clicked too many wrong pairs. Focus on pairs that add up to 10!`;
    } else {
      gameoverTitle.textContent = "⏱ Time's Up!";
      gameoverTitle.style.color = 'var(--color-danger)';
      gameoverDesc.textContent = `Time ran out. Speed up your mental addition and try again!`;
    }
  });

  // Level Setup
  function initLevel(levelNum) {
    maxBubblesOnBoard = Math.min(12, 6 + Math.floor((levelNum - 1) / 5) * 2);
    speedMultiplier = 0.8 + (levelNum - 1) * 0.08;
    targetPairsNeeded = Math.min(12, 3 + Math.floor((levelNum - 1) / 2));
    
    let levelTime = 0;
    if (levelNum >= 6) {
      levelTime = Math.max(25, 60 - Math.floor((levelNum - 6) * 2.5)); // Level 6 = 60s, Level 20 = 25s
    }
    
    engine.timeLimit = levelTime;
    engine.state.timeLeft = levelTime;
    engine.updateTimerUI();
    
    if (levelTime <= 0) {
      engine.stopTimer();
    } else {
      engine.startTimer();
    }

    poppedPairsCount = 0;
    firstSelected = null;
    particles = [];
    
    pairsPoppedEl.textContent = '0';
    pairsTotalEl.textContent = targetPairsNeeded.toString();
    
    statusBanner.textContent = 'Pop pairs that add up to 10!';
    statusBanner.style.color = 'var(--theme-accent)';
    
    generateInitialBubbles();
    loop();
  }

  // Create starting bubbles in complementary pairs summing to 10
  function generateInitialBubbles() {
    bubbles = [];
    const pairsCount = maxBubblesOnBoard / 2;
    
    for (let i = 0; i < pairsCount; i++) {
      spawnPair();
    }
  }

  // Helper to spawn a matching pair of bubbles
  function spawnPair() {
    const num1 = Math.floor(Math.random() * 9) + 1; // 1..9
    const num2 = 10 - num1; // always sums to 10
    
    const hue1 = Math.floor(Math.random() * 360);
    const hue2 = (hue1 + 180) % 360; // Complementary colors
    
    createBubble(num1, hue1);
    createBubble(num2, hue2);
  }

  // Helper to add single bubble to random non-overlapping coordinates
  function createBubble(num, hue) {
    let x, y, overlap;
    let retries = 0;
    
    do {
      overlap = false;
      x = Math.random() * (canvas.width - bubbleRadius * 3) + bubbleRadius * 1.5;
      y = Math.random() * (canvas.height - bubbleRadius * 3) + bubbleRadius * 1.5;
      
      for (let i = 0; i < bubbles.length; i++) {
        const dist = Math.hypot(x - bubbles[i].x, y - bubbles[i].y);
        if (dist < bubbleRadius * 2.2) {
          overlap = true;
          break;
        }
      }
      retries++;
    } while (overlap && retries < 100);

    const angle = Math.random() * Math.PI * 2;
    const speed = (0.5 + Math.random() * 0.8) * speedMultiplier;
    
    bubbles.push({
      id: Math.random(), // Unique float id
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: bubbleRadius,
      number: num,
      color: `hsla(${hue}, 85%, 60%, 0.65)`,
      borderColor: `hsla(${hue}, 90%, 75%, 0.95)`,
      isSelected: false,
      isPopping: false,
      scale: 1.0,
      opacity: 1.0
    });
  }

  // Particle explosion logic
  function spawnParticles(x, y, color) {
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 3,
        color: color,
        alpha: 1.0,
        life: 0.92 // decay factor
      });
    }
  }

  // Render elements
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Particles
    particles.forEach((p, idx) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.restore();

      // Update positions
      p.x += p.vx;
      p.y += p.vy;
      p.alpha *= p.life;

      if (p.alpha <= 0.05) {
        particles.splice(idx, 1);
      }
    });

    // Draw Bubbles
    bubbles.forEach(b => {
      ctx.save();
      ctx.globalAlpha = b.opacity;
      
      // Outer halo glow if selected
      if (b.isSelected) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius * b.scale + 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fill();
      }

      // Main Glass Bubble Body
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius * b.scale, 0, Math.PI * 2);
      
      // Glossy radial gradient fill
      const radialGrad = ctx.createRadialGradient(
        b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.1,
        b.x, b.y, b.radius
      );
      radialGrad.addColorStop(0, '#ffffff');
      radialGrad.addColorStop(0.2, b.color);
      radialGrad.addColorStop(1, 'rgba(15, 23, 42, 0.3)');
      
      ctx.fillStyle = radialGrad;
      ctx.strokeStyle = b.borderColor;
      ctx.lineWidth = b.isSelected ? 3 : 2;
      
      ctx.shadowColor = b.borderColor;
      ctx.shadowBlur = b.isSelected ? 15 : 6;
      
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // Bubble specular highlight shine arc
      ctx.beginPath();
      ctx.arc(b.x - b.radius * 0.35, b.y - b.radius * 0.35, b.radius * 0.3, Math.PI * 1.1, Math.PI * 1.6);
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Number text
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.round(22 * b.scale)}px Outfit`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Slight shadow behind text for legibility
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
      ctx.fillText(b.number.toString(), b.x, b.y);
      
      ctx.restore();
    });
  }

  // Main Loop
  function loop() {
    if (!engine.state.isPlaying || engine.state.isPaused) return;

    // Update coordinates & collisions
    bubbles.forEach(b => {
      if (b.isPopping) {
        b.scale += 0.12; // burst out
        b.opacity -= 0.15;
        if (b.opacity <= 0.05) {
          // Remove popped bubble
          bubbles = bubbles.filter(item => item.id !== b.id);
        }
        return;
      }

      b.x += b.vx;
      b.y += b.vy;

      // Wall boundaries bounce
      if (b.x - b.radius < 0) {
        b.x = b.radius;
        b.vx *= -1;
      } else if (b.x + b.radius > canvas.width) {
        b.x = canvas.width - b.radius;
        b.vx *= -1;
      }

      if (b.y - b.radius < 0) {
        b.y = b.radius;
        b.vy *= -1;
      } else if (b.y + b.radius > canvas.height) {
        b.y = canvas.height - b.radius;
        b.vy *= -1;
      }

      // Ball to ball elastic rebound collisions
      bubbles.forEach(other => {
        if (b.id !== other.id && !other.isPopping) {
          const dist = Math.hypot(b.x - other.x, b.y - other.y);
          if (dist < b.radius + other.radius) {
            const dx = (other.x - b.x) / dist;
            const dy = (other.y - b.y) / dist;
            
            // Reverse velocity components relative to standard normal plane
            const normalX = dx;
            const normalY = dy;
            
            const p = 2 * (b.vx * normalX + b.vy * normalY - other.vx * normalX - other.vy * normalY) / 2;
            
            b.vx -= p * normalX;
            b.vy -= p * normalY;
            other.vx += p * normalX;
            other.vy += p * normalY;
            
            // Un-overlap positions
            const overlap = (b.radius + other.radius) - dist;
            b.x -= normalX * (overlap / 2);
            b.y -= normalY * (overlap / 2);
            other.x += normalX * (overlap / 2);
            other.y += normalY * (overlap / 2);
          }
        }
      });
    });

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
        handler(e);
      }
      pointerStart = null;
    });
    
    canvasElement.addEventListener('pointercancel', () => {
      pointerStart = null;
    });
  }

  // Click Handler
  bindTapHandler(canvas, (e) => {
    if (!engine.state.isPlaying || engine.state.isPaused) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Find clicked bubble
    let clickedBubble = null;
    for (let i = 0; i < bubbles.length; i++) {
      const b = bubbles[i];
      if (b.isPopping) continue;
      const dist = Math.hypot(clickX - b.x, clickY - b.y);
      if (dist <= b.radius) {
        clickedBubble = b;
        break;
      }
    }

    if (!clickedBubble) return;

    if (!firstSelected) {
      // Pick first bubble
      firstSelected = clickedBubble;
      firstSelected.isSelected = true;
    } else {
      // Pick second bubble
      if (firstSelected.id === clickedBubble.id) {
        // Toggle selection off if same bubble
        firstSelected.isSelected = false;
        firstSelected = null;
      } else {
        // Check sum matching exactly 10
        const sum = firstSelected.number + clickedBubble.number;
        
        if (sum === 10) {
          // Success Pop!
          firstSelected.isPopping = true;
          clickedBubble.isPopping = true;
          
          spawnParticles(firstSelected.x, firstSelected.y, firstSelected.borderColor);
          spawnParticles(clickedBubble.x, clickedBubble.y, clickedBubble.borderColor);
          
          engine.updateScore(100);
          poppedPairsCount++;
          pairsPoppedEl.textContent = poppedPairsCount.toString();
          
          // Clear selections
          firstSelected = null;
          
          // Spawn replacements shortly after
          setTimeout(() => {
            if (engine.state.isPlaying) {
              spawnPair();
            }
          }, 300);

          // Check level complete
          if (poppedPairsCount === targetPairsNeeded) {
            handleLevelComplete();
          }
        } else {
          // Penalty Mismatch!
          firstSelected.isSelected = false;
          clickedBubble.isSelected = false;
          
          // Shake effect visual hint
          firstSelected = null;
          engine.decrementLives();
          
          statusBanner.textContent = `Mismatch! ${sum} does not equal 10.`;
          statusBanner.style.color = 'var(--color-danger)';
          setTimeout(() => {
            if (engine.state.isPlaying && !engine.state.isPaused) {
              statusBanner.textContent = 'Pop pairs that add up to 10!';
              statusBanner.style.color = 'var(--theme-accent)';
            }
          }, 1500);
        }
      }
    }
  });

  // Next level / Game win transitions
  function handleLevelComplete() {
    setTimeout(() => {
      if (engine.state.level < config.maxLevels) {
        const timeBonus = engine.state.timeLeft * 10;
        engine.updateScore(300 + timeBonus); // Level clear bonus
        engine.setLevel(engine.state.level + 1);
        initLevel(engine.state.level);
      } else {
        const timeBonus = engine.state.timeLeft * 20;
        engine.updateScore(1000 + timeBonus); // Game clear bonus
        engine.end('win');
      }
    }, 600);
  }

  // Control actions
  btnPause.addEventListener('click', () => engine.pause());
  btnResume.addEventListener('click', () => engine.resume());
  btnRestart.addEventListener('click', () => engine.start());
  btnRetry.addEventListener('click', () => engine.start());

  // Auto start on load
  engine.start();
});
