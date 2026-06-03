/* Shape Follower - Game Logic */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const statusBanner = document.getElementById('game-status-banner');
  const seqCurrentEl = document.getElementById('seq-current');
  const seqTargetEl = document.getElementById('seq-target');
  const levelValEl = document.getElementById('level-val');
  const padsGrid = document.getElementById('shapes-grid');
  
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

  // Game Engine setup
  const config = {
    gameId: 'shape-follower',
    timeLimit: 0,
    maxLevels: 20,
    initLives: 3
  };

  // State variables
  let sequence = [];
  let playerSequence = [];
  let targetSeqLength = 5;
  
  let flashSpeed = 600; // ms active
  let flashGap = 300; // ms idle between flashes
  let lockPads = true;
  let isReplaying = false;

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
    // Replay the current sequence from scratch on resume
    setTimeout(() => {
      replaySequence();
    }, 500);
  });

  engine.on('onGameOver', (state, reason) => {
    overlayGameOver.classList.add('overlay--active');
    finalScoreEl.textContent = state.score;
    bestScoreEl.textContent = state.highScore;
    
    if (reason === 'win') {
      gameoverTitle.textContent = '🎉 Focus Champion!';
      gameoverTitle.style.color = 'var(--color-success)';
      gameoverDesc.textContent = `Amazing! You replicated every single shape pattern sequence flawlessly!`;
    } else {
      gameoverTitle.textContent = '💔 Sequence Broken!';
      gameoverTitle.style.color = 'var(--color-danger)';
      gameoverDesc.textContent = `You hit a wrong shape. Train your spatial attention span and try again!`;
    }
  });

  // Level Setup
  function initLevel(levelNum) {
    targetSeqLength = Math.min(12, 3 + Math.floor((levelNum - 1) / 2));
    flashSpeed = Math.max(250, 700 - (levelNum - 1) * 22);
    flashGap = Math.max(100, 350 - (levelNum - 1) * 12);

    levelValEl.textContent = levelNum.toString();
    seqTargetEl.textContent = targetSeqLength.toString();
    seqCurrentEl.textContent = '0';
    
    // Scale timer dynamically
    let levelTime = 0;
    if (levelNum >= 6) {
      levelTime = Math.max(10, 25 - (levelNum - 6) * 1.0); // Level 6 = 25s, Level 20 = 11s
    }
    
    engine.timeLimit = levelTime;
    engine.state.timeLeft = levelTime;
    engine.updateTimerUI();
    
    engine.stopTimer();

    // Clear sequences
    sequence = [];
    playerSequence = [];
    
    // Generate first shape in sequence
    addToSequence();
    setTimeout(() => {
      replaySequence();
    }, 800);
  }

  // Add random index (0..3) to sequence
  function addToSequence() {
    const nextIdx = Math.floor(Math.random() * 4);
    sequence.push(nextIdx);
  }

  // Play sequence visual flashes
  async function replaySequence() {
    if (!engine.state.isPlaying || engine.state.isPaused) return;

    engine.stopTimer();
    if (engine.timeLimit > 0) {
      engine.state.timeLeft = engine.timeLimit;
      engine.updateTimerUI();
    } else {
      const progressFill = document.getElementById('timer-progress');
      if (progressFill) progressFill.style.width = '100%';
      const timerVal = document.getElementById('timer-val');
      if (timerVal) timerVal.textContent = '∞';
    }

    lockPads = true;
    isReplaying = true;
    playerSequence = [];
    
    statusBanner.textContent = 'Watch the sequence!';
    statusBanner.style.color = 'var(--theme-accent)';
    
    // Disable pads visually
    const pads = padsGrid.querySelectorAll('.shape-pad');
    pads.forEach(p => p.classList.add('disabled'));

    // Flashing sequence logic loop
    for (let i = 0; i < sequence.length; i++) {
      if (!engine.state.isPlaying || engine.state.isPaused) return; // safety stop
      
      const padIdx = sequence[i];
      const pad = document.getElementById(`pad-${padIdx}`);
      
      // Wait for gap before flash
      await sleep(flashGap);
      
      if (!engine.state.isPlaying || engine.state.isPaused) return;

      // Flash active
      pad.classList.add('active');
      
      // Wait active duration
      await sleep(flashSpeed);
      
      pad.classList.remove('active');
    }

    if (!engine.state.isPlaying || engine.state.isPaused) return;

    // Enable pads clicks
    lockPads = false;
    isReplaying = false;
    pads.forEach(p => p.classList.remove('disabled'));
    
    statusBanner.textContent = 'Repeat the sequence!';
    statusBanner.style.color = 'var(--color-info)';

    if (engine.timeLimit > 0) {
      engine.startTimer();
    }
  }

  // Helper sleep function
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Player Pad Click Handler
  function handlePadClick(pad, index) {
    if (lockPads || !engine.state.isPlaying || engine.state.isPaused) return;

    // Visual feedback tap
    pad.classList.add('active');
    setTimeout(() => {
      pad.classList.remove('active');
    }, 200);

    playerSequence.push(index);
    const checkIdx = playerSequence.length - 1;

    // Verify choice matching sequence
    if (playerSequence[checkIdx] === sequence[checkIdx]) {
      engine.updateScore(10);
      
      // Complete current round?
      if (playerSequence.length === sequence.length) {
        engine.stopTimer();
        engine.updateScore(100);
        seqCurrentEl.textContent = sequence.length.toString();
        
        // Target length met?
        if (sequence.length === targetSeqLength) {
          handleLevelComplete();
        } else {
          // Next round: add new shape and replay
          addToSequence();
          lockPads = true;
          statusBanner.textContent = 'Correct!';
          statusBanner.style.color = 'var(--color-success)';
          
          setTimeout(() => {
            replaySequence();
          }, 1200);
        }
      }
    } else {
      // Mistake! Deduct a life
      lockPads = true;
      engine.stopTimer();
      engine.decrementLives();
      
      // Flash grid red boundary check
      padsGrid.style.transform = 'scale(0.96)';
      setTimeout(() => { padsGrid.style.transform = 'scale(1)'; }, 100);
      
      statusBanner.textContent = 'Incorrect!';
      statusBanner.style.color = 'var(--color-danger)';
      
      setTimeout(() => {
        if (engine.state.lives > 0) {
          replaySequence();
        }
      }, 1200);
    }
  }

  // Bind clicks
  const pads = padsGrid.querySelectorAll('.shape-pad');
  pads.forEach(pad => {
    const idx = parseInt(pad.dataset.index);
    pad.addEventListener('click', () => handlePadClick(pad, idx));
  });

  // Level transition
  function handleLevelComplete() {
    setTimeout(() => {
      if (engine.state.level < config.maxLevels) {
        engine.updateScore(300); // Level completion bonus
        engine.setLevel(engine.state.level + 1);
        initLevel(engine.state.level);
      } else {
        engine.updateScore(1000); // Game Win bonus
        engine.end('win');
      }
    }, 600);
  }

  // Buttons wire
  btnPause.addEventListener('click', () => engine.pause());
  btnResume.addEventListener('click', () => engine.resume());
  btnRestart.addEventListener('click', () => engine.start());
  btnRetry.addEventListener('click', () => engine.start());

  // Auto start on load
  engine.start();
});
