/* Match Pairs - Game Logic */

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('card-grid');
  
  // UI Bindings
  const pairsMatchedEl = document.getElementById('pairs-matched');
  const pairsTotalEl = document.getElementById('pairs-total');
  const movesEl = document.getElementById('moves-val');
  
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
    gameId: 'match-pairs',
    timeLimit: 0,
    maxLevels: 20,
    initLives: 1 // Lives not strictly used here, we use timer & moves
  };

  // Card items pool (120 visually distinct premium emojis)
  const emojiPool = [
    // Fruits & Food (30)
    '🍎', '🍌', '🍒', '🍇', '🍉', '🍓', '🍍', '🥥', '🥝', '🍊', 
    '🍋', '🥭', '🥑', '🥦', '🥕', '🌽', '🌶️', '🥔', '🥖', '🥨', 
    '🧀', '🥞', '🍳', '🍕', '🍣', '🍦', '🍩', '🍪', '🍔', '🍟',
    // Sweet Desserts & Extra Food (10)
    '🧁', '🍰', '🍫', '🍬', '🍭', '🍯', '🍿', '🌭', '🌮', '🥟',
    // Animals & Creatures (30)
    '🐱', '🐶', '🦁', '🐯', '🐻', '🐼', '🐨', '🐵', '🐰', '🦊', 
    '🦝', '🐮', '🐷', '🐸', '🐙', '🐢', '🐧', '🦆', '🦅', '🦉', 
    '🦋', '🐝', '🐞', '🐌', '🦀', '🦈', '🐬', '🐳', '🦖', '🦄',
    // Nature, Weather & Space (20)
    '☀️', '🌙', '⭐', '☁️', '🌈', '❄️', '🔥', '🌲', '🌵', '🍀', 
    '🍁', '🌸', '🍄', '🌋', '🌍', '🪐', '☄️', '⚡', '🌊', '🍃',
    // Travel & Vehicles (10)
    '🚗', '🚲', '🛵', '✈️', '🚀', '⛵', '🛸', '🚁', '🚆', '🎈',
    // Objects & Recreation (20)
    '⏰', '💡', '🔑', '🎁', '👑', '💎', '🔔', '🔮', '🧩', '🧸', 
    '⚽', '🏀', '🏈', '🎾', '🎯', '🏆', '🎨', '🎸', '🎹', '🎻'
  ];
  let activeCards = [];
  
  // Board state trackers
  let firstCard = null;
  let secondCard = null;
  let lockBoard = false;
  let matchedPairs = 0;
  let totalPairsNeeded = 8;
  let totalMoves = 0;

  const statusBannerEl = document.getElementById('game-status-banner');
  let previewInterval = null;

  const engine = new GameEngine(config);

  // Hook Engine event callbacks
  engine.on('onStart', (state) => {
    overlayPause.classList.remove('overlay--active');
    overlayGameOver.classList.remove('overlay--active');
    initLevel(state.level);
  });

  engine.on('onPause', () => {
    overlayPause.classList.add('overlay--active');
  });

  engine.on('onResume', () => {
    overlayPause.classList.remove('overlay--active');
  });

  engine.on('onGameOver', (state, reason) => {
    overlayGameOver.classList.add('overlay--active');
    finalScoreEl.textContent = state.score;
    bestScoreEl.textContent = state.highScore;
    
    if (reason === 'win') {
      gameoverTitle.textContent = '🎉 Memory Master!';
      gameoverTitle.style.color = 'var(--color-success)';
      gameoverDesc.textContent = `Brilliant! You matched all pairs across all levels in record time!`;
    } else {
      gameoverTitle.textContent = "⏱ Time's Up!";
      gameoverTitle.style.color = 'var(--color-danger)';
      gameoverDesc.textContent = `You ran out of time. Train your memory recall speed and try again!`;
    }
  });

  // Level Setup
  function initLevel(levelNum) {
    let gridCols = 4;
    let levelTime = 0;
    
    if (levelNum === 1) {
      totalPairsNeeded = 2; // 4 cards (2x2)
      gridCols = 2;
    } else if (levelNum === 2) {
      totalPairsNeeded = 3; // 6 cards (2x3)
      gridCols = 3;
    } else if (levelNum === 3) {
      totalPairsNeeded = 4; // 8 cards (2x4)
      gridCols = 4;
    } else if (levelNum === 4) {
      totalPairsNeeded = 6; // 12 cards (3x4)
      gridCols = 4;
    } else if (levelNum === 5) {
      totalPairsNeeded = 8; // 16 cards (4x4)
      gridCols = 4;
    } else {
      // Levels 6 to 20
      if (levelNum <= 7) {
        totalPairsNeeded = 8; // 16 cards
        gridCols = 4;
        levelTime = levelNum === 6 ? 80 : 65;
      } else if (levelNum <= 10) {
        totalPairsNeeded = 10; // 20 cards (4x5)
        gridCols = 5;
        levelTime = 95 - (levelNum - 8) * 15; // 95, 80, 65
      } else if (levelNum <= 14) {
        totalPairsNeeded = 12; // 24 cards (4x6)
        gridCols = 6;
        levelTime = 100 - (levelNum - 11) * 15; // 100, 85, 70, 55
      } else if (levelNum <= 17) {
        totalPairsNeeded = 15; // 30 cards (5x6)
        gridCols = 6;
        levelTime = 110 - (levelNum - 15) * 15; // 110, 95, 80
      } else {
        totalPairsNeeded = 18; // 36 cards (6x6)
        gridCols = 6;
        levelTime = 120 - (levelNum - 18) * 20; // 120, 100, 80
      }
    }
    
    // Clear preview interval if running
    if (previewInterval) {
      clearInterval(previewInterval);
      previewInterval = null;
    }
    
    // Restart stats
    matchedPairs = 0;
    totalMoves = 0;
    firstCard = null;
    secondCard = null;
    lockBoard = true;
    
    pairsMatchedEl.textContent = '0';
    pairsTotalEl.textContent = totalPairsNeeded.toString();
    movesEl.textContent = '0';
    
    // Adjust CSS grid layout
    grid.style.gridTemplateColumns = `repeat(${gridCols}, 1fr)`;
    
    // Reset time left on engine
    engine.state.timeLeft = levelTime;
    engine.timeLimit = levelTime;
    engine.updateTimerUI();
    
    // Temporarily pause timer and disable pause button during memorization
    engine.stopTimer();
    setTimeout(() => {
      engine.stopTimer();
    }, 0);
    
    btnPause.disabled = true;
    btnPause.style.opacity = '0.5';
    btnPause.style.pointerEvents = 'none';
    
    generateCards(true); // Generate flipped cards (visible emojis)
    
    // Start preview countdown scaled dynamically based on number of cards/pairs
    let previewSecondsLeft = Math.max(3, Math.floor(totalPairsNeeded * 0.8) + 2);
    statusBannerEl.textContent = `Memorize: ${previewSecondsLeft}s`;
    
    previewInterval = setInterval(() => {
      previewSecondsLeft--;
      if (previewSecondsLeft <= 0) {
        clearInterval(previewInterval);
        previewInterval = null;
        
        // Unflip all cards
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => card.classList.remove('flipped'));
        
        // Start play phase
        lockBoard = false;
        btnPause.disabled = false;
        btnPause.style.opacity = '1';
        btnPause.style.pointerEvents = 'auto';
        statusBannerEl.textContent = 'Match the pairs!';
        
        if (levelTime > 0) {
          engine.startTimer();
        }
      } else {
        statusBannerEl.textContent = `Memorize: ${previewSecondsLeft}s`;
      }
    }, 1000);
  }

  // Create cards elements
  function generateCards(initFlipped = false) {
    grid.innerHTML = '';
    
    // 1. Pick emojis (randomly select from the full pool copy)
    const poolCopy = [...emojiPool];
    shuffle(poolCopy);
    const selectedEmojis = poolCopy.slice(0, totalPairsNeeded);
    // 2. Double them for matching pairs
    const doubleList = [...selectedEmojis, ...selectedEmojis];
    // 3. Shuffle
    shuffle(doubleList);
    
    // 4. Render
    doubleList.forEach((emoji, index) => {
      const card = document.createElement('div');
      card.className = 'card' + (initFlipped ? ' flipped' : '');
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
  }

  // Fisher-Yates Shuffle
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Click Handler
  function handleCardClick(card) {
    if (!engine.state.isPlaying || engine.state.isPaused || lockBoard) return;
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

    card.classList.add('flipped');

    if (!firstCard) {
      firstCard = card;
      return;
    }

    secondCard = card;
    totalMoves++;
    movesEl.textContent = totalMoves.toString();
    
    checkMatch();
  }

  // Check matching cards
  function checkMatch() {
    const isMatch = firstCard.dataset.emoji === secondCard.dataset.emoji;

    if (isMatch) {
      handleMatch();
    } else {
      handleMismatch();
    }
  }

  // Handle Match Success
  function handleMatch() {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    
    matchedPairs++;
    pairsMatchedEl.textContent = matchedPairs.toString();
    
    // Score updates
    engine.updateScore(100);
    
    // Clear selections
    resetSelection();
    
    // Win round?
    if (matchedPairs === totalPairsNeeded) {
      setTimeout(() => {
        if (engine.state.level < config.maxLevels) {
          // Extra time conversion bonus
          const timeBonus = engine.state.timeLeft * 10;
          engine.updateScore(300 + timeBonus); // Level bonus
          engine.setLevel(engine.state.level + 1);
          initLevel(engine.state.level);
        } else {
          const timeBonus = engine.state.timeLeft * 20;
          engine.updateScore(1000 + timeBonus); // Game win bonus
          engine.end('win');
        }
      }, 800);
    }
  }

  // Handle Mismatch Failure
  function handleMismatch() {
    lockBoard = true;
    
    setTimeout(() => {
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      
      // Penalty
      engine.updateScore(-10);
      
      resetSelection();
    }, 800);
  }

  function resetSelection() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
  }

  // Controls UI Action Binds
  btnPause.addEventListener('click', () => engine.pause());
  btnResume.addEventListener('click', () => engine.resume());
  btnRestart.addEventListener('click', () => engine.start());
  btnRetry.addEventListener('click', () => engine.start());

  // Start engine automatically on load
  engine.start();
});
