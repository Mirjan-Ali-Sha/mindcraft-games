/* Spatial Grid Memory - Game Logic */

document.addEventListener('DOMContentLoaded', () => {
  const gridContainer = document.getElementById('spatial-grid');
  
  // UI Bindings
  const levelValEl = document.getElementById('level-val');
  const roundIndexEl = document.getElementById('round-index');
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
    gameId: 'spatial-grid-memory',
    timeLimit: 0,
    maxLevels: 20,
    initLives: 3
  };

  // State variables
  let currentRoundIdx = 0; // 0..2
  let gridSize = 3; // 3x3, 4x4, 5x5
  let targetCellsCount = 3;
  let memorizeDuration = 2000; // ms
  
  let targetIndices = []; // indices of lit cells
  let correctClickedIndices = [];
  let lockBoard = true;
  let memorizeTimer = null;

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
    if (statusBanner.textContent.includes('Watch')) {
      startMemorizeCountdown(memorizeDuration);
    }
  });

  engine.on('onGameOver', (state, reason) => {
    stopMemorizeCountdown();
    overlayGameOver.classList.add('overlay--active');
    finalScoreEl.textContent = state.score;
    bestScoreEl.textContent = state.highScore;
    
    if (reason === 'win') {
      gameoverTitle.textContent = '🎉 Spatial Virtuoso!';
      gameoverTitle.style.color = 'var(--color-success)';
      gameoverDesc.textContent = `Amazing visual tracking! You recalled all spatial grid patterns perfectly.`;
    } else {
      gameoverTitle.textContent = '💔 Patterns Missed!';
      gameoverTitle.style.color = 'var(--color-danger)';
      gameoverDesc.textContent = `You clicked too many empty cells. Grow your spatial memory span and try again!`;
    }
  });

  // Level Setup
  function initLevel(levelNum) {
    if (levelNum <= 4) {
      gridSize = 3;
      targetCellsCount = Math.min(4, 2 + levelNum);
    } else if (levelNum <= 10) {
      gridSize = 4;
      targetCellsCount = 4 + Math.floor((levelNum - 5) * 0.5);
    } else {
      gridSize = 5;
      targetCellsCount = 6 + Math.floor((levelNum - 11) * 0.35);
    }
    
    memorizeDuration = 1500 + targetCellsCount * 400;

    levelValEl.textContent = levelNum.toString();
    currentRoundIdx = 0;
    
    // Scale timer dynamically
    let levelTime = 0;
    if (levelNum >= 6) {
      levelTime = Math.max(6, 15 - (levelNum - 6) * 0.6); // Level 6 = 15s, Level 20 = 6.6s (clamps to 6s)
    }
    
    engine.timeLimit = levelTime;
    engine.state.timeLeft = levelTime;
    engine.updateTimerUI();
    
    engine.stopTimer();
    
    loadRound(levelNum, currentRoundIdx);
  }

  // Load a single round
  function loadRound(levelNum, rIdx) {
    roundIndexEl.textContent = (rIdx + 1).toString();
    lockBoard = true;
    targetIndices = [];
    correctClickedIndices = [];
    
    // Set grid columns
    gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    
    // Generate Cells
    gridContainer.innerHTML = '';
    const totalCellsCount = gridSize * gridSize;
    
    for (let i = 0; i < totalCellsCount; i++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell disabled';
      cell.dataset.index = i;
      
      cell.addEventListener('click', () => handleCellClick(cell, i));
      gridContainer.appendChild(cell);
    }
    
    // Generate target indices
    while (targetIndices.length < targetCellsCount) {
      const randIdx = Math.floor(Math.random() * totalCellsCount);
      if (!targetIndices.includes(randIdx)) {
        targetIndices.push(randIdx);
      }
    }
    
    // Light up cells
    const cells = gridContainer.querySelectorAll('.grid-cell');
    targetIndices.forEach(idx => {
      cells[idx].classList.add('highlighted');
    });

    statusBanner.textContent = 'Watch the pattern!';
    statusBanner.style.color = 'var(--theme-accent)';
    
    startMemorizeCountdown(memorizeDuration);
  }

  // Count down memorization timer progress
  function startMemorizeCountdown(duration) {
    stopMemorizeCountdown();
    
    const startTime = Date.now();
    const progressFill = document.getElementById('timer-progress');
    const timerVal = document.getElementById('timer-val');

    memorizeTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      
      if (progressFill) progressFill.style.width = `${pct}%`;
      
      if (elapsed >= duration) {
        stopMemorizeCountdown();
        startRecallPhase();
      }
    }, 100);
  }

  function stopMemorizeCountdown() {
    if (memorizeTimer) {
      clearInterval(memorizeTimer);
      memorizeTimer = null;
    }
  }

  // Recall stage
  function startRecallPhase() {
    // Hide patterns
    const cells = gridContainer.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
      cell.classList.remove('highlighted');
      cell.classList.remove('disabled'); // enable clicks
    });
    
    if (engine.timeLimit > 0) {
      engine.startTimer();
      engine.updateTimerUI();
    } else {
      const progressFill = document.getElementById('timer-progress');
      if (progressFill) progressFill.style.width = '100%';
      const timerVal = document.getElementById('timer-val');
      if (timerVal) timerVal.textContent = '∞';
    }

    statusBanner.textContent = 'Recall the highlighted cells!';
    statusBanner.style.color = 'var(--color-info)';
    lockBoard = false;
  }

  // Click grid cell
  function handleCellClick(cell, index) {
    if (lockBoard || !engine.state.isPlaying || engine.state.isPaused) return;
    if (cell.classList.contains('correct') || cell.classList.contains('wrong')) return;

    const isCorrect = targetIndices.includes(index);

    if (isCorrect) {
      cell.classList.add('correct');
      correctClickedIndices.push(index);
      engine.updateScore(50);
      
      // All correct cells clicked?
      if (correctClickedIndices.length === targetCellsCount) {
        lockBoard = true;
        engine.stopTimer();
        engine.updateScore(150);
        
        statusBanner.textContent = 'Pattern Matched!';
        statusBanner.style.color = 'var(--color-success)';
        
        setTimeout(() => {
          advanceRound();
        }, 1000);
      }
    } else {
      // Wrong click
      cell.classList.add('wrong');
      lockBoard = true;
      engine.stopTimer();
      
      // Highlight what they missed
      const cells = gridContainer.querySelectorAll('.grid-cell');
      targetIndices.forEach(idx => {
        if (!correctClickedIndices.includes(idx)) {
          cells[idx].classList.add('correct'); // Highlight green
        }
      });

      engine.decrementLives();
      
      statusBanner.textContent = 'Incorrect Cell!';
      statusBanner.style.color = 'var(--color-danger)';
      
      setTimeout(() => {
        if (engine.state.lives > 0) {
          advanceRound();
        }
      }, 1500);
    }
  }

  // Go to next round or level
  function advanceRound() {
    currentRoundIdx++;
    
    if (currentRoundIdx < 3) {
      loadRound(engine.state.level, currentRoundIdx);
    } else {
      // Level cleared
      setTimeout(() => {
        if (engine.state.level < config.maxLevels) {
          engine.updateScore(400); // Level clear bonus
          engine.setLevel(engine.state.level + 1);
          initLevel(engine.state.level);
        } else {
          engine.updateScore(1000); // Game Win bonus
          engine.end('win');
        }
      }, 400);
    }
  }

  // Control buttons wire
  btnPause.addEventListener('click', () => engine.pause());
  btnResume.addEventListener('click', () => engine.resume());
  btnRestart.addEventListener('click', () => engine.start());
  btnRetry.addEventListener('click', () => engine.start());

  // Auto start on load
  engine.start();
});
