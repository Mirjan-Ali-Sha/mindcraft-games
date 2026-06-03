# MindCraft Games — Brain Training Portal & Games Hub

MindCraft Games is a premium collection of client-side brain training games designed to enhance cognitive performance. The portal currently hosts a **Concentration Games** suite consisting of 12 highly interactive games targeting sustained focus, selective attention, spatial scanning, multitasking, response inhibition, and processing speed.

## 🚀 Live Demo
Play the games live in your browser:  
[**https://mirjan-ali-sha.github.io/mindcraft-games/index.html**](https://mirjan-ali-sha.github.io/mindcraft-games/index.html)

---

## 🎮 Playable Games
The Concentration suite includes the following 12 playable games:
1. **Spot the Difference**: Search, compare, and identify visual differences between two side-by-side images.
2. **Ball Tracker**: Track multiple moving targets among distractors and identify them when they stop.
3. **Match Pairs**: Memorize a grid of cards and match pairs of emojis with dynamically scaling timers.
4. **Word Finder**: Spell words from shuffled keyboard letters based on emoji visual clues and text definitions.
5. **Face Memory**: Memorize face expressions and recall correct features under pressure.
6. **Bubble Math**: Pop bubbles containing math answers in ascending order.
7. **Shape Follower**: Remember a sequence of highlighted shapes and repeat the pattern.
8. **Counting Candy**: Count various types of candies in a jar under time limits.
9. **Card Flip Memory**: Memorize flipped card grids with limited attempts.
10. **Color Word Stroop**: Select the color of the text rather than reading the word (cognitive inhibition).
11. **Spatial Grid Memory**: Recall the locations of highlighted tiles on expanding grids.
12. **Mirror Match**: Identify which mirror quadrant matches the center target.

---

## ✨ Features & Standards

- **Progressive Web App (PWA)**: Both the root Portal Hub and sub-sites are installable PWAs, allowing you to pin the application to your home screen/desktop.
- **Full Offline Capabilities**: Implemented Service Workers using a cache-first network-fallback caching strategy, allowing the portal hub and all levels of all 12 games to load and play offline.
- **Aesthetic Glassmorphism Design**: Uses smooth CSS gradients, vibrant HSL themes, modern typography (Inter), glassmorphic layouts, and micro-animations.
- **Responsive Layout**: Fluidly adapts across all screen widths from mobile phone viewports (320px) up to high-resolution desktop monitors (1440px+).
- **Mobile Tap Optimization**: Eliminates the mobile browser's default 300ms tap delay using `touch-action: manipulation;` for instant, lag-free input response.
- **Dynamic Difficulty Parameters**: Level configurations progressively scale time limits, grid sizes, memorization timers, and distractor counts as level difficulty increases.
- **Local Storage Integration**: Saves high scores, best speeds, and session statistics client-side.

---

## 🛠️ Architecture
- **Pure Vanilla Stack**: Built with zero external framework dependencies using semantic HTML5, modern CSS3, and ES6+ Javascript.
- **Core Game Engine**: Inherits core states (score, level, lives, timers) from a unified `GameEngine` base class located in `shared/js/game-engine.js`.
- **Modular Design**: Games are isolated self-contained folders containing their own logic and style rules under `sites/site-1-concentration-games/games/`.
- **Global Theme Tokens**: Theme variables, font assets, and base reset styles are unified under the `shared/css/` directory.

---

## 📥 Local Setup & Run

Since the application utilizes Service Workers, it should be run from a local server to resolve scope and cross-origin policies.

1. Clone or copy this repository to your local system.
2. Start a simple HTTP server in the repository root directory, for example:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (npx)
   npx http-server -p 8000
   ```
3. Open your browser and navigate to `http://localhost:8000/index.html`.
