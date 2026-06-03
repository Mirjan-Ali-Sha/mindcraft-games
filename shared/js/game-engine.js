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
    if (points > 0) {
      this.showFloatingScorePopup(points);
    }
  }

  setLevel(level) {
    const prevLevel = this.state.level;
    this.state.level = Math.min(this.maxLevels, Math.max(1, level));
    this.updateLevelUI();
    this.trigger('onLevelChange', this.state.level);
    if (level > prevLevel) {
      this.showLevelPopup(level);
    }
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

  showFloatingScorePopup(points) {
    const scoreValEl = document.getElementById('score-val');
    if (!scoreValEl) return;
    
    const popup = document.createElement('div');
    popup.className = 'floating-score-popup';
    popup.textContent = `+${points}`;
    
    popup.style.position = 'absolute';
    popup.style.color = '#34d399'; // beautiful success green
    popup.style.fontWeight = '800';
    popup.style.fontSize = '1.3rem';
    popup.style.pointerEvents = 'none';
    popup.style.zIndex = '9999';
    popup.style.textShadow = '0 0 10px rgba(52, 211, 153, 0.6)';
    popup.style.transition = 'all 0.8s cubic-bezier(0.18, 0.89, 0.32, 1.28)';
    
    const rect = scoreValEl.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    popup.style.left = `${rect.left + scrollLeft + rect.width / 2}px`;
    popup.style.top = `${rect.top + scrollTop - 10}px`;
    popup.style.transform = 'translate(-50%, 0) scale(0.5)';
    popup.style.opacity = '0';
    
    document.body.appendChild(popup);
    
    requestAnimationFrame(() => {
      popup.style.transform = 'translate(-50%, -30px) scale(1.2)';
      popup.style.opacity = '1';
    });
    
    setTimeout(() => {
      popup.style.opacity = '0';
      popup.style.transform = 'translate(-50%, -50px) scale(0.8)';
      setTimeout(() => {
        popup.remove();
      }, 300);
    }, 600);
  }

  showLevelPopup(level) {
    const popup = document.createElement('div');
    popup.className = 'floating-level-popup';
    
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%) scale(0.2)';
    popup.style.background = 'rgba(15, 23, 42, 0.9)';
    popup.style.backdropFilter = 'blur(12px)';
    popup.style.webkitBackdropFilter = 'blur(12px)';
    popup.style.border = '2px solid #8b5cf6'; // Violet border
    popup.style.boxShadow = '0 10px 40px rgba(139, 92, 246, 0.5), inset 0 0 15px rgba(139, 92, 246, 0.2)';
    popup.style.borderRadius = '16px';
    popup.style.padding = '1rem 2rem';
    popup.style.color = '#ffffff';
    popup.style.textAlign = 'center';
    popup.style.zIndex = '10000';
    popup.style.pointerEvents = 'none';
    popup.style.opacity = '0';
    popup.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    
    popup.innerHTML = `
      <div style="font-size: 0.75rem; color: #a78bfa; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin-bottom: 4px;">Training Progress</div>
      <h2 style="font-size: 1.8rem; margin: 0; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; font-family: Outfit, sans-serif;">Level ${level} Activated!</h2>
    `;
    
    document.body.appendChild(popup);
    
    requestAnimationFrame(() => {
      popup.style.transform = 'translate(-50%, -50%) scale(1)';
      popup.style.opacity = '1';
    });
    
    setTimeout(() => {
      popup.style.transform = 'translate(-50%, -50%) scale(0.8)';
      popup.style.opacity = '0';
      setTimeout(() => {
        popup.remove();
      }, 500);
    }, 1500);
  }
}
