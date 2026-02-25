const STORY = {
  'diary': [
    {
      title: '日記_1.txt',
      content: '2026年2月22日\n中古のパソコンを手に入れた。Windows 98を彷彿とさせる懐かしいデザインだが、妙に動作が軽い。\n前の持ち主のデータが少し残っているようだが、整理して使おうと思う。'
    },
    {
      title: '日記_2.txt',
      content: '2026年2月23日\n夜中に勝手に電源が入ることがある。ファンが異常な音を立てて回っている。\n「システム管理」というフォルダに、覚えのないログファイルが増えている。'
    },
    {
      title: '日記_3.txt',
      content: '2026年2月24日\n画面にノイズが走る。一瞬、誰かの顔が映ったような気がした。気のせいだと思いたいが、このパソコン、どこかおかしい。\n捨てるべきかもしれないが、手が離せない。'
    }
  ],
  'system': [
    {
      title: 'error.log',
      content: 'KERNEL_ERROR: MEMORY_CORRUPTION_DETECTED\nLOCATION: SECTOR_404\nSTATUS: ACTIVE\nREASON: THEY_ARE_WATCHING'
    },
    {
      title: '0000.txt',
      content: 'たすけてたすけてたすけてたすけてたすけてたすけてたすけてたすけてたすけてたすけてたすけてたすけてたすけてたすけてたすけてたすけてたすけてたすけてたすけてたすけてたすけてたすけてたすけてたすけてたすけてたすけてたすけてたすけてたすけてたすけてたすけてたすけて'
    },
    {
      title: '???',
      content: 'お前も、ここに来るのか？\n後ろを見てはいけない。\nクリックしてはいけない。\n閉じてはいけない。'
    }
  ]
};

let corruptionLevel = 0;
let openWindows = 0;
let tabHidingCount = 0;

document.addEventListener('DOMContentLoaded', () => {
  updateClock();
  setInterval(updateClock, 1000);

  setupIcons();
  setupNoise();
  setupTabTampering();
  setupStartMenu();
  setupEye();
  setupInteractionShake();
  setupIdleDetection();
});

let lastInteraction = Date.now();
function setupIdleDetection() {
  const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
  events.forEach(e => document.addEventListener(e, () => lastInteraction = Date.now()));

  setInterval(() => {
    if (Date.now() - lastInteraction > 30000 && Math.random() > 0.7) {
      playWhisper("なぜ、そこにいるの？");
      lastInteraction = Date.now(); // Don't spam
    }
  }, 10000);
}

let audioCtx = null;
function playGlitchNoise() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = 'sawtooth';
  oscillator.frequency.setValueAtTime(Math.random() * 100 + 50, audioCtx.currentTime);

  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.2);
}

function setupInteractionShake() {
  document.addEventListener('mousedown', () => {
    if (corruptionLevel > 5) {
      document.body.classList.add('body-shake');
      setTimeout(() => document.body.classList.remove('body-shake'), 100);
      if (Math.random() > 0.8) playGlitchNoise();
    }
  });
}

function setupEye() {
  const eye = document.getElementById('taskbar-eye');
  const pupil = document.getElementById('eye-pupil');
  if (!eye || !pupil) return;

  document.addEventListener('mousemove', (e) => {
    if (eye.style.display === 'none') return;
    const rect = eye.getBoundingClientRect();
    const eyeX = rect.left + rect.width / 2;
    const eyeY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - eyeY, e.clientX - eyeX);
    const distance = Math.min(rect.width / 4, Math.hypot(e.clientX - eyeX, e.clientY - eyeY) / 10);

    pupil.style.left = (rect.width / 2 - 4 + Math.cos(angle) * distance) + 'px';
    pupil.style.top = (rect.height / 2 - 4 + Math.sin(angle) * distance) + 'px';
  });
}

function toggleStartMenu() {
  const menu = document.getElementById('start-menu');
  menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
}

function setupStartMenu() {
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('start-menu');
    const startBtn = document.getElementById('start-btn');
    if (menu && !menu.contains(e.target) && startBtn && !startBtn.contains(e.target)) {
      menu.style.display = 'none';
    }
  });

  const runBtn = document.getElementById('menu-run');
  runBtn.addEventListener('click', () => {
    toggleStartMenu();
    openRunDialog();
  });

  const shutdownBtn = document.getElementById('menu-shutdown');
  shutdownBtn.addEventListener('click', () => {
    toggleStartMenu();
    if (corruptionLevel < 5) {
      alert("システムの終了を妨害されました。");
    } else {
      playWhisper("どこへいくの？");
      document.body.classList.add('melt-down');
      setTimeout(() => {
        document.body.innerHTML = '<div style="background:#000; color:red; width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:40px; font-family:serif;">もう、おそい</div>';
      }, 5000);
    }
  });

  // Setup Documents sub-menu content (optional JS injection if not in HTML)
  const docBtn = document.getElementById('menu-documents');
  if (docBtn) {
    const subMenu = document.createElement('div');
    subMenu.className = 'sub-menu';
    subMenu.innerHTML = `
      <div class="start-menu-item" onclick="openFile('diary', 0)">日記_1.txt</div>
      <div class="start-menu-item" onclick="openFile('diary', 1)">日記_2.txt</div>
      <div class="start-menu-item" onclick="createWindow('history.log', '<ul style=\'font-size:11px; color:#333;\'><li>how to stop noise.html</li><li>can they see me.exe</li><li>suicide methods (DELETED)</li><li>your room live stream</li></ul>')">History.log</div>
      <div class="start-menu-item" onclick="handleProgramsClick()">Programs</div>
      <div class="start-menu-item" onclick="createWindow('room.mp4', '<div style=\'background:#000; height:150px; display:flex; align-items:center; justify-content:center; color:#555;\'>[画像データが破損しています]</div>')">room.mp4</div>
      <div class="start-menu-item" onclick="createWindow('遺影.jpg', '<div style=\'background:#000; height:150px; display:flex; align-items:center; justify-content:center; color:red;\'>見ちゃだめ</div>')">遺影.jpg</div>
    `;
    docBtn.appendChild(subMenu);
  }
}

function openRunDialog() {
  const content = `
    <div style="padding:10px;">
      <p style="font-size:12px; margin-bottom:5px;">プログラム名を入力してください：</p>
      <input type="text" id="run-input" style="width:100%; margin-bottom:10px; border:1px solid #808080;" autofocus>
      <div style="display:flex; justify-content:flex-end; gap:5px;">
        <button class="win-btn" style="width:60px;" onclick="handleRunSubmit()">OK</button>
        <button class="win-btn" style="width:60px;" onclick="this.closest('.window').remove()">Cancel</button>
      </div>
    </div>
  `;
  const win = createWindow('Run', content, { width: '250px' });
  const input = win.querySelector('#run-input');
  input.onkeydown = (e) => { if (e.key === 'Enter') handleRunSubmit(); };
  window.lastRunWin = win;
}

window.handleRunSubmit = () => {
  const input = document.getElementById('run-input');
  const cmd = input.value.trim().toLowerCase();
  window.lastRunWin.remove();

  let response = "";
  if (cmd === "who are you" || cmd === "だれ？") {
    response = "あなたのすぐ後ろにいる者です。";
    playWhisper(response);
  } else if (cmd === "help" || cmd === "たすけて") {
    response = "助けは来ません。手遅れです。";
    playWhisper(response);
  } else {
    response = `コマンド "${cmd}" を実行中に致命的なエラーが発生しました。`;
  }

  const termContent = `
    <div style="background:#000; color:#0f0; font-family:monospace; padding:10px; height:120px; overflow-y:auto;">
      > ${cmd.toUpperCase()}<br>
      > PROCESSING...<br>
      > <span style="color:red;">${response}</span><br>
      > SYSTEM_HALTED.
    </div>
  `;
  createWindow('Terminal', termContent, { width: '250px' });
  checkCorruption();
};

window.handleProgramsClick = () => {
  // Rare Hijack: 5% chance to spam windows
  if (Math.random() < 0.05) {
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        createWindow('ERROR', '<div style="color:red; font-weight:bold;">YOU SHOULD NOT BE HERE</div>', {
          left: (Math.random() * 70) + '%',
          top: (Math.random() * 70) + '%'
        });
      }, i * 50);
    }
  } else {
    openIcon('diary-folder');
  }
};

function openSettings() {
  toggleStartMenu();
  const content = `
    <div style="display:flex; flex-wrap:wrap; gap:10px; padding:10px;">
      <div class="cpanel-icon" onclick="openUserAccounts()">
        <div class="cpanel-img" style="background: radial-gradient(circle, #833, #000);"></div>
        <div style="font-size:10px; text-align:center;">Users</div>
      </div>
      <div class="cpanel-icon" onclick="createWindow('Display', '<p>モニター同期エラー。感度が強すぎます。</p>')">
        <div class="cpanel-img"></div>
        <div style="font-size:10px; text-align:center;">Display</div>
      </div>
    </div>
  `;
  createWindow('Control Panel', content, { width: '200px' });
}

window.openUserAccounts = () => {
  const content = `
    <div style="padding:10px;">
      <p style="font-size:12px; font-weight:bold;">現在ログイン中のユーザー：</p>
      <ul style="font-size:12px; margin-top:5px; list-style:none;">
        <li>👤 Administrator (Online)</li>
        <li style="color:red; animation: spooky-fade 2s infinite;">👤 The Observer (Watching...)</li>
      </ul>
      <p style="font-size:10px; color:#888; margin-top:10px;">警告: 未承認のアクセスを検知しました。</p>
    </div>
  `;
  createWindow('User Accounts', content, { width: '220px' });
  checkCorruption();
};

function openHelp() {
  toggleStartMenu();
  const win = createWindow('Windows Help', '<div class="notepad-area" id="help-text"></div>', { width: '250px' });
  const area = win.querySelector('#help-text');

  const msg = "だ れ も あ な た を た す け ら れ な い . . . ";
  let i = 0;
  function typeHelp() {
    if (i < msg.length && document.body.contains(win)) {
      area.innerHTML += msg.charAt(i++);
      setTimeout(typeHelp, 150);
    } else {
      setTimeout(() => {
        if (document.body.contains(win)) {
          win.classList.add('melt');
          setTimeout(() => win.remove(), 5000);
        }
      }, 2000);
    }
  }
  typeHelp();
}

function updateClock() {
  const now = new Date();
  const timeStr = now.getHours().toString().padStart(2, '0') + ':' +
    now.getMinutes().toString().padStart(2, '0');
  const clockEl = document.getElementById('clock');
  if (corruptionLevel > 12) {
    const count = 100 - (Math.floor(Date.now() / 1000) % 100);
    clockEl.innerText = "00:" + count.toString().padStart(2, '0');
    if (count === 0) triggerJumpScare();
  } else if (corruptionLevel > 8 && Math.random() > 0.8) {
    clockEl.innerText = '死:死';
  } else {
    clockEl.innerText = timeStr;
  }
}

function setupIcons() {
  const icons = document.querySelectorAll('.icon');
  icons.forEach(icon => {
    icon.addEventListener('dblclick', () => {
      openIcon(icon.dataset.id);
    });
    icon.addEventListener('click', (e) => {
      if (window.innerWidth < 768) openIcon(icon.dataset.id);
    });
  });
    // 恐怖ファイルアイコン追加
    addScaryFileIcons();
}

  function addScaryFileIcons() {
    // room.mp4 アイコン
    if (!document.getElementById('icon-roommp4')) {
      const icon = document.createElement('div');
      icon.className = 'icon icon-file';
      icon.id = 'icon-roommp4';
      icon.dataset.id = 'roommp4';
      icon.style.position = 'absolute';
      icon.style.left = '120px';
      icon.style.top = '80px';
      icon.innerHTML = `<div class="icon-img"></div><div class="icon-label">room.mp4</div>`;
      icon.addEventListener('dblclick', () => openIcon('roommp4'));
      document.body.appendChild(icon);
    }
    // 遺影.jpg アイコン
    if (!document.getElementById('icon-iiei')) {
      const icon = document.createElement('div');
      icon.className = 'icon icon-file';
      icon.id = 'icon-iiei';
      icon.dataset.id = 'iiei';
      icon.style.position = 'absolute';
      icon.style.left = '220px';
      icon.style.top = '80px';
      icon.innerHTML = `<div class="icon-img"></div><div class="icon-label">遺影.jpg</div>`;
      icon.addEventListener('dblclick', () => openIcon('iiei'));
      document.body.appendChild(icon);
    }
  }
function openIcon(id) {
  if (id === 'diary-folder') {
    createWindow('日記', renderFolder('diary'));
  } else if (id === 'system-folder') {
    createWindow('システム管理', renderFolder('system'));
    if (corruptionLevel > 2) spawnObserver();
  } else if (id === 'readme') {
    createWindow('README.txt', 'このパソコンの持ち主へ：\n\n決して「システム管理」フォルダの中身は見ないでください。\nもし見てしまったら、すぐに電源を切ってください。\n\nそれすら、もう遅いかもしれませんが。');
    checkCorruption();
  } else if (id === 'unknown') {
    startEntityChat();
  } else if (id === 'memo') {
    openNotepad();
  } else if (id === 'roommp4') {
    // room.mp4恐怖演出
    createWindow('room.mp4', `<div style='background:#000; height:150px; display:flex; align-items:center; justify-content:center; color:#555;'>[動画データが破損しています]</div><div style='color:red; text-align:center; margin-top:10px;'>再生できません。<br>あなたの部屋を監視しています。</div>`);
    playGlitchNoise();
    setTimeout(triggerJumpScare, 1200);
    checkCorruption();
  } else if (id === 'iiei') {
    // 遺影.jpg恐怖演出
    createWindow('遺影.jpg', `<div style='background:#000; height:150px; display:flex; align-items:center; justify-content:center; color:red;'>見ちゃだめ</div><div style='color:#fff; text-align:center; margin-top:10px;'>この画像は表示できません。<br>あなたの後ろに...</div>`);
    playWhisper('見ちゃだめ');
    setTimeout(triggerJumpScare, 800);
    checkCorruption();
  }
}

function renderFolder(key) {
  const files = STORY[key];
  let html = '<div style="display: flex; gap: 10px; flex-wrap: wrap; padding: 10px;">';
  files.forEach((file, index) => {
    html += `
      <div class="icon icon-file" onclick="openFile('${key}', ${index})" style="width: 60px;">
        <div class="icon-img"></div>
        <div class="icon-label" style="color: black; text-shadow: none;">${file.title}</div>
      </div>
    `;
  });
  html += '</div>';
  return html;
}

window.openFile = (key, index) => {
  const file = STORY[key][index];
  createWindow(file.title, file.content);
  checkCorruption();
};

function createWindow(title, content, options = {}) {
  const win = document.createElement('div');
  win.className = 'window';
  if (corruptionLevel > 2) win.classList.add('shake');
  if (options.className) win.classList.add(options.className);

  win.style.left = options.left || (50 + (openWindows * 30)) + 'px';
  win.style.top = options.top || (50 + (openWindows * 30)) + 'px';
  if (options.width) win.style.width = options.width;

  win.innerHTML = `
    <div class="window-title-bar">
      <div class="window-title">${title}</div>
      <div class="window-controls">
        <div class="win-btn" onclick="this.closest('.window').remove()">X</div>
      </div>
    </div>
    <div class="window-content">${content}</div>
  `;

  document.body.appendChild(win);
  openWindows++;

  let isDragging = false;
  win.querySelector('.window-title-bar').onmousedown = (e) => {
    isDragging = true;
    win.style.zIndex = ++openWindows + 100;
    let offset = [win.offsetLeft - e.clientX, win.offsetTop - e.clientY];

    document.onmousemove = (ev) => {
      if (isDragging) {
        win.style.left = (ev.clientX + offset[0]) + 'px';
        win.style.top = (ev.clientY + offset[1]) + 'px';

        // Window Drag Trails
        if (corruptionLevel > 4 && Math.random() > 0.7) {
          const trail = document.createElement('div');
          trail.className = 'drag-trail';
          trail.style.left = win.style.left;
          trail.style.top = win.style.top;
          trail.style.width = win.style.width || '200px';
          document.body.appendChild(trail);
          setTimeout(() => trail.remove(), 500);
        }
      }
    };
    document.onmouseup = () => isDragging = false;
  };
  return win;
}

function openNotepad() {
  const content = `<textarea class="notepad-area" id="notepad-text" placeholder="メモを入力..."></textarea>`;
  const win = createWindow('メモ帳', content, { width: '300px' });
  const area = win.querySelector('#notepad-text');

  area.addEventListener('keydown', (e) => {
    if (corruptionLevel > 5) {
      e.preventDefault();
      const scaryMessages = [
        "やめて", "たすけて", "うしろにだれかいる", "しんでる",
        "HE IS WATCHING", "IT HURTS", "OPEN THE DOOR", "LOOK BEHIND YOU"
      ];
      const msg = scaryMessages[Math.floor(corruptionLevel % scaryMessages.length)];
      area.value += msg.charAt(area.value.length % msg.length);

      if (Math.random() > 0.9) playWhisper(msg);
    }
  });
}

function checkCorruption() {
  corruptionLevel++;

  // Rare: Fleeting Apparition (0.5%)
  if (Math.random() < 0.005) triggerFleetingFace();

  // Rare: Gravity Glitch (0.2%)
  if (Math.random() < 0.002) triggerGravityGlitch();

  const overlay = document.getElementById('crt-overlay');
  const noise = document.getElementById('noise-canvas');
  const bgFace = document.getElementById('bg-face');

  // Icon Label Corruption
  if (corruptionLevel > 4) {
    const labels = document.querySelectorAll('.icon-label');
    labels.forEach(label => {
      if (Math.random() > 0.7) {
        const texts = ["しね", "たすけて", "404", "???", "VOID", "ERROR", "遺体"];
        label.innerText = texts[Math.floor(Math.random() * texts.length)];
      }
    });
  }

  if (corruptionLevel === 3) {
    overlay.style.opacity = '0.5';
    document.body.style.backgroundColor = '#004040';
    if (bgFace) bgFace.style.opacity = '0.05';
    playWhisper("みてるよ");
  } else if (corruptionLevel === 6) {
    overlay.style.opacity = '0.7';
    noise.style.opacity = '0.1';
    document.body.style.filter = 'contrast(1.5) brightness(0.8)';
    document.body.classList.add('warp-active');
    document.body.classList.add('corruption-high');
    const eye = document.getElementById('taskbar-eye');
    if (eye) eye.style.display = 'block';

    if (bgFace) {
      bgFace.style.opacity = '0.15';
      bgFace.style.filter = 'blur(10px) grayscale(50%)';
    }
    startEntityChat();
    triggerFakePermission();
    startPhantomSelection();
    startStartButtonPossession();
  } else if (corruptionLevel === 10) {
    showBSOD();
  } else if (corruptionLevel > 10) {
    document.body.classList.add('glitch-text');
    noise.style.opacity = '0.3';

    // Blood seepage on all windows
    document.querySelectorAll('.window').forEach(w => w.classList.add('blood-border'));

    if (Math.random() > 0.8) {
      document.body.classList.add('screen-flip');
      setTimeout(() => document.body.classList.remove('screen-flip'), 300);
    }

    if (bgFace) {
      bgFace.style.opacity = '0.3';
      bgFace.style.filter = 'blur(2px) grayscale(0%) invert(100%)';
    }
    setupMouseHijack();
    if (Math.random() > 0.6) triggerJumpScare();
    if (Math.random() > 0.8) triggerSpam();
  }
}

function startPhantomSelection() {
  setInterval(() => {
    if (corruptionLevel < 6) return;
    const icons = document.querySelectorAll('.icon');
    icons.forEach(i => i.classList.remove('icon-selected'));
    if (Math.random() > 0.5) {
      const target = icons[Math.floor(Math.random() * icons.length)];
      target.classList.add('icon-selected');
    }
  }, 2000);
}

function startStartButtonPossession() {
  const btn = document.getElementById('start-btn');
  const original = btn.innerHTML;
  const texts = ["STAY", "SCARE", "HELP", "SAVE ME", "死"];
  setInterval(() => {
    if (corruptionLevel < 6 || Math.random() > 0.3) return;
    const label = btn.childNodes[2]; // Target the text node
    if (label) label.textContent = texts[Math.floor(Math.random() * texts.length)];
    setTimeout(() => { if (label) label.textContent = "START"; }, 500);
  }, 3000);
}

function triggerFakePermission() {
  const win = createWindow('システム警告', `
    <div style="text-align:center;">
      <p>アプリケーション "SYSTEM_OBSERVER" が<br>あなたのカメラとマイクへのアクセスを求めています。</p>
      <div style="margin-top:20px; display:flex; gap:10px; justify-content:center;">
        <button class="win-btn" style="width:100px; height:25px;" onclick="closeAndMultiply(this)">許可する</button>
        <button class="win-btn" style="width:100px; height:25px;" onclick="closeAndMultiply(this)">許可しない</button>
      </div>
    </div>
  `, { width: '300px', top: '20%', left: '30%' });
}

window.closeAndMultiply = (btn) => {
  const win = btn.closest('.window');
  win.remove();
  playWhisper("だめだよ");
  for (let i = 0; i < 2; i++) {
    createWindow('警告', 'アクセスが拒否されました。強制再起動中...', {
      left: (Math.random() * 80) + '%',
      top: (Math.random() * 80) + '%'
    });
  }
};

function setupMouseHijack() {
  if (window.mouseHijackActive) return;
  window.mouseHijackActive = true;
  document.body.classList.add('cursed-cursor');

  document.addEventListener('mousemove', (e) => {
    if (corruptionLevel < 11) return;
    // Random drift
    if (Math.random() > 0.95) {
      const win = document.querySelector('.window');
      if (win) {
        win.style.left = (parseInt(win.style.left) + (Math.random() * 10 - 5)) + 'px';
      }
    }
  });
}

function showBSOD() {
  const bsod = document.getElementById('bsod');
  if (!bsod) return;
  bsod.style.display = 'block';

  const text = document.querySelector('.bsod-text');
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 5);
    if (progress > 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(() => {
        bsod.style.display = 'none';
        corruptionLevel++;
        checkCorruption(); // Continue after BSOD
      }, 3000);
    }
    text.innerHTML = `
      A problem has been detected and Windows has been shut down to prevent damage 
      to your mind.<br><br>
      ERROR_CODE: 0x00000404 (ENTITY_NOT_FOUND)<br>
      LOCATION: BEHIND_YOU<br><br>
      Collecting data for error reporting...<br>
      Total progress: ${progress}% complete.<br><br>
      If this is the first time you've seen this Stop error screen,<br>
      it is already too late.
    `;
  }, 300);

  playWhisper("もうおわりだよ");
}

function spawnObserver() {
  const content = `
    <div class="webcam-container">
      <div class="webcam-noise"></div>
      <div class="silhouette" id="observer-silhouette"></div>
      <div style="position:absolute; top:5px; left:5px; color:red; font-size:10px; font-family:monospace;">● REC LIVE</div>
    </div>
    <div style="padding:5px; font-size:11px; color:#666;">Unknown Hardware: VirtualCam_01</div>
  `;
  const win = createWindow('Live Monitor', content, { width: '240px' });

  setTimeout(() => {
    const s = win.querySelector('#observer-silhouette');
    if (s) s.style.bottom = '0px';
  }, 3000);
}

function startEntityChat() {
  const win = createWindow('Network Chat', '<div id="chat-box" style="height:150px; overflow-y:auto; border:1px inset #888; padding:5px;"></div>', { width: '200px' });
  const box = win.querySelector('#chat-box');

  const messages = [
    { type: 'system', text: 'User "???" joined the room.' },
    { type: 'them', text: 'こんばんは' },
    { type: 'them', text: 'まだ起きてるんだね' },
    { type: 'them', text: 'その部屋、寒くない？' },
    { type: 'them', text: '後ろのクローゼット、開いてるよ' }
  ];

  let i = 0;
  function nextMsg() {
    if (i >= messages.length || !document.body.contains(win)) return;
    const m = messages[i++];
    const div = document.createElement('div');
    div.className = `chat-msg msg-${m.type}`;
    div.innerText = m.text;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;

    if (m.type === 'them') playWhisper(m.text);
    setTimeout(nextMsg, 3000 + Math.random() * 4000);
  }
  setTimeout(nextMsg, 1000);
}

function triggerSpam() {
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      createWindow('警告', '不審なアクセスを検知しました。', {
        left: Math.random() * (window.innerWidth - 200) + 'px',
        top: Math.random() * (window.innerHeight - 100) + 'px'
      });
    }, i * 200);
  }
}

function triggerJumpScare() {
  const js = document.createElement('div');
  js.style.position = 'fixed';
  js.style.top = '0';
  js.style.left = '0';
  js.style.width = '100%';
  js.style.height = '100%';
  js.style.backgroundColor = 'black';
  js.style.zIndex = '20000';
  js.style.display = 'flex';
  js.style.flexDirection = 'column';
  js.style.alignItems = 'center';
  js.style.justifyContent = 'center';
  js.style.color = 'red';

  const text = ['たすけて', 'そこにいるの', 'みつけた', 'あけて'][Math.floor(Math.random() * 4)];
  js.innerHTML = `<div style="font-size:100px;">${text}</div>`;

  document.body.appendChild(js);
  setTimeout(() => js.remove(), 150);
}

function triggerFleetingFace() {
  const face = document.createElement('div');
  face.className = 'rare-face';
  face.innerHTML = `<div style="font-size:150px; color:#111; filter:blur(2px);">💀</div>`;
  document.body.appendChild(face);
  setTimeout(() => face.remove(), 50);
}

function triggerGravityGlitch() {
  const icons = document.querySelectorAll('.icon');
  icons.forEach(icon => {
    icon.classList.add('gravity-fall');
    icon.style.top = (window.innerHeight - 80) + 'px';
    icon.style.left = (Math.random() * (window.innerWidth - 60)) + 'px';
  });
  playWhisper("おちる");
  setTimeout(() => {
    icons.forEach(icon => {
      icon.classList.remove('gravity-fall');
      icon.style.top = "";
      icon.style.left = "";
    });
  }, 5000);
}

function setupTabTampering() {
  const originalTitle = document.title;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      tabHidingCount++;
      if (tabHidingCount > 2) {
        document.title = "どこにいくの？";
      } else {
        document.title = "逃げられない";
      }
    } else {
      document.title = originalTitle;
      if (tabHidingCount > 3) {
        checkCorruption();
        checkCorruption();
      }
    }
  });
}

function playWhisper(text) {
  if (!('speechSynthesis' in window)) return;
  const utance = new SpeechSynthesisUtterance(text);
  utance.lang = 'ja-JP';
  utance.pitch = 0.1;
  utance.rate = 0.8;
  utance.volume = 0.5;
  window.speechSynthesis.speak(utance);
}

function setupNoise() {
  const canvas = document.getElementById('noise-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  function noise() {
    const idata = ctx.createImageData(canvas.width, canvas.height);
    const buffer32 = new Uint32Array(idata.data.buffer);
    for (let i = 0; i < buffer32.length; i++) {
      const val = Math.random();
      if (val < 0.01) buffer32[i] = 0xff0000ff;
      else if (val < 0.1) buffer32[i] = 0xff000000;
      else buffer32[i] = (Math.random() * 255) << 24;
    }
    ctx.putImageData(idata, 0, 0);
    requestAnimationFrame(noise);
  }
  noise();
}
