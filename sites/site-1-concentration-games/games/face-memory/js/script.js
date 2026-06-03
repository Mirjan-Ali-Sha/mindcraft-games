/* Face Memory - Game Logic */

document.addEventListener('DOMContentLoaded', () => {
  // Views
  const memorizeView = document.getElementById('memorize-view');
  const quizView = document.getElementById('quiz-view');
  
  // UI Bindings
  const statusBanner = document.getElementById('game-status-banner');
  const questionIndexEl = document.getElementById('question-index');
  const questionTotalEl = document.getElementById('question-total');
  const levelValEl = document.getElementById('level-val');
  
  // Quiz DOM Elements
  const quizFace = document.getElementById('quiz-face');
  const quizOptions = document.getElementById('quiz-options');
  
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

  // Emojis & Names Pool
  const avatarsPool = ['🧔', '👩‍🦰', '🧑‍🦱', '👱‍♀️', '👨‍🦳', '👩‍⚕️', '🧔‍♂️', '👩‍🦳', '👩‍🦱', '👱‍♂️', '👵', '👨‍⚕️', '👮‍♂️', '👷‍♀️', '🕵️‍♂️', '🧑‍🌾', '👩‍🍳', '🧑‍🎓', '👩‍🎤', '👨‍🎨', '👩‍🚀', '👨‍🚒', '🧙‍♂️', '🧚‍♀️', '🧛‍♂️'];
  const namesPool = ['LEO', 'MIA', 'ZOE', 'MAX', 'LILY', 'NOAH', 'RUBY', 'JACK', 'ELLA', 'LUKE', 'MAIA', 'OTTO', 'ARLO', 'BOBBY', 'CLARA', 'DAISY', 'FELIX', 'GRACE', 'HUGO', 'IVY', 'JUDE', 'KATE', 'NORA', 'ROSE', 'SOPHIE'];

  // Game Engine config
  const config = {
    gameId: 'face-memory',
    timeLimit: 0,
    maxLevels: 20,
    initLives: 3
  };

  // State Trackers
  let levelAssociations = [];
  let quizQueue = [];
  let currentQuizIdx = 0;
  let memorizeTimer = null;
  let optionCount = 3;
  let memorizeDuration = 5000;

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
    if (memorizeView.style.display !== 'none') {
      // Resume memorization phase from where it was
      startMemorizeCountdown(memorizeDuration);
    }
  });

  engine.on('onGameOver', (state, reason) => {
    stopMemorizeCountdown();
    overlayGameOver.classList.add('overlay--active');
    finalScoreEl.textContent = state.score;
    bestScoreEl.textContent = state.highScore;
    
    if (reason === 'win') {
      gameoverTitle.textContent = '🎉 Social Memory Prodigy!';
      gameoverTitle.style.color = 'var(--color-success)';
      gameoverDesc.textContent = `Amazing! You recalled every single face and name combination perfectly!`;
    } else if (reason === 'lives') {
      gameoverTitle.textContent = '💔 Out of Lives!';
      gameoverTitle.style.color = 'var(--color-danger)';
      gameoverDesc.textContent = `You mismatched too many names. Build your associative memory and try again!`;
    } else {
      gameoverTitle.textContent = "⏱ Time's Up!";
      gameoverTitle.style.color = 'var(--color-danger)';
      gameoverDesc.textContent = `You ran out of time. Try again to respond quicker!`;
    }
  });

  // Level Setup
  function initLevel(levelNum) {
    const pairCount = Math.min(6, 2 + Math.floor((levelNum - 1) / 4));
    memorizeDuration = pairCount * 2500;
    
    optionCount = 3;
    if (levelNum > 5) optionCount = 4;
    if (levelNum > 12) optionCount = 5;

    levelValEl.textContent = levelNum.toString();
    questionTotalEl.textContent = pairCount.toString();
    currentQuizIdx = 0;
    
    engine.stopTimer();
    
    let levelTime = 0;
    if (levelNum >= 6) {
      levelTime = Math.max(15, 45 - (levelNum - 6) * 2); // Level 6 = 45s, Level 20 = 17s
    }
    
    engine.timeLimit = levelTime;
    engine.state.timeLeft = levelTime;
    engine.updateTimerUI();
    
    generateAssociations(pairCount);
    startMemorizePhase();
  }

  // Generate unique pairs
  function generateAssociations(count) {
    levelAssociations = [];
    
    // Shuffle pools copy
    const avs = [...avatarsPool];
    const nms = [...namesPool];
    shuffle(avs);
    shuffle(nms);
    
    for (let i = 0; i < count; i++) {
      levelAssociations.push({
        avatar: avs[i],
        name: nms[i]
      });
    }
    
    // Copy for quiz queue, then shuffle queue
    quizQueue = [...levelAssociations];
    shuffle(quizQueue);
  }

  // Fisher-Yates
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Memorization Stage Setup
  function startMemorizePhase() {
    quizView.style.display = 'none';
    memorizeView.style.display = 'flex';
    
    statusBanner.textContent = 'Memorize Names & Faces!';
    statusBanner.style.color = 'var(--theme-accent)';
    
    // Draw cards
    memorizeView.innerHTML = '';
    levelAssociations.forEach(pair => {
      const card = document.createElement('div');
      card.className = 'face-card';
      card.innerHTML = `
        <div class="face-avatar">${pair.avatar}</div>
        <div class="face-name">${pair.name}</div>
      `;
      memorizeView.appendChild(card);
    });

    startMemorizeCountdown(memorizeDuration);
  }

  // Memorization custom countdown progress bar
  let countdownStart = null;
  let remainingTime = 0;
  
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
        startQuizPhase();
      }
    }, 100);
  }

  function stopMemorizeCountdown() {
    if (memorizeTimer) {
      clearInterval(memorizeTimer);
      memorizeTimer = null;
    }
  }

  // Quiz Stage Setup
  function startQuizPhase() {
    memorizeView.style.display = 'none';
    quizView.style.display = 'block';
    
    statusBanner.textContent = 'Who is this person?';
    statusBanner.style.color = 'var(--color-info)';
    
    if (engine.timeLimit > 0) {
      engine.startTimer();
      engine.updateTimerUI();
    } else {
      const progressFill = document.getElementById('timer-progress');
      if (progressFill) progressFill.style.width = '100%';
      const timerVal = document.getElementById('timer-val');
      if (timerVal) timerVal.textContent = '∞';
    }
    
    loadQuizQuestion();
  }

  // Load question
  function loadQuizQuestion() {
    if (engine.timeLimit > 0) {
      engine.startTimer();
    }
    const question = quizQueue[currentQuizIdx];
    questionIndexEl.textContent = (currentQuizIdx + 1).toString();
    
    quizFace.textContent = question.avatar;
    
    // Generate multiple choices
    const choices = [question.name];
    
    // Fill remaining choice slots with distractor names
    const otherNames = levelAssociations
      .map(p => p.name)
      .filter(n => n !== question.name);
      
    // Add other active names first
    otherNames.forEach(n => {
      if (choices.length < optionCount) choices.push(n);
    });
    
    // If still need options, pick random ones from pool
    while (choices.length < optionCount) {
      const randName = namesPool[Math.floor(Math.random() * namesPool.length)];
      if (!choices.includes(randName)) {
        choices.push(randName);
      }
    }
    
    shuffle(choices);
    
    // Draw choice buttons
    quizOptions.innerHTML = '';
    choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'btn btn--secondary quiz-option-btn';
      btn.textContent = choice;
      
      btn.addEventListener('click', () => handleOptionSelect(btn, choice, question.name));
      quizOptions.appendChild(btn);
    });
  }

  // Option selection logic
  function handleOptionSelect(btn, selection, correctName) {
    if (!engine.state.isPlaying || engine.state.isPaused) return;

    engine.stopTimer();

    // Disable all options buttons to lock answers
    const optionBtns = quizOptions.querySelectorAll('button');
    optionBtns.forEach(b => b.disabled = true);

    const isCorrect = selection === correctName;

    if (isCorrect) {
      btn.classList.remove('btn--secondary');
      btn.classList.add('btn--primary');
      btn.style.background = 'var(--color-success)';
      btn.style.borderColor = 'var(--color-success)';
      
      engine.updateScore(150);
      
      setTimeout(() => {
        advanceQuiz();
      }, 800);
    } else {
      btn.classList.remove('btn--secondary');
      btn.style.background = 'var(--color-danger)';
      btn.style.borderColor = 'var(--color-danger)';
      
      // Highlight correct button
      optionBtns.forEach(b => {
        if (b.textContent === correctName) {
          b.classList.remove('btn--secondary');
          b.classList.add('btn--primary');
          b.style.background = 'var(--color-success)';
          b.style.borderColor = 'var(--color-success)';
        }
      });
      
      engine.decrementLives();
      
      setTimeout(() => {
        if (engine.state.lives > 0) {
          advanceQuiz();
        }
      }, 1000);
    }
  }

  // Advance to next question or level
  function advanceQuiz() {
    currentQuizIdx++;
    
    if (currentQuizIdx < quizQueue.length) {
      loadQuizQuestion();
    } else {
      // Completed level
      setTimeout(() => {
        if (engine.state.level < config.maxLevels) {
          engine.updateScore(400); // level clear bonus
          engine.setLevel(engine.state.level + 1);
          initLevel(engine.state.level);
        } else {
          engine.updateScore(1000); // game clear bonus
          engine.end('win');
        }
      }, 400);
    }
  }

  // Control button binds
  btnPause.addEventListener('click', () => engine.pause());
  btnResume.addEventListener('click', () => engine.resume());
  btnRestart.addEventListener('click', () => engine.start());
  btnRetry.addEventListener('click', () => engine.start());

  // Auto start on load
  engine.start();
});
