// Mirror Maze Horror Game
// A psychological horror game where mirrors show disturbing reflections

class MirrorMaze {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.player = {
      x: 5,
      y: 5,
      angle: 0,
      sanity: 100
    };
    this.maze = [];
    this.mazeSize = 15;
    this.cellSize = 64;
    this.fov = Math.PI / 3;
    this.renderDistance = 10;
    this.keys = {};
    this.mirrors = [];
    this.mirrorGlitchLevel = 0;
    this.lastMirrorTime = 0;
    this.gameRunning = false;
    this.exitPos = null;
    this.disturbingSounds = [];

    this.bindEvents();
    this.initAudio();
  }

  bindEvents() {
    document.getElementById('start-button')?.addEventListener('click', () => this.startGame());
    document.getElementById('restart-button')?.addEventListener('click', () => this.restartGame());

    document.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      this.keys[e.code] = true;
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
      this.keys[e.code] = false;
    });
  }

  initAudio() {
    // Initialize Web Audio API for spatial audio
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  startGame() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';

    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();

    window.addEventListener('resize', () => this.resizeCanvas());

    this.generateMaze();
    this.gameRunning = true;
    this.gameLoop();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  generateMaze() {
    // Initialize maze with walls
    this.maze = Array(this.mazeSize).fill(null).map(() => Array(this.mazeSize).fill(1));

    // Recursive backtracking maze generation
    const stack = [];
    const startX = 1;
    const startY = 1;

    this.maze[startY][startX] = 0;
    stack.push([startX, startY]);

    const directions = [[0, -2], [2, 0], [0, 2], [-2, 0]];

    while (stack.length > 0) {
      const [x, y] = stack[stack.length - 1];
      const neighbors = [];

      for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;

        if (nx > 0 && nx < this.mazeSize - 1 && ny > 0 && ny < this.mazeSize - 1 && this.maze[ny][nx] === 1) {
          neighbors.push([nx, ny, x + dx / 2, y + dy / 2]);
        }
      }

      if (neighbors.length > 0) {
        const [nx, ny, wx, wy] = neighbors[Math.floor(Math.random() * neighbors.length)];
        this.maze[ny][nx] = 0;
        this.maze[wy][wx] = 0;
        stack.push([nx, ny]);
      } else {
        stack.pop();
      }
    }

    // Place player at start
    this.player.x = 1.5;
    this.player.y = 1.5;
    this.player.angle = 0;
    this.player.sanity = 100;

    // Place exit far from start
    this.exitPos = { x: this.mazeSize - 2.5, y: this.mazeSize - 2.5 };
    this.maze[this.mazeSize - 2][this.mazeSize - 2] = 2; // 2 = exit

    // Place mirrors randomly
    this.mirrors = [];
    for (let i = 0; i < 15; i++) {
      let mx, my;
      do {
        mx = Math.floor(Math.random() * (this.mazeSize - 2)) + 1;
        my = Math.floor(Math.random() * (this.mazeSize - 2)) + 1;
      } while (this.maze[my][mx] !== 0 || (Math.abs(mx - 1) < 2 && Math.abs(my - 1) < 2));

      this.mirrors.push({
        x: mx + 0.5,
        y: my + 0.5,
        glitchLevel: 0,
        lastSeen: 0
      });
    }
  }

  gameLoop() {
    if (!this.gameRunning) return;

    this.update();
    this.render();

    requestAnimationFrame(() => this.gameLoop());
  }

  update() {
    const moveSpeed = 0.05;
    const rotSpeed = 0.05;

    // Rotation
    if (this.keys['a'] || this.keys['ArrowLeft']) {
      this.player.angle -= rotSpeed;
    }
    if (this.keys['d'] || this.keys['ArrowRight']) {
      this.player.angle += rotSpeed;
    }

    // Movement
    let newX = this.player.x;
    let newY = this.player.y;

    if (this.keys['w'] || this.keys['ArrowUp']) {
      newX += Math.cos(this.player.angle) * moveSpeed;
      newY += Math.sin(this.player.angle) * moveSpeed;
    }
    if (this.keys['s'] || this.keys['ArrowDown']) {
      newX -= Math.cos(this.player.angle) * moveSpeed;
      newY -= Math.sin(this.player.angle) * moveSpeed;
    }

    // Collision detection
    const gridX = Math.floor(newX);
    const gridY = Math.floor(newY);

    if (gridX >= 0 && gridX < this.mazeSize && gridY >= 0 && gridY < this.mazeSize) {
      if (this.maze[gridY][gridX] !== 1) {
        this.player.x = newX;
        this.player.y = newY;
      }
    }

    // Check for exit
    const distToExit = Math.sqrt(
      Math.pow(this.player.x - this.exitPos.x, 2) +
      Math.pow(this.player.y - this.exitPos.y, 2)
    );

    if (distToExit < 0.5) {
      this.endGame(true);
      return;
    }

    // Update mirror effects
    let lookingAtMirror = false;
    const now = Date.now();

    for (const mirror of this.mirrors) {
      const dx = mirror.x - this.player.x;
      const dy = mirror.y - this.player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 3) {
        const angleToMirror = Math.atan2(dy, dx);
        let angleDiff = angleToMirror - this.player.angle;

        // Normalize angle
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        if (Math.abs(angleDiff) < this.fov / 2) {
          lookingAtMirror = true;
          mirror.lastSeen = now;

          // Sanity drain when looking at mirrors
          this.player.sanity -= 0.1;

          // Increase glitch level over time
          if (now - this.lastMirrorTime > 100) {
            mirror.glitchLevel = Math.min(mirror.glitchLevel + 0.02, 1);
            this.mirrorGlitchLevel = Math.min(this.mirrorGlitchLevel + 0.01, 1);
          }
        }
      }

      // Decay glitch if not looking
      if (now - mirror.lastSeen > 1000) {
        mirror.glitchLevel = Math.max(mirror.glitchLevel - 0.01, 0);
      }
    }

    if (lookingAtMirror) {
      this.lastMirrorTime = now;
      document.getElementById('mirror-warning').style.display = 'block';
    } else {
      document.getElementById('mirror-warning').style.display = 'none';
      this.mirrorGlitchLevel = Math.max(this.mirrorGlitchLevel - 0.005, 0);
      // Slowly recover sanity when not looking at mirrors
      this.player.sanity = Math.min(this.player.sanity + 0.02, 100);
    }

    // Update sanity bar
    const sanityFill = document.getElementById('sanity-fill');
    sanityFill.style.width = this.player.sanity + '%';

    if (this.player.sanity < 30) {
      sanityFill.classList.add('low');
    } else {
      sanityFill.classList.remove('low');
    }

    // Game over if sanity reaches 0
    if (this.player.sanity <= 0) {
      this.endGame(false);
    }
  }

  render() {
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Clear canvas
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, w, h);

    // Raycasting
    const numRays = w;
    const rayAngleStep = this.fov / numRays;

    for (let i = 0; i < numRays; i++) {
      const rayAngle = this.player.angle - this.fov / 2 + rayAngleStep * i;

      const hit = this.castRay(rayAngle);

      if (hit) {
        const distance = hit.distance * Math.cos(rayAngle - this.player.angle); // Fish-eye correction
        const wallHeight = (h / 2) / distance * 0.5;

        let brightness = Math.max(0, 1 - distance / this.renderDistance);

        // Draw ceiling
        this.ctx.fillStyle = `rgb(${10 * brightness}, ${10 * brightness}, ${10 * brightness})`;
        this.ctx.fillRect(i, 0, 1, h / 2 - wallHeight);

        // Draw wall
        if (hit.cellType === 2) {
          // Exit - green glow
          this.ctx.fillStyle = `rgb(0, ${Math.floor(100 * brightness)}, 0)`;
        } else if (hit.mirror) {
          // Mirror - with glitch effect
          const glitch = hit.mirror.glitchLevel;
          const r = Math.floor((100 + 155 * glitch) * brightness);
          const g = Math.floor((100 - 50 * glitch) * brightness);
          const b = Math.floor((150 - 100 * glitch) * brightness);

          this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

          // Add random glitch bars
          if (glitch > 0.5 && Math.random() < glitch * 0.1) {
            this.ctx.fillStyle = `rgb(${Math.floor(Math.random() * 255)}, 0, 0)`;
          }
        } else {
          const shade = Math.floor(80 * brightness);
          this.ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
        }

        this.ctx.fillRect(i, h / 2 - wallHeight, 1, wallHeight * 2);

        // Draw floor
        this.ctx.fillStyle = `rgb(${5 * brightness}, ${5 * brightness}, ${5 * brightness})`;
        this.ctx.fillRect(i, h / 2 + wallHeight, 1, h / 2 - wallHeight);
      }
    }

    // Add visual effects based on sanity
    if (this.player.sanity < 50) {
      // Add red vignette
      const gradient = this.ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, `rgba(139, 0, 0, ${(50 - this.player.sanity) / 100})`);
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, w, h);
    }

    // Screen distortion when looking at mirrors
    if (this.mirrorGlitchLevel > 0.3) {
      // Random pixel displacement
      if (Math.random() < this.mirrorGlitchLevel * 0.05) {
        const imageData = this.ctx.getImageData(0, 0, w, h);
        const data = imageData.data;

        // Invert some pixels randomly
        for (let i = 0; i < data.length; i += 4 * Math.floor(1 / this.mirrorGlitchLevel)) {
          if (Math.random() < this.mirrorGlitchLevel * 0.1) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
          }
        }

        this.ctx.putImageData(imageData, 0, 0);
      }
    }

    // Draw disturbing message when sanity is very low
    if (this.player.sanity < 20) {
      this.ctx.font = '48px serif';
      this.ctx.fillStyle = `rgba(139, 0, 0, ${(20 - this.player.sanity) / 20})`;
      this.ctx.textAlign = 'center';

      const messages = [
        'それは私ですか？',
        '見ないで',
        '鏡の中の私',
        '助けて',
        '出られない'
      ];

      const message = messages[Math.floor(Date.now() / 1000) % messages.length];
      this.ctx.fillText(message, w / 2 + (Math.random() - 0.5) * 20, h / 2 + (Math.random() - 0.5) * 20);
    }
  }

  castRay(angle) {
    const maxDistance = this.renderDistance;
    const step = 0.1;

    let x = this.player.x;
    let y = this.player.y;
    let distance = 0;

    const dx = Math.cos(angle) * step;
    const dy = Math.sin(angle) * step;

    while (distance < maxDistance) {
      x += dx;
      y += dy;
      distance += step;

      const gridX = Math.floor(x);
      const gridY = Math.floor(y);

      if (gridX < 0 || gridX >= this.mazeSize || gridY < 0 || gridY >= this.mazeSize) {
        return null;
      }

      // Check for mirrors first
      for (const mirror of this.mirrors) {
        const distToMirror = Math.sqrt(
          Math.pow(x - mirror.x, 2) + Math.pow(y - mirror.y, 2)
        );

        if (distToMirror < 0.3) {
          return { distance, cellType: 0, mirror };
        }
      }

      if (this.maze[gridY][gridX] !== 0) {
        return { distance, cellType: this.maze[gridY][gridX] };
      }
    }

    return null;
  }

  endGame(escaped) {
    this.gameRunning = false;

    const gameOverScreen = document.getElementById('game-over-screen');
    const gameOverTitle = document.getElementById('game-over-title');
    const gameOverMessage = document.getElementById('game-over-message');

    if (escaped) {
      gameOverTitle.textContent = '脱出成功...?';
      gameOverTitle.className = 'escaped';
      gameOverMessage.textContent = 'あなたは出口を見つけ、建物を出た。しかし鏡に映った自分の顔を見て、背筋が凍りついた。それは本当にあなたの顔だろうか？';
    } else {
      gameOverTitle.textContent = '正気を失った';
      gameOverTitle.className = 'lost';
      gameOverMessage.textContent = '鏡を見すぎてしまった。もう自分が誰なのか分からない。鏡の中の「それ」が、こちらを見て笑っている...';

      // Screen shake effect
      document.getElementById('game-screen').classList.add('shake');
      setTimeout(() => {
        document.getElementById('game-screen').classList.remove('shake');
      }, 500);
    }

    gameOverScreen.style.display = 'flex';
  }

  restartGame() {
    document.getElementById('game-over-screen').style.display = 'none';
    this.generateMaze();
    this.mirrorGlitchLevel = 0;
    this.gameRunning = true;
    this.gameLoop();
  }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
  new MirrorMaze();
});

// Credit
console.log('---');
console.log('Written by GitHub Copilot (Claude Sonnet 4.5)');
console.log('---');
