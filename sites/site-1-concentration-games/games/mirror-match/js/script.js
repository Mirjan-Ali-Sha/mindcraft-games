/* Mirror Match - Game Logic */

document.addEventListener('DOMContentLoaded', () => {
  const targetCanvas = document.getElementById('target-canvas');
  const choiceACanvas = document.getElementById('choice-a-canvas');
  const choiceBCanvas = document.getElementById('choice-b-canvas');
  
  const targetCtx = targetCanvas.getContext('2d');
  const choiceACtx = choiceACanvas.getContext('2d');
  const choiceBCtx = choiceBCanvas.getContext('2d');
  
  const choiceACard = document.getElementById('choice-a');
  const choiceBCard = document.getElementById('choice-b');
  
  // UI Bindings
  const levelValEl = document.getElementById('level-val');
  const questionIndexEl = document.getElementById('question-index');
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
    gameId: 'mirror-match',
    timeLimit: 0,
    maxLevels: 20,
    initLives: 3
  };

  // State trackers
  let currentQuestionIdx = 0; // 0..2
  let correctChoiceName = 'A'; // 'A' or 'B'
  let currentShapeType = 0; // 0..3
  let lockAnswers = false;

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
      gameoverTitle.textContent = '🎉 Spatial Guru!';
      gameoverTitle.style.color = 'var(--color-success)';
      gameoverDesc.textContent = `Spectacular spatial rotation! You identified all reflections without failing the identical-copy traps.`;
    } else if (reason === 'lives') {
      gameoverTitle.textContent = '💔 Out of Lives!';
      gameoverTitle.style.color = 'var(--color-danger)';
      gameoverDesc.textContent = `You selected too many identical shapes instead of mirror reflections!`;
    } else {
      gameoverTitle.textContent = "⏱ Time's Up!";
      gameoverTitle.style.color = 'var(--color-danger)';
      gameoverDesc.textContent = `Time ran out. Speed up your mental rotation speed and try again!`;
    }
  });

  // Level Setup
  function initLevel(levelNum) {
    let levelTime = 0;
    if (levelNum >= 6) {
      levelTime = Math.max(15, 45 - Math.floor((levelNum - 6) * 2)); // Level 6 = 45s, Level 20 = 17s
    }

    currentQuestionIdx = 0;
    levelValEl.textContent = levelNum.toString();
    
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
    lockAnswers = false;
    
    // Clear choice card active border classes
    choiceACard.className = 'choice-card glass-card';
    choiceBCard.className = 'choice-card glass-card';
    
    // Select shape type based on level
    // Level 1: 0 or 1, Level 2: 1 or 2, Level 3: 2 or 3 (randomized mixes)
    if (levelNum <= 2) {
      currentShapeType = Math.random() > 0.5 ? 0 : 1;
    } else if (levelNum <= 4) {
      currentShapeType = Math.random() > 0.5 ? 1 : 2;
    } else if (levelNum <= 6) {
      currentShapeType = Math.random() > 0.5 ? 2 : 3;
    } else if (levelNum <= 9) {
      currentShapeType = Math.random() > 0.5 ? 3 : 4;
    } else if (levelNum <= 12) {
      currentShapeType = Math.random() > 0.5 ? 4 : 5;
    } else if (levelNum <= 15) {
      currentShapeType = Math.random() > 0.5 ? 5 : 6;
    } else {
      currentShapeType = Math.floor(Math.random() * 7); // 0..6
    }
    
    // Determine which option is correct (mirrored shape)
    correctChoiceName = Math.random() > 0.5 ? 'A' : 'B';
    
    // Draw Original Shape in main canvas (Normal, non-mirrored)
    drawShape(targetCtx, currentShapeType, targetCanvas.width, targetCanvas.height, false);
    
    // Render Choices
    if (correctChoiceName === 'A') {
      // Option A is correct mirror reflection
      drawShape(choiceACtx, currentShapeType, choiceACanvas.width, choiceACanvas.height, true);
      // Option B is identical (non-mirrored) decoy trap
      drawShape(choiceBCtx, currentShapeType, choiceBCanvas.width, choiceBCanvas.height, false);
    } else {
      // Option A is identical decoy trap
      drawShape(choiceACtx, currentShapeType, choiceACanvas.width, choiceACanvas.height, false);
      // Option B is correct mirror reflection
      drawShape(choiceBCtx, currentShapeType, choiceBCanvas.width, choiceBCanvas.height, true);
    }
  }

  // Vector drawings catalog
  function drawShape(ctx, type, width, height, isMirrored) {
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    
    // Flip horizontally if isMirrored
    if (isMirrored) {
      ctx.scale(-1, 1);
      ctx.translate(-width, 0);
    }
    
    // Add margin padding
    ctx.translate(width * 0.1, height * 0.1);
    const w = width * 0.8;
    const h = height * 0.8;
    
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    
    if (type === 0) {
      // Shape 0: Flag Pole
      ctx.beginPath();
      ctx.moveTo(w * 0.25, h * 0.9);
      ctx.lineTo(w * 0.25, h * 0.1);
      ctx.strokeStyle = '#a855f7'; // Purple pole
      ctx.stroke();
      
      // flag banner
      ctx.beginPath();
      ctx.moveTo(w * 0.25, h * 0.1);
      ctx.lineTo(w * 0.85, h * 0.35);
      ctx.lineTo(w * 0.25, h * 0.6);
      ctx.closePath();
      ctx.fillStyle = 'rgba(168, 85, 247, 0.5)';
      ctx.strokeStyle = '#c084fc';
      ctx.fill();
      ctx.stroke();
      
      // Yellow dot
      ctx.beginPath();
      ctx.arc(w * 0.25, h * 0.1, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#fde047';
      ctx.fill();
    } else if (type === 1) {
      // Shape 1: Diag Arrow
      ctx.beginPath();
      ctx.moveTo(w * 0.15, h * 0.85);
      ctx.lineTo(w * 0.8, h * 0.2);
      ctx.strokeStyle = '#3b82f6';
      ctx.stroke();
      
      // Arrow tip
      ctx.beginPath();
      ctx.moveTo(w * 0.8, h * 0.2);
      ctx.lineTo(w * 0.5, h * 0.2);
      ctx.lineTo(w * 0.8, h * 0.5);
      ctx.closePath();
      ctx.fillStyle = 'rgba(59, 130, 246, 0.5)';
      ctx.strokeStyle = '#60a5fa';
      ctx.fill();
      ctx.stroke();
      
      // Green tip bubble
      ctx.beginPath();
      ctx.arc(w * 0.15, h * 0.85, 9, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981';
      ctx.fill();
    } else if (type === 2) {
      // Shape 2: Asymmetrical block (Teapot silhouette)
      ctx.beginPath();
      // Handle
      ctx.arc(w * 0.25, h * 0.5, 20, Math.PI * 0.5, Math.PI * 1.5);
      ctx.strokeStyle = '#ec4899';
      ctx.stroke();
      
      // Body
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.5, 25, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(236, 72, 153, 0.5)';
      ctx.strokeStyle = '#f472b6';
      ctx.fill();
      ctx.stroke();
      
      // Spout
      ctx.beginPath();
      ctx.moveTo(w * 0.65, h * 0.45);
      ctx.lineTo(w * 0.85, h * 0.3);
      ctx.lineTo(w * 0.8, h * 0.6);
      ctx.closePath();
      ctx.fillStyle = 'rgba(236, 72, 153, 0.8)';
      ctx.strokeStyle = '#f472b6';
      ctx.fill();
      ctx.stroke();
    } else if (type === 3) {
      // Shape 3: Sailboat
      // Hull
      ctx.beginPath();
      ctx.moveTo(w * 0.1, h * 0.7);
      ctx.lineTo(w * 0.85, h * 0.7);
      ctx.lineTo(w * 0.7, h * 0.9);
      ctx.lineTo(w * 0.25, h * 0.9);
      ctx.closePath();
      ctx.fillStyle = 'rgba(234, 88, 12, 0.6)';
      ctx.strokeStyle = '#fb923c';
      ctx.fill();
      ctx.stroke();
      
      // Sail
      ctx.beginPath();
      ctx.moveTo(w * 0.35, h * 0.7);
      ctx.lineTo(w * 0.35, h * 0.1);
      ctx.lineTo(w * 0.75, h * 0.55);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.strokeStyle = '#e2e8f0';
      ctx.fill();
      ctx.stroke();
    } else if (type === 4) {
      // Shape 4: Asymmetric Key
      ctx.beginPath();
      ctx.moveTo(w * 0.2, h * 0.5);
      ctx.lineTo(w * 0.8, h * 0.5);
      ctx.strokeStyle = '#eab308';
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(w * 0.2, h * 0.5, 18, 0, Math.PI * 2);
      ctx.strokeStyle = '#eab308';
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(w * 0.6, h * 0.5);
      ctx.lineTo(w * 0.6, h * 0.7);
      ctx.lineTo(w * 0.7, h * 0.7);
      ctx.lineTo(w * 0.7, h * 0.5);
      ctx.moveTo(w * 0.75, h * 0.5);
      ctx.lineTo(w * 0.75, h * 0.65);
      ctx.lineTo(w * 0.8, h * 0.65);
      ctx.lineTo(w * 0.8, h * 0.5);
      ctx.strokeStyle = '#eab308';
      ctx.stroke();
    } else if (type === 5) {
      // Shape 5: Umbrella/Hook
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.4, 25, Math.PI, 0);
      ctx.closePath();
      ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.strokeStyle = '#f87171';
      ctx.fill();
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(w * 0.5, h * 0.4);
      ctx.lineTo(w * 0.5, h * 0.8);
      ctx.arc(w * 0.4, h * 0.8, 10, 0, Math.PI);
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    } else {
      // Shape 6: Stylized Crown
      ctx.beginPath();
      ctx.moveTo(w * 0.15, h * 0.75);
      ctx.lineTo(w * 0.1, h * 0.35);
      ctx.lineTo(w * 0.35, h * 0.55);
      ctx.lineTo(w * 0.5, h * 0.2);
      ctx.lineTo(w * 0.65, h * 0.55);
      ctx.lineTo(w * 0.9, h * 0.35);
      ctx.lineTo(w * 0.85, h * 0.75);
      ctx.closePath();
      ctx.fillStyle = 'rgba(249, 115, 22, 0.5)';
      ctx.strokeStyle = '#fb923c';
      ctx.fill();
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(w * 0.1, h * 0.35, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981';
      ctx.fill();
    }
    
    ctx.restore();
  }

  // Handle choice selection click
  function handleSelect(choiceName, card) {
    if (lockAnswers || !engine.state.isPlaying || engine.state.isPaused) return;
    lockAnswers = true;
    engine.stopTimer();

    const isCorrect = choiceName === correctChoiceName;

    if (isCorrect) {
      card.classList.add('correct');
      engine.updateScore(150);
      
      setTimeout(() => {
        advanceQuestion();
      }, 1000);
    } else {
      card.classList.add('wrong');
      
      // Highlight correct option
      if (correctChoiceName === 'A') {
        choiceACard.classList.add('correct');
      } else {
        choiceBCard.classList.add('correct');
      }
      
      engine.decrementLives();
      
      setTimeout(() => {
        if (engine.state.lives > 0) {
          advanceQuestion();
        }
      }, 1300);
    }
  }

  // Click bindings
  choiceACard.addEventListener('click', () => handleSelect('A', choiceACard));
  choiceBCard.addEventListener('click', () => handleSelect('B', choiceBCard));

  // Go to next question or level
  function advanceQuestion() {
    currentQuestionIdx++;
    
    if (currentQuestionIdx < 3) {
      loadQuestion(engine.state.level, currentQuestionIdx);
    } else {
      // Level complete!
      setTimeout(() => {
        if (engine.state.level < config.maxLevels) {
          const timeBonus = engine.state.timeLeft * 10;
          engine.updateScore(400 + timeBonus); // Level clear bonus
          engine.setLevel(engine.state.level + 1);
          initLevel(engine.state.level);
        } else {
          const timeBonus = engine.state.timeLeft * 20;
          engine.updateScore(1000 + timeBonus); // Game clear bonus
          engine.end('win');
        }
      }, 400);
    }
  }

  // Controls wire
  btnPause.addEventListener('click', () => engine.pause());
  btnResume.addEventListener('click', () => engine.resume());
  btnRestart.addEventListener('click', () => engine.start());
  btnRetry.addEventListener('click', () => engine.start());

  // Auto start on load
  engine.start();
});
