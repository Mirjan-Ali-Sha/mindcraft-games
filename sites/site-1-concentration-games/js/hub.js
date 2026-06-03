/* Site 1: Concentration Games - Hub Page Controller */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize PWA features
  if (typeof initPWA === 'function') {
    initPWA('./sw.js');
  }

  // 2. Define the 12 games
  const games = [
    {
      id: 'spot-difference',
      name: 'Spot the Difference',
      desc: 'Compare two side-by-side images and find the differences before time runs out.',
      tag: 'Visual',
      url: './games/spot-difference/index.html',
      img: './assets/spot-difference.png'
    },
    {
      id: 'ball-tracker',
      name: 'Ball Tracker',
      desc: 'Watch the highlighted balls shuffle and trace their positions accurately.',
      tag: 'Attention',
      url: './games/ball-tracker/index.html',
      img: './assets/ball-tracker.png'
    },
    {
      id: 'match-pairs',
      name: 'Match Pairs',
      desc: 'Flip cards and find matches. How fast can you clear the whole board?',
      tag: 'Memory',
      url: './games/match-pairs/index.html',
      img: './assets/match-pairs.png'
    },
    {
      id: 'word-finder',
      name: 'Word Finder',
      desc: 'Connect letter grids to form hidden words matching the visual definition.',
      tag: 'Language',
      url: './games/word-finder/index.html',
      img: './assets/word-finder.png'
    },
    {
      id: 'face-memory',
      name: 'Face Memory',
      desc: 'Remember names and face pairs. Test your social retention skills!',
      tag: 'Memory',
      url: './games/face-memory/index.html',
      img: './assets/face-memory.png'
    },
    {
      id: 'bubble-math',
      name: 'Bubble Math (Add to 10)',
      desc: 'Pop bubble pairs that sum up to 10. Quick math calculations are needed!',
      tag: 'Math',
      url: './games/bubble-math/index.html',
      img: './assets/bubble-math.png'
    },
    {
      id: 'shape-follower',
      name: 'Shape Follower',
      desc: 'A glowing shape sequence will flash on screen. Repeat it exactly.',
      tag: 'Attention',
      url: './games/shape-follower/index.html',
      img: './assets/shape-follower.png'
    },
    {
      id: 'counting-candy',
      name: 'Counting Candy',
      desc: 'Identify and count specific types of candy scattered on screen.',
      tag: 'Visual',
      url: './games/counting-candy/index.html',
      img: './assets/counting-candy.png'
    },
    {
      id: 'card-flip-memory',
      name: 'Card Flip Memory',
      desc: 'Classic card pairs matching game with challenging timers and moves limits.',
      tag: 'Memory',
      url: './games/card-flip-memory/index.html',
      img: './assets/card-flip-memory.png'
    },
    {
      id: 'color-word-stroop',
      name: 'Color Word Stroop',
      desc: 'Identify the text color, not the written word. Speed and inhibition are key!',
      tag: 'Inhibition',
      url: './games/color-word-stroop/index.html',
      img: './assets/color-word-stroop.png'
    },
    {
      id: 'spatial-grid-memory',
      name: 'Spatial Grid Memory',
      desc: 'Memorize which cells in a grid lit up, and tap them in any order.',
      tag: 'Spatial',
      url: './games/spatial-grid-memory/index.html',
      img: './assets/spatial-grid-memory.png'
    },
    {
      id: 'mirror-match',
      name: 'Mirror Match',
      desc: 'Find the correct mirror reflection of the complex shape displayed.',
      tag: 'Visualization',
      url: './games/mirror-match/index.html',
      img: './assets/mirror-match.png'
    }
  ];

  // 3. Render game cards
  const grid = document.getElementById('games-grid');
  if (grid) {
    grid.innerHTML = ''; // Clear fallback content
    
    games.forEach(game => {
      // Load high score from localStorage using GameEngine naming scheme
      let highScore = 0;
      try {
        highScore = parseInt(localStorage.getItem(`mindcraft_high_${game.id}`)) || 0;
      } catch (e) {
        highScore = 0;
      }
      
      const card = document.createElement('div');
      card.className = 'glass-card glass-card--interactive game-card';
      card.innerHTML = `
        <img class="game-card__img" src="${game.img}" alt="${game.name}" onerror="this.src='../../shared/images/placeholder-game.png';">
        <h3 class="game-card__title">${game.name}</h3>
        <p class="game-card__desc">${game.desc}</p>
        <div class="game-card__footer">
          <span class="game-card__tag">${game.tag}</span>
          <span class="game-card__score" style="font-size: 0.85rem; color: var(--text-secondary);">
            Best: <strong style="color: var(--text-primary); font-weight: 700;">${highScore}</strong>
          </span>
        </div>
        <a href="${game.url}" class="btn btn--primary" style="margin-top: var(--space-md); width: 100%;">Play Now</a>
      `;
      grid.appendChild(card);
    });
  }
});
