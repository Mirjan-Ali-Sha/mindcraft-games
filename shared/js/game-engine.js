/* MindCraft Games - Core Game Engine Base Class */

class GameEngine {
  constructor(config = {}) {
    this.gameId = config.gameId || 'generic-game';
    this.timeLimit = config.timeLimit !== undefined ? config.timeLimit : 60; // 0 means no time limit
    this.maxLevels = config.maxLevels || 10;
    this.initLives = config.initLives || 3;
    
    // Core game state
    this.state = {
      score: 0,
      level: 1,
      lives: this.initLives,
      timeLeft: this.timeLimit,
      isPlaying: false,
      isPaused: false,
      highScore: this.loadHighScore()
    };
    
    // Timer handles
    this.timerInterval = null;
    
    // Callbacks/Event hooks
    this.callbacks = {
      onStart: null,
      onTick: null,
      onPause: null,
      onResume: null,
      onScoreChange: null,
      onLevelChange: null,
      onLivesChange: null,
      onGameOver: null // callback signature: (state, reason: 'time' | 'lives' | 'win')
    };
  }

  // Register event callbacks
  on(event, callback) {
    if (this.callbacks.hasOwnProperty(event)) {
      this.callbacks[event] = callback;
    }
    return this;
  }

  // Game Lifecycle control
  start() {
    this.state.score = 0;
    this.state.level = 1;
    this.state.lives = this.initLives;
    this.state.timeLeft = this.timeLimit;
    this.state.isPlaying = true;
    this.state.isPaused = false;
    
    this.trigger('onScoreChange', this.state.score);
    this.trigger('onLevelChange', this.state.level);
    this.trigger('onLivesChange', this.state.lives);
    
    this.trigger('onStart', this.state);
    
    this.startTimer();
    this.bindUI();
  }

  pause() {
    if (!this.state.isPlaying || this.state.isPaused) return;
    this.state.isPaused = true;
    this.stopTimer();
    this.trigger('onPause', this.state);
  }

  resume() {
    if (!this.state.isPlaying || !this.state.isPaused) return;
    this.state.isPaused = false;
    this.startTimer();
    this.trigger('onResume', this.state);
  }

  end(reason = 'time') {
    if (!this.state.isPlaying) return;
    this.state.isPlaying = false;
    this.stopTimer();
    
    if (this.state.score > this.state.highScore) {
      this.saveHighScore(this.state.score);
    }
    
    this.trigger('onGameOver', this.state, reason);
  }

  // State mutation helpers
  updateScore(points) {
    this.state.score = Math.max(0, this.state.score + points);
    this.updateScoreUI();
    this.trigger('onScoreChange', this.state.score);
  }

  setLevel(level) {
    this.state.level = Math.min(this.maxLevels, Math.max(1, level));
    this.updateLevelUI();
    this.trigger('onLevelChange', this.state.level);
  }

  decrementLives() {
    this.state.lives = Math.max(0, this.state.lives - 1);
    this.updateLivesUI();
    this.trigger('onLivesChange', this.state.lives);
    if (this.state.lives <= 0) {
      this.end('lives');
    }
  }

  // Internal Timer methods
  startTimer() {
    if (this.timeLimit <= 0) return; // No timer
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      if (this.state.isPaused) return;
      this.state.timeLeft--;
      this.trigger('onTick', this.state.timeLeft);
      this.updateTimerUI();
      
      if (this.state.timeLeft <= 0) {
        this.end('time');
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // Local Storage High Scores
  loadHighScore() {
    try {
      return parseInt(localStorage.getItem(`mindcraft_high_${this.gameId}`)) || 0;
    } catch (e) {
      return 0;
    }
  }

  saveHighScore(score) {
    this.state.highScore = score;
    try {
      localStorage.setItem(`mindcraft_high_${this.gameId}`, score.toString());
    } catch (e) {
      console.warn('LocalStorage is blocked or full.');
    }
  }

  // Event dispatcher
  trigger(event, ...args) {
    if (this.callbacks[event]) {
      this.callbacks[event](...args);
    }
  }

  // Standard DOM UI Auto-Binding helpers
  bindUI() {
    this.updateScoreUI();
    this.updateLevelUI();
    this.updateLivesUI();
    this.updateTimerUI();
  }

  updateScoreUI() {
    const el = document.getElementById('score-val');
    if (el) el.textContent = this.state.score;
    const highEl = document.getElementById('high-score-val');
    if (highEl) highEl.textContent = this.state.highScore;
  }

  updateLevelUI() {
    const el = document.getElementById('level-val');
    if (el) {
      el.textContent = this.state.level;
      const parent = el.parentElement;
      if (parent) {
        parent.childNodes.forEach(node => {
          if (node.nodeType === 3 && node.nodeValue.includes('/')) {
            node.nodeValue = `/${this.maxLevels}`;
          }
        });
      }
    }
  }

  updateLivesUI() {
    const el = document.getElementById('lives-val');
    if (el) {
      // Clear and draw hearts
      el.innerHTML = '';
      for (let i = 0; i < this.initLives; i++) {
        const heart = document.createElement('span');
        heart.className = i < this.state.lives ? 'heart active' : 'heart empty';
        heart.innerHTML = i < this.state.lives ? '❤️' : '🖤';
        el.appendChild(heart);
      }
    }
  }

  updateTimerUI() {
    const el = document.getElementById('timer-val');
    const fillEl = document.getElementById('timer-progress');
    
    if (this.timeLimit <= 0) {
      if (el) el.textContent = '∞';
      if (fillEl) fillEl.style.width = '100%';
      return;
    }
    
    if (el) {
      const minutes = Math.floor(this.state.timeLeft / 60);
      const seconds = this.state.timeLeft % 60;
      el.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    if (fillEl) {
      const pct = (this.state.timeLeft / this.timeLimit) * 100;
      fillEl.style.width = `${pct}%`;
    }
  }
}
