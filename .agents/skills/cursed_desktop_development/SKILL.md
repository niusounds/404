---
name: cursed_desktop_development
description: Guidelines and technical patterns for developing the Cursed Desktop horror experience.
---

# Cursed Desktop Development Skill

This skill provides the necessary context and technical patterns to maintain and expand the "Cursed Desktop" — a web-based faux operating system designed for psychological horror.

## Core Architecture

### 1. The Corruption System (`corruptionLevel`)
Everything in the desktop revolves around the `corruptionLevel` variable in `assets/js/desktop.js`.
- **Level 1-4**: Subtle hints, shaking windows, faint background faces.
- **Level 5-8**: Interactive hijackings (Notepad, Run command), visual distortions (Warp), audio whispers.
*   **Level 10+**: System failure (BSOD), physical manifestations (Blood), terminal countdowns.

**Rule for new features:** Always check the current `corruptionLevel` to ensure the horror scales appropriately. Don't show extreme horror too early.

### 2. Window Management
Windows are created dynamically via `createWindow(title, content, options)`.
- Use the `options` object to pass `className` for specific styles (e.g., `.shake`, `.corrupted`).
- New windows should increment the global `openWindows` counter to manage `z-index` and cascading layout.

## Technical Patterns

### Visual Horror (CSS & Canvas)
- **Chromatic Aberration**: Use multiple `drop-shadow` filters with red/blue offsets.
- **Screen Warp**: Use `perspective` and `rotateX/Y` in `@keyframes`.
- **Canvas Noise**: Use a persistent `noise-canvas` with `ImageData` manipulation for retro CRT static.
- **Image-less Icons**: Use `clip-path` to draw Win95-style icons to avoid loading delays.

### Auditory Horror (Web Audio & Speech)
- **SpeechSynthesis**: Use `ja-JP` locale. Set `pitch` to `0.1`, `rate` to `0.8`, and `volume` to `0.5` for a demonic whisper effect.
- **Glitch Noise**: Use `AudioContext` with `sawtooth` oscillators and exponential gain ramps for sharp digital stings.

### Meta Horror (Visibility API)
- Monitor `visibilitychange` to detect when the user leaves the tab. Use this to change `document.title` and increase `corruptionLevel` when they return.

## Development Workflow

1.  **Logic Update**: Modify `assets/js/desktop.js` to add new triggers or functions.
2.  **Style Update**: Add specific horror classes or animations to `assets/css/desktop.css`.
3.  **Content Update**: Update the `STORY` object in `desktop.js` for new files/folders.
4.  **Documentation**: Always sync changes with `docs/desktop.md` to keep the manifestation manifest updated.

## Horror Design Principles
- **Unpredictability**: Use small random chances (`Math.random() < 0.005`) for "ultra-rare" events that don't happen every session.
- **Meta Isolation**: Make the user feel like their *browser* or *hardware* is failing, not just the website.
- **Delayed Gratification**: The scariest part is the anticipation. Use sub-menus and "hidden" files to hide the worst content.
