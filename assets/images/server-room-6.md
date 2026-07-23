<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 408 268" width="400" height="256">

  <defs>
    <!-- dark corridor gradient -->
    <linearGradient id="corridorBG" x1="0.5" y1="0" x2="0.5" y2="1">
      <stop offset="0%"   stop-color="#4a3b0b"/>
      <stop offset="100%" stop-color="#1a0e00"/>
    </linearGradient>

    <!-- subtle corridor grid to suggest server rack lines -->
    <pattern id="grid" width="40" height="24" patternUnits="userSpaceOnUse">
      <line x="0" y="0" x2="40"   y2="0"  stroke="#ffd78a" stroke-width="0.3"/>
      <line x="0" y="0" x2="0"    y2="24" stroke="#ffd78a" stroke-width="0.3"/>
    </pattern>

    <!-- green light glow -->
    <radialGradient id="glowGreen">
      <stop offset="0%"   stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#00ff88"/>
    </radialGradient>

    <!-- red light glow -->
    <radialGradient id="glowRed">
      <stop offset="0%"   stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#58ff00"/>
    </radialGradient>

    <!-- dim amber light glow -->
    <radialGradient id="glowAmber">
      <stop offset="0%"   stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#d99b3b"/>
    </radialGradient>

    <!-- subtle fog / dust in corridor -->
    <filter id="fog">
      <feGaussianBlur stdDeviation="4" />
    </filter>
  </defs>

  <!-- corridor perspective background gradient (light source at the far end) -->
  <linearGradient id="corrGrad" x1="0.50" y1="0" x2="0.5" y2="0">
    <stop offset="0%"   stop-color="#070404"/>
    <stop offset="50%"  stop-color="#180a00"/>
    <stop offset="95%"  stop-color="#ffd965"/>
    <stop offset="100%" stop-color="#ffffff"/>

</svg>
