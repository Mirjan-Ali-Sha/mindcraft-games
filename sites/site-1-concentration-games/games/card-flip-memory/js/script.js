/* Card Flip Memory - Game Logic */

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('cards-grid');
  
  // UI Bindings
  const levelValEl = document.getElementById('level-val');
  const questionIndexEl = document.getElementById('question-index');
  const queryCard = document.getElementById('query-card');
  const queryEmoji = document.getElementById('query-emoji');
  const memorizeBanner = document.getElementById('memorize-banner');
  
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

  // Game config
  const config = {
    gameId: 'card-flip-memory',
    timeLimit: 0,
    maxLevels: 20,
    initLives: 3
  };

  // Emojis list
  const emojiPool = ['🍎', '🍉', '🍇', '🍒', '🍍', '🥥', '🥝', '🥑', '🍋', '🍌', '🍑', '🥭', '🌶', '🌽', '🍟', '🍕'];
  let activeEmojis = []; // list of emojis on board
  let targetEmojiVal = '';
  
  // State variables
  let currentQuestionIdx = 0; // 0..2
  let memorizeDuration = 3000;
  let lockGrid = true;
  let memorizeTimer = null;
  let cardCount = 4;

  const engine = new GameEngine(config);

  // Hook Engine event callbacks
  engine.on('onStart', (state) => {
    overlayPause.classList.remove('overlay--active');
    overlayGameOver.classList.remove('overlay--active');
    initLevel(state.level);
  });

  engine.on('onPause', () => {
    overlayPause.classList.add('overlay--active');
    stopMemorizeCountdown();
  });

  engine.on('onResume', () => {
    overlayPause.classList.remove('overlay--active');
    if (memorizeBanner.style.display !== 'none') {
      startMemorizeCountdown(memorizeDuration);
    }
  });

  engine.on('onGameOver', (state, reason) => {
    stopMemorizeCountdown();
    overlayGameOver.classList.add('overlay--active');
    finalScoreEl.textContent = state.score;
    bestScoreEl.textContent = state.highScore;
    
    if (reason === 'win') {
      gameoverTitle.textContent = '🎉 Spatial Visual Genius!';
      gameoverTitle.style.color = 'var(--color-success)';
      gameoverDesc.textContent = `Sensational recall! You successfully mapped and pointed out every hidden card.`;
    } else if (reason === 'lives') {
      gameoverTitle.textContent = '💔 Out of Lives!';
      gameoverTitle.style.color = 'var(--color-danger)';
      gameoverDesc.textContent = `You clicked too many wrong cards. Train your grid focus and try again!`;
    } else {
      gameoverTitle.textContent = "⏱ Time's Up!";
      gameoverTitle.style.color = 'var(--color-danger)';
      gameoverDesc.textContent = `Time ran out. Speed up your visual mapping and try again!`;
    }
  });

  // Level Setup
  function initLevel(levelNum) {
    let gridCols = 2;
    if (levelNum === 1 || levelNum === 2) {
      cardCount = 4; gridCols = 2;
    } else if (levelNum === 3 || levelNum === 4) {
      cardCount = 6; gridCols = 3;
    } else if (levelNum === 5 || levelNum === 6) {
      cardCount = 8; gridCols = 4;
    } else if (levelNum <= 9) {
      cardCount = 9; gridCols = 3;
    } else if (levelNum <= 12) {
      cardCount = 12; gridCols = 4;
    } else if (levelNum <= 16) {
      cardCount = 15; gridCols = 5;
    } else {
      cardCount = 16; gridCols = 4;
    }
    
    memorizeDuration = 2500 + cardCount * 350;

    grid.style.gridTemplateColumns = `repeat(${gridCols}, 1fr)`;
    levelValEl.textContent = levelNum.toString();
    currentQuestionIdx = 0;
    
    // Scale timer dynamically
    let levelTime = 0;
    if (levelNum >= 6) {
      levelTime = Math.max(8, 20 - (levelNum - 6) * 0.9); // Level 6 = 20s, Level 20 = 8s
    }
    
    engine.timeLimit = levelTime;
    engine.state.timeLeft = levelTime;
    engine.updateTimerUI();
    
    engine.stopTimer();
    
    loadQuestion(levelNum, currentQuestionIdx);
  }

  // Load a single question
  function loadQuestion(levelNum, qIdx) {
    questionIndexEl.textContent = (qIdx + 1).toString();
    lockGrid = true;
    
    // Choose N unique random emojis
    const shuffledPool = [...emojiPool];
    shuffle(shuffledPool);
    activeEmojis = shuffledPool.slice(0, cardCount);
    
    // Render grid cards in face-up state (.flipped)
    grid.innerHTML = '';
    activeEmojis.forEach((emoji, index) => {
      const card = document.createElement('div');
      card.className = 'card flipped';
      card.dataset.emoji = emoji;
      card.dataset.index = index;
      
      card.innerHTML = `
        <div class="card-inner">
          <div class="card-front">${emoji}</div>
          <div class="card-back">❓</div>
        </div>
      `;
      
      card.addEventListener('click', () => handleCardClick(card));
      grid.appendChild(card);
    });

    // Start memorize phase
    queryCard.style.display = 'none';
    memorizeBanner.style.display = 'block';
    
    startMemorizeCountdown(memorizeDuration);
  }

  // Count down memorization timer
  function startMemorizeCountdown(duration) {
    stopMemorizeCountdown();
    
    const startTime = Date.now();
    const progressFill = document.getElementById('timer-progress');
    const timerVal = document.getElementById('timer-val');

    memorizeTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      const remainingSecs = Math.max(0, Math.ceil((duration - elapsed) / 1000));
      
      if (progressFill) progressFill.style.width = `${pct}%`;
      if (timerVal) timerVal.textContent = `00:${remainingSecs.toString().padStart(2, '0')}`;
      
      if (elapsed >= duration) {
        stopMemorizeCountdown();
        startQueryPhase();
      }
    }, 100);
  }

  function stopMemorizeCountdown() {
    if (memorizeTimer) {
      clearInterval(memorizeTimer);
      memorizeTimer = null;
    }
  }

  // Enter query phase (flip faced down, set target)
  function startQueryPhase() {
    // Flip all cards face down
    const cards = grid.querySelectorAll('.card');
    cards.forEach(c => c.classList.remove('flipped'));
    
    // Wait for card flip transition animation (500ms) before selecting target
    setTimeout(() => {
      if (!engine.state.isPlaying || engine.state.isPaused) return;
      
      // Select target emoji from active list
      targetEmojiVal = activeEmojis[Math.floor(Math.random() * activeEmojis.length)];
      queryEmoji.textContent = targetEmojiVal;
      
      // Toggle banner layouts
      memorizeBanner.style.display = 'none';
      queryCard.style.display = 'flex';
      
      // Enable clicking
      lockGrid = false;
      
      if (engine.timeLimit > 0) {
        engine.startTimer();
        engine.updateTimerUI();
      } else {
        const progressFill = document.getElementById('timer-progress');
        if (progressFill) progressFill.style.width = '100%';
        const timerVal = document.getElementById('timer-val');
        if (timerVal) timerVal.textContent = '∞';
      }
    }, 500);
  }

  // Click card handler
  function handleCardClick(card) {
    if (lockGrid || !engine.state.isPlaying || engine.state.isPaused) return;
    if (card.classList.contains('flipped')) return;

    lockGrid = true;
    engine.stopTimer();
    card.classList.add('flipped');

    const isMatch = card.dataset.emoji === targetEmojiVal;

    if (isMatch) {
      card.classList.add('correct');
      engine.updateScore(150);
      
      setTimeout(() => {
        advanceQuestion();
      }, 1200);
    } else {
      card.classList.add('wrong');
      
      // Reveal correct card
      const cards = grid.querySelectorAll('.card');
      cards.forEach(c => {
        if (c.dataset.emoji === targetEmojiVal) {
          c.classList.add('flipped');
          c.classList.add('correct');
        }
      });

      engine.decrementLives();
      
      setTimeout(() => {
        if (engine.state.lives > 0) {
          advanceQuestion();
        }
      }, 1500);
    }
  }

  // Go to next question or level
  function advanceQuestion() {
    currentQuestionIdx++;
    
    if (currentQuestionIdx < 3) {
      loadQuestion(engine.state.level, currentQuestionIdx);
    } else {
      // Completed level!
      setTimeout(() => {
        if (engine.state.level < config.maxLevels) {
          engine.updateScore(400); // level bonus
          engine.setLevel(engine.state.level + 1);
          initLevel(engine.state.level);
        } else {
          engine.updateScore(1000); // game win bonus
          engine.end('win');
        }
      }, 400);
    }
  }

  // Fisher-Yates
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Control buttons
  btnPause.addEventListener('click', () => engine.pause());
  btnResume.addEventListener('click', () => engine.resume());
  btnRestart.addEventListener('click', () => engine.start());
  btnRetry.addEventListener('click', () => engine.start());

  // Auto start on load
  engine.start();
});
