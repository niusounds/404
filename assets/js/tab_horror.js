// Tab Horror - Meta Horror Experience using Visibility API
(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    titleChangeInterval: 2000, // ms between title changes
    audioEnabled: true,
  };
  
  // Audio constants
  const AUDIO = {
    BASE_WHISPER_FREQ: 80,
    FREQ_RANGE: 40,
  };

  // State
  let awayCount = 0;
  let isAway = false;
  let titleInterval = null;
  let audioContext = null;
  let originalTitle = document.title;

  // Title messages that appear when user is away
  const awayTitles = [
    '戻ってきて...',
    'ひとりにしないで',
    '寂しい',
    'まだそこにいる？',
    '見ているよ',
    'あなたのことを',
    '忘れないで',
    '帰ってきて',
    'ずっと待ってる',
    '誰もいない',
    '暗い',
    '怖い',
    '助けて',
    '離れないで',
    'どこへ行ったの？',
  ];

  // More intense messages after multiple leaves
  const intenseAwayTitles = [
    '戻って来い',
    'なぜ離れる',
    'もう手遅れ',
    'あなたの後ろに',
    '見えているよ',
    '逃がさない',
    '永遠にここに',
    'もう遅い',
    '閉じ込められた',
  ];

  // Elements
  const bloodOverlay = document.getElementById('blood-overlay');
  const shadowFigure = document.getElementById('shadow-figure');
  const eyesOverlay = document.getElementById('eyes-overlay');

  // Initialize
  function init() {
    setupVisibilityListener();
    setupAudio();
  }

  // Setup Page Visibility API
  function setupVisibilityListener() {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  // Handle visibility change
  function handleVisibilityChange() {
    if (document.hidden) {
      handleTabHidden();
    } else {
      handleTabVisible();
    }
  }

  // When user switches away from tab
  function handleTabHidden() {
    isAway = true;
    awayCount++;
    startChangingTitle();
    console.log('User left tab. Count:', awayCount);
  }

  // When user returns to tab
  function handleTabVisible() {
    if (!isAway) return;
    
    isAway = false;
    stopChangingTitle();
    
    console.log('User returned to tab. Total leaves:', awayCount);
    
    // Restore original title briefly before showing effect
    document.title = originalTitle;
    
    // Trigger return effects based on how many times they left
    setTimeout(() => {
      triggerReturnEffects();
    }, 100);
  }

  // Start changing the title while away
  function startChangingTitle() {
    let titleIndex = 0;
    const titles = awayCount >= 3 ? intenseAwayTitles : awayTitles;
    
    // Change title immediately
    document.title = titles[0];
    
    // Then keep changing it
    titleInterval = setInterval(() => {
      titleIndex = (titleIndex + 1) % titles.length;
      document.title = titles[titleIndex];
    }, CONFIG.titleChangeInterval);
  }

  // Stop changing the title
  function stopChangingTitle() {
    if (titleInterval) {
      clearInterval(titleInterval);
      titleInterval = null;
    }
  }

  // Trigger visual and audio effects when user returns
  function triggerReturnEffects() {
    // Level 1: First time (subtle)
    if (awayCount === 1) {
      flashBloodOverlay(1000);
      playWhisper();
    }
    
    // Level 2: Second time (noticeable)
    else if (awayCount === 2) {
      flashBloodOverlay(2000);
      showShadowFigure(3000);
      playWhisper();
    }
    
    // Level 3: Third time (intense)
    else if (awayCount === 3) {
      flashBloodOverlay(3000);
      showShadowFigure(5000);
      playWhisper();
      document.body.classList.add('returned');
      setTimeout(() => {
        document.body.classList.remove('returned');
      }, 1000);
    }
    
    // Level 4+: Maximum intensity
    else if (awayCount >= 4) {
      flashBloodOverlay(4000);
      showShadowFigure(7000);
      showEyes(5000);
      playWhisper();
      document.body.classList.add('returned');
      
      // Screen shake multiple times
      setTimeout(() => {
        document.body.classList.remove('returned');
      }, 500);
      setTimeout(() => {
        document.body.classList.add('returned');
      }, 700);
      setTimeout(() => {
        document.body.classList.remove('returned');
      }, 1200);
    }
  }

  // Visual Effects
  function flashBloodOverlay(duration) {
    bloodOverlay.classList.add('active');
    setTimeout(() => {
      bloodOverlay.classList.remove('active');
    }, duration);
  }

  function showShadowFigure(duration) {
    shadowFigure.classList.add('active');
    setTimeout(() => {
      shadowFigure.classList.remove('active');
    }, duration);
  }

  function showEyes(duration) {
    eyesOverlay.classList.add('active');
    setTimeout(() => {
      eyesOverlay.classList.remove('active');
    }, duration);
  }

  // Audio Effects
  function setupAudio() {
    if (!CONFIG.audioEnabled) return;
    
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.log('Web Audio API not supported');
      CONFIG.audioEnabled = false;
    }
  }

  function playWhisper() {
    if (!CONFIG.audioEnabled || !audioContext) return;
    
    // Create a creepy whisper sound using oscillators
    const now = audioContext.currentTime;
    
    // Base frequency for whisper (very low)
    const baseFreq = AUDIO.BASE_WHISPER_FREQ + Math.random() * AUDIO.FREQ_RANGE;
    
    // Create oscillator for the whisper
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(baseFreq, now);
    
    // Add some frequency wobble for creepy effect
    oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 0.95, now + 0.5);
    oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 1.05, now + 1);
    
    // Create gain for volume control
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.03, now + 0.1);
    gainNode.gain.linearRampToValueAtTime(0.03, now + 0.8);
    gainNode.gain.linearRampToValueAtTime(0, now + 1.5);
    
    // Create filter for whisper quality
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    filter.Q.setValueAtTime(5, now);
    
    // Connect nodes
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Play
    oscillator.start(now);
    oscillator.stop(now + 1.5);
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    stopChangingTitle();
    if (audioContext) {
      audioContext.close();
    }
  });

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
