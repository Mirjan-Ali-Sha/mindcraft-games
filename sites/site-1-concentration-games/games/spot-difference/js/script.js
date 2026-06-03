/* Spot the Difference - Game Controller */

document.addEventListener('DOMContentLoaded', () => {
  // Canvases & Contexts
  const canvasLeft = document.getElementById('canvas-left');
  const canvasRight = document.getElementById('canvas-right');
  const ctxLeft = canvasLeft.getContext('2d');
  const ctxRight = canvasRight.getContext('2d');
  
  // UI Elements
  const diffFoundEl = document.getElementById('diff-found');
  const diffTotalEl = document.getElementById('diff-total');
  
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
  const btnHint = document.getElementById('btn-hint');
  const btnResume = document.getElementById('btn-resume');
  const btnRetry = document.getElementById('btn-retry');

  // Level data definition (vector-drawn scenes)
  const baseScenes = [
    {
      // LEVEL 1: Mountain Cottage
      name: 'Mountain Cottage',
      drawBackground: (ctx) => {
        // Sky
        const skyGrad = ctx.createLinearGradient(0, 0, 0, 150);
        skyGrad.addColorStop(0, '#0284c7');
        skyGrad.addColorStop(1, '#bae6fd');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, 400, 300);
        
        // Sun
        ctx.beginPath();
        ctx.arc(340, 50, 25, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
        
        // Mountains
        ctx.beginPath();
        ctx.moveTo(-20, 200);
        ctx.lineTo(120, 80);
        ctx.lineTo(260, 200);
        ctx.fillStyle = '#475569';
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(150, 200);
        ctx.lineTo(280, 100);
        ctx.lineTo(420, 200);
        ctx.fillStyle = '#334155';
        ctx.fill();
        
        // Ground/Lawn
        ctx.beginPath();
        ctx.moveTo(-10, 200);
        ctx.quadraticCurveTo(200, 180, 410, 200);
        ctx.lineTo(410, 310);
        ctx.lineTo(-10, 310);
        ctx.fillStyle = '#16a34a';
        ctx.fill();
        
        // House base
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(70, 150, 90, 70);
        
        // Roof
        ctx.beginPath();
        ctx.moveTo(60, 150);
        ctx.lineTo(115, 110);
        ctx.lineTo(170, 150);
        ctx.fillStyle = '#b91c1c';
        ctx.fill();
        
        // Window
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(80, 165, 20, 20);
        ctx.strokeStyle = '#64748b';
        ctx.strokeRect(80, 165, 20, 20);
      },
      differences: [
        {
          id: 0, x: 145, y: 185, r: 18, // Door Doorknob/Color
          drawOriginal: (ctx) => {
            ctx.fillStyle = '#78350f'; // Brown door
            ctx.fillRect(130, 170, 22, 50);
            ctx.beginPath();
            ctx.arc(147, 195, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#fbbf24'; // Yellow knob
            ctx.fill();
          },
          drawDifference: (ctx) => {
            ctx.fillStyle = '#78350f';
            ctx.fillRect(130, 170, 22, 50);
            // No knob! (Difference)
          }
        },
        {
          id: 1, x: 145, y: 95, r: 18, // Chimney Smoke
          drawOriginal: (ctx) => {
            // Chimney
            ctx.fillStyle = '#475569';
            ctx.fillRect(135, 115, 12, 25);
            // Smoke
            ctx.strokeStyle = 'rgba(255,255,255,0.6)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(141, 110);
            ctx.quadraticCurveTo(145, 95, 138, 90);
            ctx.quadraticCurveTo(150, 80, 142, 70);
            ctx.stroke();
          },
          drawDifference: (ctx) => {
            // Chimney with no smoke!
            ctx.fillStyle = '#475569';
            ctx.fillRect(135, 115, 12, 25);
          }
        },
        {
          id: 2, x: 210, y: 55, r: 25, // Sky Cloud
          drawOriginal: (ctx) => {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.beginPath();
            ctx.arc(200, 55, 15, 0, Math.PI * 2);
            ctx.arc(215, 50, 18, 0, Math.PI * 2);
            ctx.arc(230, 55, 15, 0, Math.PI * 2);
            ctx.fill();
          },
          drawDifference: (ctx) => {
            // Cloud is missing!
          }
        },
        {
          id: 3, x: 280, y: 235, r: 18, // Red vs Yellow Flower
          drawOriginal: (ctx) => {
            // Stem
            ctx.strokeStyle = '#15803d';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(280, 250);
            ctx.lineTo(280, 235);
            ctx.stroke();
            // Yellow Petals
            ctx.fillStyle = '#eab308';
            ctx.beginPath();
            ctx.arc(280, 230, 6, 0, Math.PI * 2);
            ctx.arc(274, 235, 5, 0, Math.PI * 2);
            ctx.arc(286, 235, 5, 0, Math.PI * 2);
            ctx.fill();
          },
          drawDifference: (ctx) => {
            ctx.strokeStyle = '#15803d';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(280, 250);
            ctx.lineTo(280, 235);
            ctx.stroke();
            // Red Petals instead! (Difference)
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(280, 230, 6, 0, Math.PI * 2);
            ctx.arc(274, 235, 5, 0, Math.PI * 2);
            ctx.arc(286, 235, 5, 0, Math.PI * 2);
            ctx.fill();
          }
        },
        {
          id: 4, x: 30, y: 260, r: 20, // Extra small bush on lawn
          drawOriginal: (ctx) => {
            // Empty space
          },
          drawDifference: (ctx) => {
            // A cute little round green bush
            ctx.fillStyle = '#15803d';
            ctx.beginPath();
            ctx.arc(25, 265, 12, 0, Math.PI * 2);
            ctx.arc(35, 265, 10, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      ]
    },
    {
      // LEVEL 2: Space Station
      name: 'Retro Space',
      drawBackground: (ctx) => {
        // Space gradient
        const spaceGrad = ctx.createLinearGradient(0, 0, 0, 300);
        spaceGrad.addColorStop(0, '#090514');
        spaceGrad.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = spaceGrad;
        ctx.fillRect(0, 0, 400, 300);
        
        // Stars
        ctx.fillStyle = '#ffffff';
        const starCoords = [[30,20], [80,45], [120,15], [290,30], [380,40], [45,180], [370,190]];
        starCoords.forEach(pt => {
          ctx.fillRect(pt[0], pt[1], 2, 2);
        });
        
        // Planet Sun
        ctx.beginPath();
        ctx.arc(60, 240, 70, 0, Math.PI * 2);
        ctx.fillStyle = '#fb923c';
        ctx.fill();
        
        // Rocket base
        ctx.save();
        ctx.translate(220, 140);
        ctx.rotate(-Math.PI / 4);
        
        // Body
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-15, -40, 30, 80);
        
        // Nose Cone
        ctx.beginPath();
        ctx.moveTo(-15, -40);
        ctx.lineTo(0, -70);
        ctx.lineTo(15, -40);
        ctx.closePath();
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        
        ctx.restore();
      },
      differences: [
        {
          id: 0, x: 220, y: 140, r: 18, // Rocket Window Color
          drawOriginal: (ctx) => {
            // Blue window
            ctx.beginPath();
            ctx.arc(220, 140, 8, 0, Math.PI * 2);
            ctx.fillStyle = '#38bdf8';
            ctx.fill();
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 2;
            ctx.stroke();
          },
          drawDifference: (ctx) => {
            // Yellow window (Difference)
            ctx.beginPath();
            ctx.arc(220, 140, 8, 0, Math.PI * 2);
            ctx.fillStyle = '#fbbf24';
            ctx.fill();
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        },
        {
          id: 1, x: 330, y: 80, r: 25, // Glowing Saturn ring
          drawOriginal: (ctx) => {
            // Saturn planet
            ctx.beginPath();
            ctx.arc(330, 80, 15, 0, Math.PI * 2);
            ctx.fillStyle = '#f59e0b';
            ctx.fill();
            // Saturn ring
            ctx.save();
            ctx.translate(330, 80);
            ctx.rotate(0.3);
            ctx.beginPath();
            ctx.ellipse(0, 0, 26, 6, 0, 0, Math.PI * 2);
            ctx.strokeStyle = '#fed7aa';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.restore();
          },
          drawDifference: (ctx) => {
            // Planet but NO ring!
            ctx.beginPath();
            ctx.arc(330, 80, 15, 0, Math.PI * 2);
            ctx.fillStyle = '#f59e0b';
            ctx.fill();
          }
        },
        {
          id: 2, x: 110, y: 210, r: 16, // Orange Sun crater
          drawOriginal: (ctx) => {
            // Small crater
            ctx.beginPath();
            ctx.arc(110, 210, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#ea580c';
            ctx.fill();
          },
          drawDifference: (ctx) => {
            // No crater!
          }
        },
        {
          id: 3, x: 260, y: 190, r: 18, // Flame length
          drawOriginal: (ctx) => {
            // Rocket Fire
            ctx.beginPath();
            ctx.moveTo(180, 180);
            ctx.lineTo(165, 205);
            ctx.lineTo(190, 190);
            ctx.closePath();
            ctx.fillStyle = '#f97316';
            ctx.fill();
          },
          drawDifference: (ctx) => {
            // Much bigger fire!
            ctx.beginPath();
            ctx.moveTo(180, 180);
            ctx.lineTo(150, 220);
            ctx.lineTo(195, 195);
            ctx.closePath();
            ctx.fillStyle = '#ef4444';
            ctx.fill();
          }
        },
        {
          id: 4, x: 150, y: 60, r: 20, // Floating alien UFO
          drawOriginal: (ctx) => {
            // Empty sky
          },
          drawDifference: (ctx) => {
            // UFO saucer
            ctx.fillStyle = '#a8a29e';
            ctx.beginPath();
            ctx.ellipse(150, 60, 15, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            // Dome
            ctx.fillStyle = '#06b6d4';
            ctx.beginPath();
            ctx.arc(150, 56, 6, Math.PI, 0);
            ctx.fill();
          }
        }
      ]
    },
    {
      // LEVEL 3: Deep Sea Reef
      name: 'Deep Sea Reef',
      drawBackground: (ctx) => {
        // Deep blue gradient
        const seaGrad = ctx.createLinearGradient(0, 0, 0, 300);
        seaGrad.addColorStop(0, '#075985');
        seaGrad.addColorStop(1, '#0c4a6e');
        ctx.fillStyle = seaGrad;
        ctx.fillRect(0, 0, 400, 300);
        
        // Sea floor sand
        ctx.beginPath();
        ctx.moveTo(-10, 270);
        ctx.quadraticCurveTo(150, 250, 410, 270);
        ctx.lineTo(410, 310);
        ctx.lineTo(-10, 310);
        ctx.fillStyle = '#ca8a04';
        ctx.fill();
        
        // Tall Coral/Seaweed
        ctx.fillStyle = '#047857';
        ctx.beginPath();
        ctx.ellipse(320, 220, 15, 60, -0.1, 0, Math.PI * 2);
        ctx.ellipse(350, 230, 12, 50, 0.1, 0, Math.PI * 2);
        ctx.fill();
      },
      differences: [
        {
          id: 0, x: 60, y: 265, r: 18, // Starfish color
          drawOriginal: (ctx) => {
            // Pink starfish
            ctx.fillStyle = '#ec4899';
            ctx.beginPath();
            ctx.arc(60, 265, 8, 0, Math.PI*2);
            ctx.fill();
            ctx.fillRect(48, 263, 24, 4);
            ctx.fillRect(58, 253, 4, 24);
          },
          drawDifference: (ctx) => {
            // Yellow starfish
            ctx.fillStyle = '#eab308';
            ctx.beginPath();
            ctx.arc(60, 265, 8, 0, Math.PI*2);
            ctx.fill();
            ctx.fillRect(48, 263, 24, 4);
            ctx.fillRect(58, 253, 4, 24);
          }
        },
        {
          id: 1, x: 220, y: 120, r: 20, // Swimming fish direction
          drawOriginal: (ctx) => {
            // Red fish swimming right
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.ellipse(220, 120, 12, 7, 0, 0, Math.PI * 2);
            ctx.fill();
            // Tail
            ctx.beginPath();
            ctx.moveTo(208, 120);
            ctx.lineTo(200, 113);
            ctx.lineTo(200, 127);
            ctx.fill();
          },
          drawDifference: (ctx) => {
            // Red fish swimming LEFT (Difference)
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.ellipse(220, 120, 12, 7, 0, 0, Math.PI * 2);
            ctx.fill();
            // Tail on the right side now!
            ctx.beginPath();
            ctx.moveTo(232, 120);
            ctx.lineTo(240, 113);
            ctx.lineTo(240, 127);
            ctx.fill();
          }
        },
        {
          id: 2, x: 130, y: 70, r: 15, // Floating bubble group
          drawOriginal: (ctx) => {
            // Bubble 1
            ctx.strokeStyle = 'rgba(255,255,255,0.6)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(130, 70, 6, 0, Math.PI * 2);
            ctx.stroke();
            // Bubble 2
            ctx.beginPath();
            ctx.arc(138, 60, 4, 0, Math.PI * 2);
            ctx.stroke();
          },
          drawDifference: (ctx) => {
            // Bubble 1 only!
            ctx.strokeStyle = 'rgba(255,255,255,0.6)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(130, 70, 6, 0, Math.PI * 2);
            ctx.stroke();
          }
        },
        {
          id: 3, x: 290, y: 220, r: 18, // Sea anemone color
          drawOriginal: (ctx) => {
            // Orange coral
            ctx.fillStyle = '#f97316';
            ctx.fillRect(282, 210, 16, 40);
            ctx.beginPath();
            ctx.arc(290, 210, 8, 0, Math.PI*2);
            ctx.fill();
          },
          drawDifference: (ctx) => {
            // Violet coral (Difference)
            ctx.fillStyle = '#a855f7';
            ctx.fillRect(282, 210, 16, 40);
            ctx.beginPath();
            ctx.arc(290, 210, 8, 0, Math.PI*2);
            ctx.fill();
          }
        },
        {
          id: 4, x: 150, y: 200, r: 25, // Sunken Treasure chest
          drawOriginal: (ctx) => {
            // Empty sand area
          },
          drawDifference: (ctx) => {
            // Simple brown chest
            ctx.fillStyle = '#78350f';
            ctx.fillRect(138, 190, 24, 16);
            ctx.fillStyle = '#fbbf24'; // Yellow latch
            ctx.fillRect(148, 196, 4, 4);
          }
        }
      ]
    },
    {
      // LEVEL 4: Desert Oasis
      name: 'Desert Oasis',
      drawBackground: (ctx) => {
        // Sunset sky
        const sunsetGrad = ctx.createLinearGradient(0, 0, 0, 180);
        sunsetGrad.addColorStop(0, '#ea580c'); // orange
        sunsetGrad.addColorStop(1, '#fef08a'); // light yellow
        ctx.fillStyle = sunsetGrad;
        ctx.fillRect(0, 0, 400, 300);
        
        // Dunes
        ctx.beginPath();
        ctx.moveTo(-20, 240);
        ctx.quadraticCurveTo(150, 180, 420, 250);
        ctx.lineTo(420, 310);
        ctx.lineTo(-20, 310);
        ctx.fillStyle = '#f59e0b'; // golden sand
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(-10, 260);
        ctx.quadraticCurveTo(280, 220, 420, 280);
        ctx.lineTo(420, 310);
        ctx.lineTo(-10, 310);
        ctx.fillStyle = '#d97706'; // darker sand
        ctx.fill();
        
        // Oasis pool
        ctx.beginPath();
        ctx.ellipse(200, 275, 75, 20, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#0284c7'; // blue water
        ctx.fill();
      },
      differences: [
        {
          id: 0, x: 200, y: 275, r: 25, // Oasis pool color
          drawOriginal: (ctx) => {
            // Pool is blue
            ctx.beginPath();
            ctx.ellipse(200, 275, 75, 20, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#0284c7';
            ctx.fill();
          },
          drawDifference: (ctx) => {
            // Pool is purple/cyan (Difference)
            ctx.beginPath();
            ctx.ellipse(200, 275, 75, 20, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#0d9488'; // teal water
            ctx.fill();
          }
        },
        {
          id: 1, x: 100, y: 190, r: 22, // Palm tree coconuts
          drawOriginal: (ctx) => {
            // Palm trunk
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(90, 240);
            ctx.quadraticCurveTo(95, 200, 105, 170);
            ctx.stroke();
            // Leaves
            ctx.fillStyle = '#15803d';
            ctx.beginPath();
            ctx.ellipse(105, 170, 22, 8, -0.4, 0, Math.PI * 2);
            ctx.ellipse(105, 170, 22, 8, 0.4, 0, Math.PI * 2);
            ctx.ellipse(105, 170, 8, 22, 0, 0, Math.PI * 2);
            ctx.fill();
            // Coconuts
            ctx.beginPath();
            ctx.arc(102, 176, 3, 0, Math.PI * 2);
            ctx.arc(109, 174, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#451a03';
            ctx.fill();
          },
          drawDifference: (ctx) => {
            // Palm trunk and leaves
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(90, 240);
            ctx.quadraticCurveTo(95, 200, 105, 170);
            ctx.stroke();
            ctx.fillStyle = '#15803d';
            ctx.beginPath();
            ctx.ellipse(105, 170, 22, 8, -0.4, 0, Math.PI * 2);
            ctx.ellipse(105, 170, 22, 8, 0.4, 0, Math.PI * 2);
            ctx.ellipse(105, 170, 8, 22, 0, 0, Math.PI * 2);
            ctx.fill();
            // NO coconuts! (Difference)
          }
        },
        {
          id: 2, x: 300, y: 70, r: 20, // Crescent Moon
          drawOriginal: (ctx) => {
            // Moon
            ctx.beginPath();
            ctx.arc(300, 70, 16, 0, Math.PI * 2);
            ctx.fillStyle = '#fef08a';
            ctx.fill();
            // Mask to make crescent
            ctx.beginPath();
            ctx.arc(293, 70, 16, 0, Math.PI * 2);
            ctx.fillStyle = '#ea580c';
            ctx.fill();
          },
          drawDifference: (ctx) => {
            // Moon is missing!
          }
        },
        {
          id: 3, x: 300, y: 180, r: 25, // Small pyramid
          drawOriginal: (ctx) => {
            // Empty space
          },
          drawDifference: (ctx) => {
            // Pyramid outline in background sand
            ctx.beginPath();
            ctx.moveTo(270, 220);
            ctx.lineTo(300, 180);
            ctx.lineTo(330, 220);
            ctx.closePath();
            ctx.fillStyle = '#d97706';
            ctx.fill();
          }
        },
        {
          id: 4, x: 260, y: 225, r: 18, // Camel silhouette
          drawOriginal: (ctx) => {
            // Small camel standing near oasis
            ctx.fillStyle = '#451a03';
            // Body
            ctx.fillRect(250, 220, 20, 10);
            // Hump
            ctx.beginPath();
            ctx.arc(260, 218, 6, 0, Math.PI, true);
            ctx.fill();
            // Legs
            ctx.fillRect(252, 230, 2, 8);
            // Neck/Head
            ctx.fillRect(268, 210, 4, 12);
          },
          drawDifference: (ctx) => {
            // Camel is missing! (Difference)
          }
        }
      ]
    },
    {
      // LEVEL 5: City Skyline
      name: 'City Skyline',
      drawBackground: (ctx) => {
        // Dark violet sky
        const nightGrad = ctx.createLinearGradient(0, 0, 0, 300);
        nightGrad.addColorStop(0, '#090514');
        nightGrad.addColorStop(1, '#2e1065');
        ctx.fillStyle = nightGrad;
        ctx.fillRect(0, 0, 400, 300);
        
        // Stars/Lights
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        const skyLights = [[40,40], [120,60], [180,30], [280,50], [350,70]];
        skyLights.forEach(pt => {
          ctx.beginPath();
          ctx.arc(pt[0], pt[1], 1.5, 0, Math.PI * 2);
          ctx.fill();
        });
        
        // Background buildings
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(30, 120, 60, 180);
        ctx.fillRect(150, 140, 70, 160);
        ctx.fillRect(270, 100, 80, 200);
        
        // Foreground building block
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(100, 160, 80, 140);
        ctx.fillRect(210, 180, 90, 120);
      },
      differences: [
        {
          id: 0, x: 310, y: 75, r: 18, // Building Antenna Light
          drawOriginal: (ctx) => {
            // Antenna rod
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(310, 100);
            ctx.lineTo(310, 75);
            ctx.stroke();
            // Glowing red light
            ctx.beginPath();
            ctx.arc(310, 75, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#ef4444';
            ctx.fill();
          },
          drawDifference: (ctx) => {
            // Antenna rod with NO blinking red light (Difference)
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(310, 100);
            ctx.lineTo(310, 75);
            ctx.stroke();
          }
        },
        {
          id: 1, x: 185, y: 165, r: 18, // Extra window on building
          drawOriginal: (ctx) => {
            // Empty space on building facade
          },
          drawDifference: (ctx) => {
            // Blinking golden window (Difference)
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(180, 160, 10, 14);
          }
        },
        {
          id: 2, x: 60, y: 40, r: 25, // Crescent Moon
          drawOriginal: (ctx) => {
            // Glowing moon
            ctx.beginPath();
            ctx.arc(60, 40, 15, 0, Math.PI * 2);
            ctx.fillStyle = '#e0f2fe';
            ctx.shadowColor = '#e0f2fe';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0; // reset
          },
          drawDifference: (ctx) => {
            // Crescent moon (Difference)
            ctx.beginPath();
            ctx.arc(60, 40, 15, 0, Math.PI * 2);
            ctx.fillStyle = '#e0f2fe';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(54, 40, 15, 0, Math.PI * 2);
            ctx.fillStyle = '#090514';
            ctx.fill();
          }
        },
        {
          id: 3, x: 130, y: 90, r: 20, // Helicopter
          drawOriginal: (ctx) => {
            // Empty sky
          },
          drawDifference: (ctx) => {
            // Small plane/helicopter blinking silhouette
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.ellipse(130, 90, 8, 4, 0, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(125, 87, 10, 1);
          }
        },
        {
          id: 4, x: 250, y: 206, r: 16, // Building window patterns color
          drawOriginal: (ctx) => {
            // Row of windows on building
            ctx.fillStyle = '#eab308';
            ctx.fillRect(230, 200, 8, 12);
            ctx.fillRect(250, 200, 8, 12);
            ctx.fillRect(270, 200, 8, 12);
          },
          drawDifference: (ctx) => {
            // One window color is cyan (Difference)
            ctx.fillStyle = '#eab308';
            ctx.fillRect(230, 200, 8, 12);
            ctx.fillStyle = '#22d3ee'; // cyan
            ctx.fillRect(250, 200, 8, 12);
            ctx.fillStyle = '#eab308';
            ctx.fillRect(270, 200, 8, 12);
          }
        }
      ]
    },
    {
      // LEVEL 6: Winter Forest
      name: 'Winter Forest',
      drawBackground: (ctx) => {
        // Soft grey-blue sky
        const winterGrad = ctx.createLinearGradient(0, 0, 0, 300);
        winterGrad.addColorStop(0, '#cbd5e1');
        winterGrad.addColorStop(1, '#f1f5f9');
        ctx.fillStyle = winterGrad;
        ctx.fillRect(0, 0, 400, 300);
        
        // Snow hills
        ctx.beginPath();
        ctx.moveTo(-10, 250);
        ctx.quadraticCurveTo(100, 230, 220, 260);
        ctx.quadraticCurveTo(320, 240, 410, 260);
        ctx.lineTo(410, 310);
        ctx.lineTo(-10, 310);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        
        // Pine tree base
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.moveTo(320, 250);
        ctx.lineTo(290, 160);
        ctx.lineTo(350, 160);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(320, 180);
        ctx.lineTo(300, 110);
        ctx.lineTo(340, 110);
        ctx.closePath();
        ctx.fill();
        
        // Trunk
        ctx.fillStyle = '#78350f';
        ctx.fillRect(315, 250, 10, 25);
      },
      differences: [
        {
          id: 0, x: 120, y: 220, r: 25, // Snowman Scarf Color
          drawOriginal: (ctx) => {
            // Snowman body
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(120, 240, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(120, 208, 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // Face features
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(115, 205, 1.5, 0, Math.PI * 2);
            ctx.arc(125, 205, 1.5, 0, Math.PI * 2);
            ctx.fill();
            // Carrot nose
            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            ctx.moveTo(120, 208);
            ctx.lineTo(132, 210);
            ctx.lineTo(120, 212);
            ctx.fill();
            // Red scarf (Original)
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(110, 218, 20, 5);
            ctx.fillRect(124, 223, 5, 12);
          },
          drawDifference: (ctx) => {
            // Snowman with Blue scarf (Difference)
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(120, 240, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(120, 208, 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(115, 205, 1.5, 0, Math.PI * 2);
            ctx.arc(125, 205, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            ctx.moveTo(120, 208);
            ctx.lineTo(132, 210);
            ctx.lineTo(120, 212);
            ctx.fill();
            // Blue scarf (Difference)
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(110, 218, 20, 5);
            ctx.fillRect(124, 223, 5, 12);
          }
        },
        {
          id: 1, x: 120, y: 185, r: 16, // Snowman Hat Type
          drawOriginal: (ctx) => {
            // Black Top Hat
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(108, 192, 24, 3); // Brim
            ctx.fillRect(113, 178, 14, 14); // Crown
          },
          drawDifference: (ctx) => {
            // Green bucket hat (Difference)
            ctx.fillStyle = '#16a34a';
            ctx.beginPath();
            ctx.moveTo(110, 194);
            ctx.lineTo(114, 180);
            ctx.lineTo(126, 180);
            ctx.lineTo(130, 194);
            ctx.closePath();
            ctx.fill();
          }
        },
        {
          id: 2, x: 320, y: 95, r: 18, // Star on Tree Top
          drawOriginal: (ctx) => {
            // Gold star on top of pine tree
            ctx.beginPath();
            ctx.arc(320, 95, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#facc15';
            ctx.fill();
          },
          drawDifference: (ctx) => {
            // No star! (Difference)
          }
        },
        {
          id: 3, x: 230, y: 150, r: 22, // Floating Snow cloud
          drawOriginal: (ctx) => {
            // Soft snow cloud
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.beginPath();
            ctx.arc(220, 150, 10, 0, Math.PI * 2);
            ctx.arc(232, 145, 12, 0, Math.PI * 2);
            ctx.arc(244, 150, 10, 0, Math.PI * 2);
            ctx.fill();
          },
          drawDifference: (ctx) => {
            // No cloud! (Difference)
          }
        },
        {
          id: 4, x: 220, y: 255, r: 16, // Rabbit silhouette
          drawOriginal: (ctx) => {
            // Small rabbit silhouette on snow
            ctx.fillStyle = '#e2e8f0';
            ctx.beginPath();
            ctx.ellipse(220, 255, 6, 4, 0, 0, Math.PI*2);
            ctx.ellipse(224, 250, 3, 3, 0, 0, Math.PI*2);
            ctx.fill();
            // Ears
            ctx.fillRect(222, 244, 1.5, 5);
            ctx.fillRect(224.5, 244, 1.5, 5);
          },
          drawDifference: (ctx) => {
            // Rabbit is missing!
          }
        }
      ]
    }
  ];

  // Dynamically generate 20 levels from base scenes
  const levels = [];
  for (let i = 1; i <= 20; i++) {
    const baseScene = baseScenes[(i - 1) % baseScenes.length];
    
    let diffCount = 2;
    if (i > 5) diffCount = 3;
    if (i > 10) diffCount = 4;
    if (i > 15) diffCount = 5;
    
    const diffsSlice = baseScene.differences.slice(0, diffCount);
    
    let levelTime = 0;
    if (i >= 6) {
      levelTime = Math.max(30, 100 - (i - 6) * 5); // Level 6 = 100s, Level 20 = 30s
    }
    
    levels.push({
      name: `${baseScene.name} - Part ${Math.ceil(i / 3)}`,
      drawBackground: baseScene.drawBackground,
      differences: diffsSlice.map((d, index) => ({
        ...d,
        id: index
      })),
      timeLimit: levelTime
    });
  }

  // Game configuration
  const config = {
    gameId: 'spot-difference',
    timeLimit: 0,
    maxLevels: 20,
    initLives: 3
  };

  // State tracker for current differences
  let foundDifferences = [];
  let currentLevelData = levels[0];

  // Instantiate Core GameEngine
  const engine = new GameEngine(config);

  // Hook Engine event callbacks
  engine.on('onStart', (state) => {
    overlayPause.classList.remove('overlay--active');
    overlayGameOver.classList.remove('overlay--active');
    initLevel(state.level);
  });

  engine.on('onTick', () => {
    // Standard binding does it, but we can play sound / warnings if low time
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
      gameoverTitle.textContent = '🎉 Congratulations!';
      gameoverTitle.style.color = 'var(--color-success)';
      gameoverDesc.textContent = `Excellent concentration! You found all differences and completed the training.`;
    } else if (reason === 'lives') {
      gameoverTitle.textContent = '💔 Out of Lives!';
      gameoverTitle.style.color = 'var(--color-danger)';
      gameoverDesc.textContent = `You clicked too many wrong items. Train your focus and try again!`;
    } else {
      gameoverTitle.textContent = "⏱ Time's Up!";
      gameoverTitle.style.color = 'var(--color-danger)';
      gameoverDesc.textContent = `You ran out of time. Boost your speed and scan quicker!`;
    }
  });

  // Setup/Render Level
  function initLevel(levelNum) {
    currentLevelData = levels[levelNum - 1];
    foundDifferences = [];
    
    diffFoundEl.textContent = '0';
    diffTotalEl.textContent = currentLevelData.differences.length.toString();
    
    // Scale timer dynamically
    engine.timeLimit = currentLevelData.timeLimit;
    engine.state.timeLeft = currentLevelData.timeLimit;
    engine.updateTimerUI();
    
    if (currentLevelData.timeLimit <= 0) {
      engine.stopTimer();
    } else {
      engine.startTimer();
    }
    
    drawScene();
  }

  // Draw full scene to canvases
  function drawScene() {
    // 1. Clear canvases
    ctxLeft.clearRect(0, 0, 400, 300);
    ctxRight.clearRect(0, 0, 400, 300);

    // 2. Draw Backgrounds
    currentLevelData.drawBackground(ctxLeft);
    currentLevelData.drawBackground(ctxRight);

    // 3. Draw original/differences
    currentLevelData.differences.forEach(diff => {
      const isFound = foundDifferences.includes(diff.id);
      
      // Original is always on the left canvas
      diff.drawOriginal(ctxLeft);
      
      // If found, we also draw the original on the right canvas (revealed)
      // If not found, we draw the difference on the right canvas
      if (isFound) {
        diff.drawOriginal(ctxRight);
      } else {
        diff.drawDifference(ctxRight);
      }

      // Draw green circles around already found items
      if (isFound) {
        drawIndicator(ctxLeft, diff.x, diff.y, diff.r);
        drawIndicator(ctxRight, diff.x, diff.y, diff.r);
      }
    });
  }

  // Draw green success indicator circle
  function drawIndicator(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'var(--color-success)';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(16, 185, 129, 0.4)';
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.shadowBlur = 0; // reset
  }

  // Click Handler logic
  function handleCanvasClick(e, canvas) {
    if (!engine.state.isPlaying || engine.state.isPaused) return;

    // Translate click to canvas pixels
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Show visual tap marker at the exact click position
    showTapMarker(canvas, clickX, clickY);

    // Check if clicked near any differences
    // Use a minimum effective radius to ensure mobile touch targets are large enough
    const MIN_TAP_RADIUS = 22;
    let hitDifference = false;

    for (let i = 0; i < currentLevelData.differences.length; i++) {
      const diff = currentLevelData.differences[i];
      const dist = Math.hypot(clickX - diff.x, clickY - diff.y);
      const effectiveRadius = Math.max(diff.r, MIN_TAP_RADIUS);

      if (dist <= effectiveRadius) {
        hitDifference = true;
        if (!foundDifferences.includes(diff.id)) {
          // Found new difference!
          foundDifferences.push(diff.id);
          engine.updateScore(100);
          diffFoundEl.textContent = foundDifferences.length.toString();
          
          // Re-draw scenes
          drawScene();
          
          // Flash green success flash
          flashCanvas(canvas, 'rgba(16, 185, 129, 0.2)');

          // Check if level complete
          if (foundDifferences.length === currentLevelData.differences.length) {
            handleLevelComplete();
          }
        }
        break; // stop checking once we hit one
      }
    }

    // Wrong click penalty (only if we didn't hit any difference zone)
    if (!hitDifference) {
      engine.decrementLives();
      flashCanvas(canvas, 'rgba(239, 68, 68, 0.25)');
    }
  }

  // Visual tap marker: shows a small crosshair at the exact tap position
  function showTapMarker(canvas, x, y) {
    const ctx = canvas === canvasLeft ? ctxLeft : ctxRight;
    const markerSize = 8;

    // Draw crosshair
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 3;

    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(x - markerSize, y);
    ctx.lineTo(x + markerSize, y);
    ctx.stroke();

    // Vertical line
    ctx.beginPath();
    ctx.moveTo(x, y - markerSize);
    ctx.lineTo(x, y + markerSize);
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();

    // Clear the marker after a short delay by re-drawing the scene
    setTimeout(() => {
      drawScene();
    }, 350);
  }

  // Visual feedback flash
  function flashCanvas(canvas, color) {
    canvas.style.borderColor = color.includes('239') ? 'var(--color-danger)' : 'var(--color-success)';
    setTimeout(() => {
      canvas.style.borderColor = 'var(--glass-border)';
    }, 200);
  }

  // Next level / Win handler
  function handleLevelComplete() {
    if (engine.state.level < config.maxLevels) {
      // Advance to next level
      engine.updateScore(300); // Level completion bonus
      engine.setLevel(engine.state.level + 1);
      initLevel(engine.state.level);
    } else {
      // Completed all levels! Game Win!
      engine.updateScore(1000); // Game clear bonus
      engine.end('win');
    }
  }

  // Helper to handle snapping taps and preventing drag click triggers on canvases
  function bindTapHandler(canvas, handler) {
    let pointerStart = null;
    
    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault(); // Prevent default browser behaviors (scroll, zoom)
      pointerStart = {
        x: e.clientX,
        y: e.clientY,
        time: Date.now()
      };
    });
    
    canvas.addEventListener('pointerup', (e) => {
      e.preventDefault();
      if (!pointerStart) return;
      const dx = e.clientX - pointerStart.x;
      const dy = e.clientY - pointerStart.y;
      const dist = Math.hypot(dx, dy);
      const elapsed = Date.now() - pointerStart.time;
      
      // Finger moved less than 15px and held for less than 600ms = valid tap
      // Mobile users often hold slightly longer than desktop clicks
      if (dist < 15 && elapsed < 600) {
        handler({
          clientX: pointerStart.x,
          clientY: pointerStart.y,
          target: e.target
        });
      }
      pointerStart = null;
    });
    
    canvas.addEventListener('pointercancel', () => {
      pointerStart = null;
    });
  }

  // Bind clicks on both left and right canvases
  bindTapHandler(canvasLeft, (e) => handleCanvasClick(e, canvasLeft));
  bindTapHandler(canvasRight, (e) => handleCanvasClick(e, canvasRight));

  // Controls UI Action Binds
  btnPause.addEventListener('click', () => engine.pause());
  btnResume.addEventListener('click', () => engine.resume());
  btnRestart.addEventListener('click', () => engine.start());
  btnRetry.addEventListener('click', () => engine.start());
  
  // Hint logic: highlights one unfound difference
  btnHint.addEventListener('click', () => {
    if (!engine.state.isPlaying || engine.state.isPaused) return;
    
    // Find first unfound difference
    const unfound = currentLevelData.differences.find(d => !foundDifferences.includes(d.id));
    if (unfound) {
      // Mark as found
      foundDifferences.push(unfound.id);
      engine.updateScore(-50); // Hint penalty
      diffFoundEl.textContent = foundDifferences.length.toString();
      
      drawScene();
      
      if (foundDifferences.length === currentLevelData.differences.length) {
        handleLevelComplete();
      }
    }
  });

  // Side by Side toggle for mobile
  const btnSideBySide = document.getElementById('btn-side-by-side');
  const canvasWrapper = document.querySelector('.canvas-wrapper');
  
  btnSideBySide.addEventListener('click', () => {
    canvasWrapper.classList.toggle('side-by-side');
    btnSideBySide.classList.toggle('active');
  });

  // Auto-start game on load
  engine.start();
});
