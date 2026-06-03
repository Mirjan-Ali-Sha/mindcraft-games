/* Color Word Stroop - Game Logic */

document.addEventListener('DOMContentLoaded', () => {
  const stroopWordEl = document.getElementById('stroop-word');
  const choicesGrid = document.getElementById('stroop-choices');
  
  // UI Bindings
  const stroopIndexEl = document.getElementById('stroop-index');
  const stroopTotalEl = document.getElementById('stroop-total');
  const levelValEl = document.getElementById('level-val');
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
    gameId: 'color-word-stroop',
    timeLimit: 0,
    maxLevels: 20,
    initLives: 3
  };

  // Color Definitions
  const colorMap = [
    { name: 'Red', hex: '#ef4444' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Green', hex: '#10b981' },
    { name: 'Yellow', hex: '#eab308' }
  ];

  // Game tracking variables
  let currentSolvedCount = 0;
  let targetTotalNeeded = 8;
  
  let currentInkColor = null;
  let currentMeaningColor = null;
  
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
      gameoverTitle.textContent = '🎉 Inhibition Guru!';
      gameoverTitle.style.color = 'var(--color-success)';
      gameoverDesc.textContent = `Amazing! You bypassed the cognitive interference patterns and solved all Stroop sets!`;
    } else if (reason === 'lives') {
      gameoverTitle.textContent = '💔 Out of Lives!';
      gameoverTitle.style.color = 'var(--color-danger)';
      gameoverDesc.textContent = `You fell for too many mismatch traps. Filter out the semantic meaning and try again!`;
    } else {
      gameoverTitle.textContent = "⏱ Time's Up!";
      gameoverTitle.style.color = 'var(--color-danger)';
      gameoverDesc.textContent = `You ran out of time. Boost your cognitive filter speed and try again!`;
    }
  });

  // Level Setup
  function initLevel(levelNum) {
    targetTotalNeeded = 5 + Math.floor((levelNum - 1) * 0.8);
    
    let levelTime = 0;
    if (levelNum >= 6) {
      levelTime = Math.max(20, 45 - Math.floor((levelNum - 6) * 1.5)); // Level 6 = 45s, Level 20 = 24s
    }

    currentSolvedCount = 0;
    stroopTotalEl.textContent = targetTotalNeeded.toString();
    stroopIndexEl.textContent = '0';
    levelValEl.textContent = levelNum.toString();
    
    engine.timeLimit = levelTime;
    engine.state.timeLeft = levelTime;
    engine.updateTimerUI();
    
    if (levelTime <= 0) {
      engine.stopTimer();
    } else {
      engine.startTimer();
    }
    
    loadNextStroop();
  }

  // Load a single stroop item
  function loadNextStroop() {
    stroopIndexEl.textContent = currentSolvedCount.toString();
    
    // 1. Pick semantic meaning color (written text)
    currentMeaningColor = colorMap[Math.floor(Math.random() * colorMap.length)];
    
    // 2. Pick actual ink color (hex style)
    // 70% chance of mismatch to test inhibition
    if (Math.random() < 0.7) {
      const filteredColors = colorMap.filter(c => c.name !== currentMeaningColor.name);
      currentInkColor = filteredColors[Math.floor(Math.random() * filteredColors.length)];
    } else {
      currentInkColor = currentMeaningColor;
    }
    
    // Set HTML text content and ink style
    stroopWordEl.textContent = currentMeaningColor.name.toUpperCase();
    stroopWordEl.style.color = currentInkColor.hex;
    
    // Clear styles/classes
    stroopWordEl.className = 'stroop-word';
    stroopWordEl.style.animation = 'none';
    stroopWordEl.style.transform = 'none';
    
    // Level adjustments (special transforms)
    if (engine.state.level <= 3) {
      // Normal display
    } else if (engine.state.level <= 6) {
      // Small pulse animation
      stroopWordEl.style.animation = 'pulse 1.5s infinite';
    } else if (engine.state.level <= 11) {
      // Upside down or mirrored words
      if (Math.random() > 0.5) {
        stroopWordEl.classList.add('upside-down');
      } else {
        stroopWordEl.classList.add('mirrored');
      }
    } else {
      // Rotating/tilted words (level 12+)
      const randomAngle = Math.random() > 0.5 ? (Math.random() * 60 - 30) : (Math.random() * 180 + 90);
      stroopWordEl.style.transform = `rotate(${randomAngle}deg)`;
      if (Math.random() > 0.5) {
        stroopWordEl.style.animation = 'pulse 1.2s infinite';
      }
    }

    generateChoices();
  }

  // Draw multiple choice buttons
  function generateChoices() {
    choicesGrid.innerHTML = '';
    
    // Standard Red, Blue, Green, Yellow options
    colorMap.forEach(color => {
      const btn = document.createElement('button');
      btn.className = 'btn btn--secondary stroop-btn';
      btn.textContent = color.name;
      
      btn.addEventListener('click', () => handleChoiceSelect(btn, color.name));
      choicesGrid.appendChild(btn);
    });
  }

  // Click choice
  function handleChoiceSelect(btn, selectedName) {
    if (!engine.state.isPlaying || engine.state.isPaused) return;

    // Lock option grids
    const optionBtns = choicesGrid.querySelectorAll('button');
    optionBtns.forEach(b => b.disabled = true);

    // Ink color is the correct answer
    const isCorrect = selectedName === currentInkColor.name;

    if (isCorrect) {
      btn.classList.remove('btn--secondary');
      btn.classList.add('btn--primary');
      btn.style.background = 'var(--color-success)';
      btn.style.borderColor = 'var(--color-success)';
      
      engine.updateScore(100);
      currentSolvedCount++;
      
      setTimeout(() => {
        if (currentSolvedCount === targetTotalNeeded) {
          handleLevelComplete();
        } else {
          loadNextStroop();
        }
      }, 350);
    } else {
      btn.classList.remove('btn--secondary');
      btn.style.background = 'var(--color-danger)';
      btn.style.borderColor = 'var(--color-danger)';
      
      // Highlight correct button
      optionBtns.forEach(b => {
        if (b.textContent === currentInkColor.name) {
          b.classList.remove('btn--secondary');
          b.classList.add('btn--primary');
          b.style.background = 'var(--color-success)';
          b.style.borderColor = 'var(--color-success)';
        }
      });
      
      engine.decrementLives();
      
      setTimeout(() => {
        if (engine.state.lives > 0) {
          loadNextStroop();
        }
      }, 700);
    }
  }

  // Level complete transition
  function handleLevelComplete() {
    setTimeout(() => {
      if (engine.state.level < config.maxLevels) {
        const timeBonus = engine.state.timeLeft * 10;
        engine.updateScore(400 + timeBonus); // Level clear bonus
        engine.setLevel(engine.state.level + 1);
        initLevel(engine.state.level);
      } else {
        const timeBonus = engine.state.timeLeft * 20;
        engine.updateScore(1000 + timeBonus); // Game win bonus
        engine.end('win');
      }
    }, 400);
  }

  // Controls bindings
  btnPause.addEventListener('click', () => engine.pause());
  btnResume.addEventListener('click', () => engine.resume());
  btnRestart.addEventListener('click', () => engine.start());
  btnRetry.addEventListener('click', () => engine.start());

  // Auto start on load
  engine.start();
});
