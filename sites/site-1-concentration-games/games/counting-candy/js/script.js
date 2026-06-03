/* Counting Candy - Game Logic */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('candy-canvas');
  const ctx = canvas.getContext('2d');
  
  // UI Bindings
  const queryEmoji = document.getElementById('query-emoji');
  const questionIndexEl = document.getElementById('question-index');
  const levelValEl = document.getElementById('level-val');
  const choicesContainer = document.getElementById('choices-container');
  
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

  // Game configuration
  const config = {
    gameId: 'counting-candy',
    timeLimit: 0,
    maxLevels: 20,
    initLives: 3
  };

  // Candy pools
  const candyPool = ['🍬', '🍭', '🍫', '🍩'];
  let activeCandies = []; // list of { x, y, vx, vy, emoji, size, angle }
  let targetEmoji = '🍭';
  let targetCount = 0;
  
  // Question tracking
  let currentQuestionIdx = 0; // 0..2
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
      gameoverTitle.textContent = '🎉 Master Scanner!';
      gameoverTitle.style.color = 'var(--color-success)';
      gameoverDesc.textContent = `Excellent concentration! You scanned and counted all candies correctly.`;
    } else if (reason === 'lives') {
      gameoverTitle.textContent = '💔 Out of Lives!';
      gameoverTitle.style.color = 'var(--color-danger)';
      gameoverDesc.textContent = `You clicked the wrong numbers. Focus and try again!`;
    } else {
      gameoverTitle.textContent = "⏱ Time's Up!";
      gameoverTitle.style.color = 'var(--color-danger)';
      gameoverDesc.textContent = `Time ran out. Train your scanning speed and try again!`;
    }
  });

  // Level Setup
  function initLevel(levelNum) {
    currentQuestionIdx = 0;
    
    // Scale timer dynamically
    let levelTime = 0;
    if (levelNum >= 6) {
      levelTime = Math.max(30, 90 - (levelNum - 6) * 4); // Level 6 = 90s, Level 20 = 34s
    }
    
    engine.timeLimit = levelTime;
    engine.state.timeLeft = levelTime;
    engine.updateTimerUI();
    
    if (levelTime <= 0) {
      engine.stopTimer();
    } else {
      engine.startTimer();
    }
    
    loadQuestion(levelNum, currentQuestionIdx);
  }

  // Load a single question
  function loadQuestion(levelNum, qIdx) {
    questionIndexEl.textContent = (qIdx + 1).toString();
    levelValEl.textContent = levelNum.toString();
    
    // Choose a target candy type
    targetEmoji = candyPool[Math.floor(Math.random() * candyPool.length)];
    queryEmoji.textContent = targetEmoji;
    
    generateCandyScatter(levelNum);
    generateChoiceButtons();
    
    if (qIdx === 0 && levelNum === 1) {
      loop(); // start animation loop if first round
    }
  }

  // Populate candies randomly
  function generateCandyScatter(levelNum) {
    activeCandies = [];
    targetCount = 0;
    
    let totalItemsCount = Math.min(42, 10 + Math.floor((levelNum - 1) * 1.7));
    let minTarget = 2 + Math.floor((levelNum - 1) / 4);
    let maxTarget = 4 + Math.floor((levelNum - 1) * 0.5);
    
    // Predetermine target count
    targetCount = Math.floor(Math.random() * (maxTarget - minTarget + 1)) + minTarget;
    if (targetCount >= totalItemsCount) {
      targetCount = totalItemsCount - 2;
    }
    
    // Generate target items
    for (let i = 0; i < targetCount; i++) {
      createCandyItem(targetEmoji, levelNum);
    }
    
    // Generate distractor items
    const distractors = candyPool.filter(c => c !== targetEmoji);
    const distractorCount = totalItemsCount - targetCount;
    for (let i = 0; i < distractorCount; i++) {
      const randDistractor = distractors[Math.floor(Math.random() * distractors.length)];
      createCandyItem(randDistractor, levelNum);
    }
  }

  // Create single candy coordinate set
  function createCandyItem(emoji, levelNum) {
    const size = 26 + Math.random() * 10;
    const x = Math.random() * (canvas.width - size * 2) + size;
    const y = Math.random() * (canvas.height - size * 2) + size;
    const angle = Math.random() * Math.PI * 2;
    
    // Floating speeds
    const speed = (0.2 + Math.random() * 0.3) * (1.0 + (levelNum - 1) * 0.08);
    const moveAngle = Math.random() * Math.PI * 2;

    activeCandies.push({
      x: x,
      y: y,
      vx: Math.cos(moveAngle) * speed,
      vy: Math.sin(moveAngle) * speed,
      emoji: emoji,
      size: size,
      angle: angle,
      isTarget: emoji === targetEmoji,
      highlight: false
    });
  }

  // Multiple Choice layout options
  function generateChoiceButtons() {
    choicesContainer.innerHTML = '';
    
    // Choices should contain correct, correct-1, correct+1 (or random offset)
    const offset = Math.random() > 0.5 ? 1 : 2;
    const choice1 = targetCount;
    let choice2 = Math.max(1, targetCount - offset);
    let choice3 = targetCount + offset;
    
    // Corner cases checks
    if (choice2 === choice1) choice2 = choice1 + 2;
    
    const choices = [choice1, choice2, choice3];
    // Shuffle choices
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    
    // Render choice buttons
    choices.forEach(val => {
      const btn = document.createElement('button');
      btn.className = 'btn btn--secondary choice-btn';
      btn.textContent = val.toString();
      
      btn.addEventListener('click', () => handleChoiceSelect(btn, val));
      choicesContainer.appendChild(btn);
    });
  }

  // Click choice option
  function handleChoiceSelect(btn, selectedVal) {
    if (!engine.state.isPlaying || engine.state.isPaused) return;

    // Lock options
    const optionBtns = choicesContainer.querySelectorAll('button');
    optionBtns.forEach(b => b.disabled = true);

    const isCorrect = selectedVal === targetCount;

    if (isCorrect) {
      btn.classList.remove('btn--secondary');
      btn.classList.add('btn--primary');
      btn.style.background = 'var(--color-success)';
      btn.style.borderColor = 'var(--color-success)';
      
      // Highlight correct candy icons on canvas
      activeCandies.forEach(c => {
        if (c.isTarget) c.highlight = true;
      });

      engine.updateScore(150);
      
      setTimeout(() => {
        advanceQuestion();
      }, 1000);
    } else {
      btn.classList.remove('btn--secondary');
      btn.style.background = 'var(--color-danger)';
      btn.style.borderColor = 'var(--color-danger)';
      
      // Highlight correct button
      optionBtns.forEach(b => {
        if (parseInt(b.textContent) === targetCount) {
          b.classList.remove('btn--secondary');
          b.classList.add('btn--primary');
          b.style.background = 'var(--color-success)';
          b.style.borderColor = 'var(--color-success)';
        }
      });

      // Highlight target candy icons on canvas to show what was correct
      activeCandies.forEach(c => {
        if (c.isTarget) c.highlight = true;
      });

      engine.decrementLives();
      
      setTimeout(() => {
        if (engine.state.lives > 0) {
          advanceQuestion();
        }
      }, 1200);
    }
  }

  // Advance question or level
  function advanceQuestion() {
    currentQuestionIdx++;
    
    if (currentQuestionIdx < 3) {
      loadQuestion(engine.state.level, currentQuestionIdx);
    } else {
      // Completed level
      setTimeout(() => {
        if (engine.state.level < config.maxLevels) {
          const timeBonus = engine.state.timeLeft * 10;
          engine.updateScore(400 + timeBonus); // level clear bonus
          engine.setLevel(engine.state.level + 1);
          initLevel(engine.state.level);
        } else {
          const timeBonus = engine.state.timeLeft * 20;
          engine.updateScore(1000 + timeBonus); // game clear bonus
          engine.end('win');
        }
      }, 400);
    }
  }

  // Draw loop
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Scattered Candies
    activeCandies.forEach(c => {
      ctx.save();
      
      // Highlight rings around correct targets when clicked
      if (c.highlight) {
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.size * 0.8, 0, Math.PI * 2);
        ctx.strokeStyle = 'var(--color-success)';
        ctx.lineWidth = 3;
        ctx.shadowColor = 'rgba(16, 185, 129, 0.5)';
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0; // reset
      }

      ctx.translate(c.x, c.y);
      ctx.rotate(c.angle);
      
      ctx.font = `${c.size}px Arial`; // Standard emoji render
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      ctx.fillText(c.emoji, 0, 0);
      
      ctx.restore();
    });
  }

  // Animation physics loop
  function loop() {
    if (!engine.state.isPlaying || engine.state.isPaused) return;

    // Slowly move candies
    activeCandies.forEach(c => {
      c.x += c.vx;
      c.y += c.vy;

      // Bounce limits
      const buffer = c.size * 0.6;
      if (c.x - buffer < 0 || c.x + buffer > canvas.width) {
        c.vx *= -1;
      }
      if (c.y - buffer < 0 || c.y + buffer > canvas.height) {
        c.vy *= -1;
      }
    });

    draw();
    animFrameId = requestAnimationFrame(loop);
  }

  // Controls UI Action Binds
  btnPause.addEventListener('click', () => engine.pause());
  btnResume.addEventListener('click', () => engine.resume());
  btnRestart.addEventListener('click', () => engine.start());
  btnRetry.addEventListener('click', () => engine.start());

  // Start engine automatically on load
  engine.start();
});
