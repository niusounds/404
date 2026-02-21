document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const timestampEl = document.getElementById('timestamp');
    const doorEl = document.getElementById('door');
    const shadowEl = document.getElementById('shadow-figure');
    const crawlEl = document.getElementById('shadow-crawling');
    const ceilingEl = document.getElementById('ceiling-entity');
    const bloodEl = document.getElementById('blood-text');
    const screenEl = document.getElementById('monitor-screen');
    const interferenceEl = document.getElementById('interference');
    const stalkerEl = document.getElementById('stalker-overlay');
    const logEl = document.getElementById('ui-log');
    const camBtns = document.querySelectorAll('.cam-btn');
    const camInfoEl = document.getElementById('cam-info');
    const batteryFill = document.getElementById('battery-fill');
    const signalFill = document.getElementById('signal-fill');
    const statusText = document.getElementById('status-text');

    // Constants & State
    const CAM_DATA = {
        '1': 'CAM-01: NORTH CORRIDOR B4',
        '2': 'CAM-02: STORAGE AREA B4',
        '3': 'CAM-03: STAIRWELL B5'
    };
    const META_LOGS = [
        "THERMAL SIGNATURE DETECTED: UNKNOWN",
        "OBJECT POSITION MATCHES USER COORDINATES",
        "WARNING: OPTICAL LENS COMPROMISED",
        "ERROR: BIOMETRIC SCAN FAILED",
        "DO NOT TURN AROUND",
        "SUBJECT 01 IS WATCHING",
        "BEHIND YOU",
        "LINK QUALITY DROPPING... RUN"
    ];

    let currentCam = '1';
    let batteryLevel = 98;
    let anomalyCount = 0;
    let storageShadowLevel = 0;
    let mouseIdleTimer;
    let isStalkerVisible = false;
    let terrorLevel = 0; // 0 to 100

    // Audio Context
    let audioCtx;
    let mainDrone;
    let gainNode;
    let whisperGain;

    function initAudio() {
        if (audioCtx) return;
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        mainDrone = audioCtx.createOscillator();
        gainNode = audioCtx.createGain();
        mainDrone.type = 'sine';
        mainDrone.frequency.setValueAtTime(55, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.012, audioCtx.currentTime);
        mainDrone.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        mainDrone.start();

        // Sub-drone for tension
        const subDrone = audioCtx.createOscillator();
        const subGain = audioCtx.createGain();
        subDrone.type = 'sine';
        subDrone.frequency.setValueAtTime(40, audioCtx.currentTime);
        subGain.gain.setValueAtTime(0.008, audioCtx.currentTime);
        subDrone.connect(subGain);
        subGain.connect(audioCtx.destination);
        subDrone.start();

        // Whisper Node (High freq noise)
        whisperGain = audioCtx.createGain();
        whisperGain.gain.setValueAtTime(0, audioCtx.currentTime);
        whisperGain.connect(audioCtx.destination);

        addLog('CCTV INTERFACE: ACTIVATED');
        addLog('CRYPTO-LINK: ENCRYPTED');
    }

    function playSoundEffect(freq, vol, dur, type = 'square', ramp = true) {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        g.gain.setValueAtTime(vol, audioCtx.currentTime);
        if (ramp) {
            g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
        }
        osc.connect(g);
        g.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + dur);
    }

    function playSwitchSound() {
        if (!audioCtx) return;
        playSoundEffect(120, 0.03, 0.04, 'sine');
        setTimeout(() => playSoundEffect(70, 0.02, 0.1, 'sine'), 45);
        const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.015, audioCtx.sampleRate);
        const out = buf.getChannelData(0);
        for (let i = 0; i < out.length; i++) out[i] = Math.random() * 2 - 1;
        const src = audioCtx.createBufferSource();
        src.buffer = buf;
        const g = audioCtx.createGain();
        g.gain.setValueAtTime(0.008, audioCtx.currentTime);
        src.connect(g);
        g.connect(audioCtx.destination);
        src.start();
    }

    function playGlitchSound() {
        if (!audioCtx) return;
        const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.3, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < output.length; i++) output[i] = Math.random() * 2 - 1;
        const src = audioCtx.createBufferSource();
        src.buffer = noiseBuffer;
        const g = audioCtx.createGain();
        g.gain.setValueAtTime(0.06 * (terrorLevel / 60 + 1), audioCtx.currentTime);
        src.connect(g);
        g.connect(audioCtx.destination);
        src.start();
    }

    function addLog(msg, isMeta = false) {
        if (!logEl) return;
        const entry = document.createElement('div');
        entry.className = 'log-entry' + (isMeta ? ' meta-glitch-text' : '');
        entry.textContent = `> ${msg}`;
        logEl.prepend(entry);
        if (logEl.children.length > 7) logEl.lastElementChild.remove();
    }

    // Camera Switched
    function switchCamera(camId, btn) {
        if (camId === currentCam) return;
        screenEl.classList.add('glitch');
        interferenceEl.classList.add('flash-active');
        playSwitchSound();
        addLog(`ACCESSING NODE ${camId}...`);

        setTimeout(() => {
            document.querySelectorAll('.cam-view').forEach(v => v.style.display = 'none');
            const targetCam = document.getElementById(`cam-${camId}`);
            if (targetCam) targetCam.style.display = 'block';
            document.querySelector('.cam-btn.active')?.classList.remove('active');
            btn.classList.add('active');
            camInfoEl.textContent = CAM_DATA[camId];
            currentCam = camId;
            screenEl.setAttribute('data-cam', camId);
            screenEl.classList.remove('glitch');
            interferenceEl.classList.remove('flash-active');

            if (currentCam === '2') {
                storageShadowLevel++;
                if (storageShadowLevel > 4) storageShadowLevel = 0;
                updateStorageShadow();
            }
        }, 220);
    }

    function updateStorageShadow() {
        const scare = document.getElementById('storage-scare');
        if (!scare) return;
        if (storageShadowLevel === 1) scare.style.opacity = '0.2';
        else if (storageShadowLevel === 2) scare.style.opacity = '0.5';
        else if (storageShadowLevel === 3) {
            scare.style.opacity = '0.9';
            scare.style.transform = 'scale(2) translateZ(100px)';
            addLog('BIO-MASS DETECTED IN SECTOR 2', true);
        } else if (storageShadowLevel === 4) {
            scare.style.opacity = '1';
            scare.style.filter = 'blur(1px)';
            scare.style.transform = 'scale(5) translateZ(400px)';
            addLog('CRITICAL: LENS OBSTRUCTED', true);
        } else {
            scare.style.opacity = '0';
        }
    }

    // Interaction 
    document.addEventListener('click', (e) => {
        const b = e.target.closest('.cam-btn');
        if (b) {
            const id = b.getAttribute('data-cam');
            if (id) switchCamera(id, b);
        }
        resetIdleTimer();
    });

    document.addEventListener('mousemove', () => resetIdleTimer());

    function resetIdleTimer() {
        clearTimeout(mouseIdleTimer);
        if (isStalkerVisible) {
            stalkerEl.classList.remove('stalker-active');
            isStalkerVisible = false;
        }
        mouseIdleTimer = setTimeout(triggerStalker, 12000);
    }

    function triggerStalker() {
        if (!isStalkerVisible && batteryLevel > 10) {
            isStalkerVisible = true;
            stalkerEl.classList.add('stalker-active');
            addLog('AMBIENT TEMP DROP DETECTED', true);
            if (whisperGain) {
                whisperGain.gain.setTargetAtTime(0.005, audioCtx.currentTime, 2);
            }
        }
    }

    // New Anomaly Logic
    function triggerAnomaly() {
        const threshold = 0.4 + (terrorLevel / 150);
        if (Math.random() > threshold) return;

        const chance = Math.random();
        anomalyCount++;
        terrorLevel = Math.min(100, terrorLevel + 3);

        if (currentCam === '1') {
            if (chance < 0.2 && shadowEl) {
                shadowEl.classList.add('passing');
                addLog('MOTION: SUB-LEVEL B4');
                setTimeout(() => shadowEl.classList.remove('passing'), 10000);
            } else if (chance < 0.4 && crawlEl) {
                crawlEl.classList.add('active');
                addLog('LOW-LEVEL MOVEMENT DETECTED');
                setTimeout(() => crawlEl.classList.remove('active'), 15000);
            } else if (chance < 0.6 && ceilingEl) {
                ceilingEl.classList.add('active');
                addLog('CEILING STRUCTURE ANOMALY');
                setTimeout(() => ceilingEl.classList.remove('active'), 5000);
            } else if (chance < 0.8 && doorEl) {
                doorEl.classList.add('open');
                addLog('SECURITY BREACH: DOOR 01');
                setTimeout(() => doorEl.classList.remove('open'), 6000);
            }
        } else if (currentCam === '2') {
            if (chance < 0.3 && bloodEl) {
                bloodEl.style.opacity = '0.5';
                addLog('SURFACE COLOR SHIFT DETECTED', true);
                setTimeout(() => bloodEl.style.opacity = '0', 4000);
            }
        } else if (currentCam === '3') {
            const scare = document.getElementById('stair-scare');
            if (scare && chance < 0.4) {
                scare.style.opacity = '1';
                setTimeout(() => scare.style.opacity = '0', 2000);
                addLog('OPTICAL ARTIFACT: STAIRS');
            }
        }

        // Meta Logs
        if (chance < 0.15 || terrorLevel > 80) {
            const meta = META_LOGS[Math.floor(Math.random() * META_LOGS.length)];
            addLog(meta, true);
        }

        // Global Visual glitch
        if (chance < 0.3) {
            screenEl.classList.add('glitch');
            interferenceEl.classList.add('flash-active');
            playGlitchSound();
            setTimeout(() => {
                screenEl.classList.remove('glitch');
                interferenceEl.classList.remove('flash-active');
            }, 400 + Math.random() * 1200);
        }

        // UI Jitter
        if (terrorLevel > 50) {
            document.querySelectorAll('.cctv-ui .status-item, .cctv-ui .cam-info, .cctv-ui .cam-name').forEach(el => el.classList.add('jittery-ui'));
        }
    }

    function updateStatusUI() {
        batteryLevel -= (0.12 + (terrorLevel / 800));
        if (batteryFill) {
            batteryFill.style.width = batteryLevel + '%';
            if (batteryLevel < 20) batteryFill.style.background = 'var(--cctv-red)';
        }
        const sig = Math.max(0, (batteryLevel > 5 ? 30 + Math.random() * 70 : 0));
        if (signalFill) signalFill.style.width = sig + '%';
        if (batteryLevel <= 0) handleEnding();
    }

    function handleEnding() {
        addLog('TERMINAL ERROR: LINK DEAD', true);
        screenEl.classList.add('glitch');
        interferenceEl.classList.add('flash-active');
        interferenceEl.style.opacity = '1';
        if (statusText) statusText.textContent = 'LINK TERMINATED';
        playSoundEffect(45, 0.2, 4, 'sawtooth');
        setTimeout(() => {
            document.body.innerHTML = '<div style="background:#000; width:100vw; height:100vh; display:flex; align-items:center; justify-content:center; color:#600; font-family:serif; font-size:2rem; cursor:pointer;" onclick="location.reload()">再 読 込</div>';
        }, 3000);
    }

    function updateTimestamp() {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0].replace(/-/g, '/');
        const timeStr = now.toTimeString().split(' ')[0];
        const ms = Math.floor(now.getMilliseconds() / 10).toString().padStart(2, '0');
        if (timestampEl) timestampEl.textContent = `${dateStr} ${timeStr}:${ms}`;
        if (screenEl) {
            const breath = Math.sin(Date.now() / 2000) * 0.05 + 1.15;
            const flicker = Math.random() * 0.015;
            const terrorFactor = terrorLevel / 350;
            screenEl.style.filter = `brightness(${breath - flicker - terrorFactor}) contrast(${1.1 + terrorFactor})`;
        }
        requestAnimationFrame(updateTimestamp);
    }
    updateTimestamp();

    const audioOverlay = document.getElementById('audio-overlay');
    if (audioOverlay) {
        audioOverlay.addEventListener('click', () => {
            initAudio();
            audioOverlay.style.display = 'none';
            setInterval(triggerAnomaly, 6000);
            setInterval(updateStatusUI, 3500);
            resetIdleTimer();
        }, { once: true });
    }
});
