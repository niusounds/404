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

    // New horror elements
    this.entity = null; // Chasing entity
    this.lastFootstepTime = 0;
    this.heartbeatGain = null;
    this.whisperGain = null;
    this.jumpScares = [];
    this.lastJumpScareTime = 0;
    this.bloodTrails = [];
    this.crawlingShadows = [];
    this.gameStartTime = 0;

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
      this.initHeartbeat();
      this.initWhisper();
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  initHeartbeat() {
    if (!this.audioContext) return;

    // Create heartbeat sound using oscillators
    this.heartbeatGain = this.audioContext.createGain();
    this.heartbeatGain.connect(this.audioContext.destination);
    this.heartbeatGain.gain.value = 0;
  }

  playHeartbeat() {
    if (!this.audioContext || !this.heartbeatGain) return;

    const now = this.audioContext.currentTime;
    const sanityFactor = 1 - (this.player.sanity / 100);
    const rate = 0.6 - (sanityFactor * 0.3); // Faster when sanity is low

    // Create two short bass thumps for heartbeat
    for (let i = 0; i < 2; i++) {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.connect(gain);
      gain.connect(this.heartbeatGain);

      osc.frequency.value = 60 - (i * 20);
      gain.gain.setValueAtTime(0.3 * sanityFactor, now + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.1);

      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.1);
    }
  }

  initWhisper() {
    if (!this.audioContext) return;

    // Create ambient whisper sound using noise
    this.whisperGain = this.audioContext.createGain();
    this.whisperGain.connect(this.audioContext.destination);
    this.whisperGain.gain.value = 0;
  }

  playWhisper() {
    if (!this.audioContext || !this.whisperGain) return;

    const now = this.audioContext.currentTime;
    const sanityFactor = 1 - (this.player.sanity / 100);

    // Create eerie whisper using filtered noise
    const bufferSize = this.audioContext.sampleRate * 2;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.1;
    }

    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800 + (Math.random() * 400);
    filter.Q.value = 10;

    const gain = this.audioContext.createGain();
    gain.gain.value = 0.05 * sanityFactor;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.whisperGain);

    noise.start(now);
    noise.stop(now + 1);
  }

  playFootstep() {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.frequency.value = 80 + (Math.random() * 20);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.start(now);
    osc.stop(now + 0.05);
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
    this.gameStartTime = Date.now();
    this.gameLoop();

    // Resume audio context (required by browsers)
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
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

    // Place mirrors randomly (increased from 15 to 20 for more horror)
    this.mirrors = [];
    for (let i = 0; i < 20; i++) {
      let mx, my;
      do {
        mx = Math.floor(Math.random() * (this.mazeSize - 2)) + 1;
        my = Math.floor(Math.random() * (this.mazeSize - 2)) + 1;
      } while (this.maze[my][mx] !== 0 || (Math.abs(mx - 1) < 2 && Math.abs(my - 1) < 2));

      this.mirrors.push({
        x: mx + 0.5,
        y: my + 0.5,
        glitchLevel: 0,
        lastSeen: 0,
        showsFace: Math.random() < 0.3 // 30% chance to show creepy face
      });
    }

    // Initialize chasing entity
    this.entity = {
      x: this.mazeSize - 3.5,
      y: this.mazeSize - 3.5,
      active: false,
      activationTime: Date.now() + 15000 // Activates after 15 seconds
    };

    // Initialize blood trails
    this.bloodTrails = [];
    for (let i = 0; i < 5; i++) {
      let bx, by;
      do {
        bx = Math.floor(Math.random() * (this.mazeSize - 2)) + 1;
        by = Math.floor(Math.random() * (this.mazeSize - 2)) + 1;
      } while (this.maze[by][bx] !== 0);

      this.bloodTrails.push({
        x: bx + 0.5,
        y: by + 0.5,
        size: 0.3 + Math.random() * 0.3
      });
    }

    // Initialize crawling shadows
    this.crawlingShadows = [];
    for (let i = 0; i < 3; i++) {
      let sx, sy;
      do {
        sx = Math.floor(Math.random() * (this.mazeSize - 2)) + 1;
        sy = Math.floor(Math.random() * (this.mazeSize - 2)) + 1;
      } while (this.maze[sy][sx] !== 0);

      this.crawlingShadows.push({
        x: sx + 0.5,
        y: sy + 0.5,
        angle: Math.random() * Math.PI * 2,
        speed: 0.01 + Math.random() * 0.01
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
    const now = Date.now();

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
    let isMoving = false;

    if (this.keys['w'] || this.keys['ArrowUp']) {
      newX += Math.cos(this.player.angle) * moveSpeed;
      newY += Math.sin(this.player.angle) * moveSpeed;
      isMoving = true;
    }
    if (this.keys['s'] || this.keys['ArrowDown']) {
      newX -= Math.cos(this.player.angle) * moveSpeed;
      newY -= Math.sin(this.player.angle) * moveSpeed;
      isMoving = true;
    }

    // Play footstep sounds
    if (isMoving && now - this.lastFootstepTime > 400) {
      this.playFootstep();
      this.lastFootstepTime = now;
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

    // Update chasing entity
    if (this.entity && now > this.entity.activationTime) {
      if (!this.entity.active) {
        this.entity.active = true;
        // Trigger jump scare when entity activates
        this.triggerJumpScare();
      }

      // Entity chases player through maze
      const dx = this.player.x - this.entity.x;
      const dy = this.player.y - this.entity.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0.1) {
        const entitySpeed = 0.03; // Slightly slower than player
        const moveX = (dx / dist) * entitySpeed;
        const moveY = (dy / dist) * entitySpeed;

        const newEntityX = this.entity.x + moveX;
        const newEntityY = this.entity.y + moveY;

        const entityGridX = Math.floor(newEntityX);
        const entityGridY = Math.floor(newEntityY);

        if (entityGridX >= 0 && entityGridX < this.mazeSize &&
            entityGridY >= 0 && entityGridY < this.mazeSize &&
            this.maze[entityGridY][entityGridX] !== 1) {
          this.entity.x = newEntityX;
          this.entity.y = newEntityY;
        }
      }

      // Check if entity caught player
      if (dist < 0.5) {
        this.player.sanity = 0; // Instant game over
      }

      // Increase sanity drain when entity is close
      if (dist < 3) {
        this.player.sanity -= 0.05 * (1 - dist / 3);
      }
    }

    // Update crawling shadows
    for (const shadow of this.crawlingShadows) {
      shadow.x += Math.cos(shadow.angle) * shadow.speed;
      shadow.y += Math.sin(shadow.angle) * shadow.speed;

      const shadowGridX = Math.floor(shadow.x);
      const shadowGridY = Math.floor(shadow.y);

      // Change direction if hit wall
      if (shadowGridX < 0 || shadowGridX >= this.mazeSize ||
          shadowGridY < 0 || shadowGridY >= this.mazeSize ||
          this.maze[shadowGridY][shadowGridX] === 1) {
        shadow.angle = Math.random() * Math.PI * 2;
      }
    }

    // Update mirror effects
    let lookingAtMirror = false;

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

          // Sanity drain when looking at mirrors (increased)
          this.player.sanity -= 0.15;

          // Increase glitch level over time
          if (now - this.lastMirrorTime > 100) {
            mirror.glitchLevel = Math.min(mirror.glitchLevel + 0.03, 1);
            this.mirrorGlitchLevel = Math.min(this.mirrorGlitchLevel + 0.015, 1);
          }

          // Random whisper when looking at mirror with face
          if (mirror.showsFace && mirror.glitchLevel > 0.5 && Math.random() < 0.01) {
            this.playWhisper();
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
      this.player.sanity = Math.min(this.player.sanity + 0.01, 100);
    }

    // Play heartbeat based on sanity
    if (this.player.sanity < 50 && Math.random() < (1 - this.player.sanity / 100) * 0.1) {
      this.playHeartbeat();
    }

    // Random jump scares
    if (now - this.lastJumpScareTime > 30000 && this.player.sanity < 60 && Math.random() < 0.001) {
      this.triggerJumpScare();
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

  triggerJumpScare() {
    this.lastJumpScareTime = Date.now();

    // Screen flash
    const canvas = document.getElementById('game-canvas');
    canvas.style.filter = 'brightness(5) saturate(0)';
    setTimeout(() => {
      canvas.style.filter = '';
    }, 100);

    // Screen shake
    document.getElementById('game-screen').classList.add('shake');
    setTimeout(() => {
      document.getElementById('game-screen').classList.remove('shake');
    }, 500);

    // Large sanity drop
    this.player.sanity -= 15;
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

          // Draw creepy face in mirror
          if (hit.mirror.showsFace && glitch > 0.6) {
            const faceAlpha = (glitch - 0.6) * 2.5;
            this.ctx.fillStyle = `rgba(200, 200, 200, ${faceAlpha * brightness})`;
          }
        } else if (hit.entity) {
          // Entity - dark red shadow
          const r = Math.floor(50 * brightness);
          this.ctx.fillStyle = `rgb(${r}, 0, 0)`;
        } else if (hit.shadow) {
          // Crawling shadow - dark and blurry
          const shade = Math.floor(20 * brightness);
          this.ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
        } else if (hit.blood) {
          // Blood trail - dark red
          const r = Math.floor(80 * brightness);
          this.ctx.fillStyle = `rgb(${r}, 0, 0)`;
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
      gradient.addColorStop(1, `rgba(139, 0, 0, ${(50 - this.player.sanity) / 80})`);
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, w, h);
    }

    // Screen distortion when looking at mirrors
    if (this.mirrorGlitchLevel > 0.3) {
      // Random pixel displacement
      if (Math.random() < this.mirrorGlitchLevel * 0.08) {
        const imageData = this.ctx.getImageData(0, 0, w, h);
        const data = imageData.data;

        // Invert some pixels randomly
        for (let i = 0; i < data.length; i += 4 * Math.floor(1 / this.mirrorGlitchLevel)) {
          if (Math.random() < this.mirrorGlitchLevel * 0.15) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
          }
        }

        this.ctx.putImageData(imageData, 0, 0);
      }

      // Add scanline effect
      if (this.mirrorGlitchLevel > 0.5) {
        this.ctx.fillStyle = `rgba(0, 0, 0, ${this.mirrorGlitchLevel * 0.1})`;
        for (let y = 0; y < h; y += 4) {
          this.ctx.fillRect(0, y, w, 2);
        }
      }
    }

    // Draw disturbing messages when sanity is very low
    if (this.player.sanity < 30) {
      this.ctx.font = '48px serif';
      this.ctx.fillStyle = `rgba(139, 0, 0, ${(30 - this.player.sanity) / 30})`;
      this.ctx.textAlign = 'center';

      const messages = [
        'それは私ですか？',
        '見ないで',
        '鏡の中の私',
        '助けて',
        '出られない',
        '後ろにいる',
        '追いかけてくる',
        '逃げられない'
      ];

      const message = messages[Math.floor(Date.now() / 1000) % messages.length];
      this.ctx.fillText(message, w / 2 + (Math.random() - 0.5) * 30, h / 2 + (Math.random() - 0.5) * 30);
    }

    // Draw entity warning when close
    if (this.entity && this.entity.active) {
      const dx = this.entity.x - this.player.x;
      const dy = this.entity.y - this.player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 5) {
        const alpha = Math.max(0, 1 - dist / 5);
        this.ctx.font = '32px serif';
        this.ctx.fillStyle = `rgba(255, 0, 0, ${alpha * 0.7})`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('何かが近づいている...', w / 2, h - 100);
      }
    }

    // Draw blood overlay at very low sanity
    if (this.player.sanity < 15) {
      const alpha = (15 - this.player.sanity) / 15 * 0.3;
      this.ctx.fillStyle = `rgba(139, 0, 0, ${alpha})`;

      // Random blood drips from top
      for (let i = 0; i < 10; i++) {
        const x = Math.random() * w;
        const height = Math.random() * h * 0.3;
        this.ctx.fillRect(x, 0, 2, height);
      }
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

      // Check for entity
      if (this.entity && this.entity.active) {
        const distToEntity = Math.sqrt(
          Math.pow(x - this.entity.x, 2) + Math.pow(y - this.entity.y, 2)
        );

        if (distToEntity < 0.4) {
          return { distance, cellType: 0, entity: true };
        }
      }

      // Check for crawling shadows
      for (const shadow of this.crawlingShadows) {
        const distToShadow = Math.sqrt(
          Math.pow(x - shadow.x, 2) + Math.pow(y - shadow.y, 2)
        );

        if (distToShadow < 0.3) {
          return { distance, cellType: 0, shadow: true };
        }
      }

      // Check for blood trails
      for (const blood of this.bloodTrails) {
        const distToBlood = Math.sqrt(
          Math.pow(x - blood.x, 2) + Math.pow(y - blood.y, 2)
        );

        if (distToBlood < blood.size) {
          return { distance, cellType: 0, blood: true };
        }
      }

      // Check for mirrors
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
      gameOverMessage.textContent = 'あなたは出口を見つけ、建物を出た。しかし鏡に映った自分の顔を見て、背筋が凍りついた。それは本当にあなたの顔だろうか？あの迷宮で、何かがあなたの中に入り込んだような気がする...';
    } else {
      gameOverTitle.textContent = '正気を失った';
      gameOverTitle.className = 'lost';

      const messages = [
        '鏡を見すぎてしまった。もう自分が誰なのか分からない。鏡の中の「それ」が、こちらを見て笑っている...',
        '暗闇の中で何かに捕まった。最後に見たのは、無数の鏡に映る自分の顔。全ての顔が、違う表情をしていた...',
        '這いずる影が近づいてくる。逃げようとしたが、もう遅かった。鏡が割れる音と共に、全てが暗転した...'
      ];

      gameOverMessage.textContent = messages[Math.floor(Math.random() * messages.length)];

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
    this.lastJumpScareTime = 0;
    this.gameRunning = true;
    this.gameStartTime = Date.now();
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
console.log('Enhanced with additional horror elements');
console.log('---');
