let audioCtx;
let listener;
let isStarted = false;

const darkness = document.getElementById('darkness');
const container = document.getElementById('container');
const startBtn = document.getElementById('start-btn');
const heartbeatVisual = document.getElementById('heartbeat-visual');
const subtitles = document.getElementById('subtitles');

startBtn.addEventListener('click', startExperience);

function startExperience() {
    if (isStarted) return;
    isStarted = true;

    // Initialize Audio Context
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    listener = audioCtx.listener;

    // Fade out UI
    container.style.opacity = '0';
    setTimeout(() => {
        container.style.display = 'none';
        darkness.style.display = 'block';
        setTimeout(() => {
            darkness.style.opacity = '1';
            beginAudioSequence();
        }, 100);
    }, 2000);
}

function beginAudioSequence() {
    // Phase 1: Isolation (0s - 5s)
    playHeartbeat();

    // Phase 2: Distant Awareness (5s)
    setTimeout(() => {
        playGhostlyBreathe(1, 1, 4);
        showSubtitle("だれか、いるの？");
    }, 5000);

    // Phase 3: The Approach (12s)
    setTimeout(() => {
        approachFootsteps();
    }, 12000);

    // Phase 4: Encirclement (25s)
    setTimeout(() => {
        whisperAtIntervals();
        playGhostlyBreathe(-3, 2, 8); // Deep breath far left-back
        playGhostlyBreathe(3, 2, 8);  // Deep breath far right-back
        playCirclingBreath(5);       // A presence moving around

        // Sudden knock on the left
        setTimeout(() => playKnock(-5, 0), 2000);
    }, 25000);

    // Phase 4.5: Chaotic Scuttling (35s)
    setTimeout(() => {
        playScuttle();
        if (Math.random() > 0.5) {
            setTimeout(() => playKnock(3, -2), 3000);
        }
    }, 35000);

    // Phase 5: The Climax (50000ms = 50s)
    setTimeout(() => {
        stopFootsteps();
        const finalWhisper = new SpeechSynthesisUtterance("うしろ、向いちゃだめだよ");
        finalWhisper.lang = 'ja-JP';
        finalWhisper.pitch = 0.1;
        finalWhisper.rate = 0.4;
        finalWhisper.volume = 1.0;
        speechSynthesis.speak(finalWhisper);
        showSubtitle("うしろ、向いちゃだめだよ");

        playGhostlyBreathe(0.2, 0.5, 10);
    }, 50000);

    // Phase 6: Silence / End (65s)
    setTimeout(() => {
        isStarted = false;
        darkness.style.opacity = '0';
        setTimeout(() => {
            location.href = '/';
        }, 3000);
    }, 65000);
}

let footstepTimer = null;
function stopFootsteps() {
    if (footstepTimer) clearTimeout(footstepTimer);
}

function playHeartbeat() {
    function singleThump(volume, time, frequency) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        osc.type = 'sine';
        // Frequency sweep for a more "thumpy" feel
        osc.frequency.setValueAtTime(frequency, time);
        osc.frequency.exponentialRampToValueAtTime(frequency * 0.5, time + 0.1);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(100, time);

        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(volume, time + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(time);
        osc.stop(time + 0.2);
    }

    function beat() {
        if (!isStarted) return;
        const now = audioCtx.currentTime;

        // Double thump: Lub-dub
        singleThump(0.15, now, 60);         // The "Lub"
        setTimeout(() => {
            singleThump(0.1, audioCtx.currentTime, 50); // The "Dub"
        }, 250);

        // Visual pulse
        heartbeatVisual.classList.remove('pulse');
        void heartbeatVisual.offsetWidth;
        heartbeatVisual.classList.add('pulse');

        // Next beat
        setTimeout(beat, 1200 + (Math.random() * 300));
    }
    beat();
}

function approachFootsteps() {
    const panner = audioCtx.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1;
    panner.maxDistance = 10000;
    panner.rolloffFactor = 1;
    panner.coneInnerAngle = 360;
    panner.coneOuterAngle = 0;
    panner.coneOuterGain = 0;

    panner.connect(audioCtx.destination);

    let x = 10, z = -10; // Start far right-back
    panner.positionX.setValueAtTime(x, audioCtx.currentTime);
    panner.positionZ.setValueAtTime(z, audioCtx.currentTime);

    function step() {
        if (!isStarted) return;

        // Footstep sound synthesis (Noise + Filter)
        const bufferSize = audioCtx.sampleRate * 0.1;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const source = audioCtx.createBufferSource();
        source.buffer = buffer;

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, audioCtx.currentTime);

        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(panner);

        source.start();

        // Move closer
        x -= 0.5;
        z += 0.5;
        if (z > 2) z = 2; // Stay close
        if (x < -2) x = -2;

        panner.positionX.setTargetAtTime(x, audioCtx.currentTime, 0.1);
        panner.positionZ.setTargetAtTime(z, audioCtx.currentTime, 0.1);

        if (z >= 1.5) {
            // Very close
            if (Math.random() > 0.8) showSubtitle("後ろにいる");
        }

        footstepTimer = setTimeout(step, 800 + (Math.random() * 100));
    }
    step();
}


function playKnock(x, z) {
    const panner = audioCtx.createPanner();
    panner.panningModel = 'HRTF';
    panner.positionX.setValueAtTime(x, audioCtx.currentTime);
    panner.positionZ.setValueAtTime(z, audioCtx.currentTime);
    panner.connect(audioCtx.destination);

    // Short percussive thump
    const duration = 0.1;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, audioCtx.currentTime);

    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.8, audioCtx.currentTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(panner);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);

    // Physical double knock
    setTimeout(() => {
        if (!isStarted) return;
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(130, audioCtx.currentTime);
        gain2.gain.setValueAtTime(0.6, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc2.connect(gain2);
        gain2.connect(panner);
        osc2.start();
        osc2.stop(audioCtx.currentTime + duration);
    }, 150);
}

function playScuttle() {
    const panner = audioCtx.createPanner();
    panner.panningModel = 'HRTF';
    panner.connect(audioCtx.destination);

    const duration = 2;
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, audioCtx.currentTime);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.1);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(panner);

    // Rapid movement from left to right back
    panner.positionX.setValueAtTime(-10, audioCtx.currentTime);
    panner.positionX.linearRampToValueAtTime(10, audioCtx.currentTime + duration);
    panner.positionZ.setValueAtTime(-5, audioCtx.currentTime);
    panner.positionZ.linearRampToValueAtTime(5, audioCtx.currentTime + duration);

    source.start();
    showSubtitle("カサカサ...");
}

function playCirclingBreath(duration = 10) {
    const panner = audioCtx.createPanner();
    panner.panningModel = 'HRTF';
    panner.connect(audioCtx.destination);

    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, audioCtx.currentTime);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 1);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(panner);

    // Orbit around the listener
    const startAngle = Math.random() * Math.PI * 2;
    for (let i = 0; i <= 100; i++) {
        const timeOffset = (i / 100) * duration;
        const angle = startAngle + (i / 100) * Math.PI * 4; // 2 full circles
        const x = Math.sin(angle) * 3;
        const z = Math.cos(angle) * 3;
        panner.positionX.setValueAtTime(x, audioCtx.currentTime + timeOffset);
        panner.positionZ.setValueAtTime(z, audioCtx.currentTime + timeOffset);
    }

    source.start();
}

// Reactive sound based on mouse move
// Reactive sound based on mouse move
let lastShuffle = 0;
document.addEventListener('mousemove', () => {
    if (!isStarted || Date.now() - lastShuffle < 1500) return;
    lastShuffle = Date.now();

    // Create spatial panner for the shuffle
    const panner = audioCtx.createPanner();
    panner.panningModel = 'HRTF';
    // Randomize position: far left, far right, or behind
    const rx = (Math.random() - 0.5) * 10; // -5 to 5
    const rz = (Math.random() - 0.5) * 10; // -5 to 5
    panner.positionX.setValueAtTime(rx, audioCtx.currentTime);
    panner.positionZ.setValueAtTime(rz, audioCtx.currentTime);

    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    const source = audioCtx.createBufferSource();

    const duration = 0.1 + Math.random() * 0.2;
    const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * duration, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 0.1;

    source.buffer = buffer;
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000 + Math.random() * 2000, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.02 + Math.random() * 0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(panner);
    panner.connect(audioCtx.destination);
    source.start();
});



function whisperAtIntervals() {
    const phrases = [
        "ねえ、聞こえる？",
        "すぐそこにいるよ",
        "逃げても無駄だよ",
        "あなたの後ろ、見てごらん",
        "ずっと、ここにいたんだ",
        "暗いところ、好きでしょ？"
    ];

    function whisper() {
        if (!isStarted) return;

        const phrase = phrases[Math.floor(Math.random() * phrases.length)];
        const x = Math.random() * 4 - 2; // -2 to 2 (spatial)
        const z = 1; // Always slightly behind

        // Play synthesized "breath" at the same spatial position
        playGhostlyBreathe(x, z, 3);

        // Occasional circling presence
        if (Math.random() > 0.6) {
            playCirclingBreath(6);
        }

        setTimeout(() => {
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(phrase);
                utterance.lang = 'ja-JP';
                utterance.pitch = 0.1; // Extremely low pitch
                utterance.rate = 0.5;  // Slow, dragging speech
                utterance.volume = 0.1 + Math.random() * 0.2;

                speechSynthesis.speak(utterance);
                if (Math.random() > 0.4) showSubtitle(phrase);
            }
        }, 500);


        // Occasional extra breath instead of digital sting
        if (Math.random() > 0.8) {
            setTimeout(() => playGhostlyBreathe(Math.random() * 4 - 2, 1, 4), 3000);
        }

        setTimeout(whisper, 6000 + Math.random() * 10000);
    }
    whisper();
}

function showSubtitle(text) {
    subtitles.innerText = text;
    subtitles.style.opacity = '1';
    setTimeout(() => {
        subtitles.style.opacity = '0';
    }, 2000);
}
