/**
 * Read Aloud Feature (Web Speech API)
 * Reads text content aloud using SpeechSynthesis with a visual player UI.
 * Users hover/click to select elements, and can navigate through them using the player.
 * @param {ShadowRoot} root - The shadow root of the widget
 * @param {Function} initButton - Function to initialize the button
 * @param {Function} toggleFeature - Function to toggle the feature state
 * @param {Function} registerReset - Function to register reset handler
 */

let CURRENT_AUDIO_DESC_STATE = false

function audioDescription(
  root,
  initButton,
  toggleFeature,
  registerReset,
  runtime = {},
) {
  const button = {
    id: 'audioDescriptionBtn',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`,
    name: 'Sesli Oku',
    type: 'toggle',
  }

  // Helper to translate safely
  function getTranslation(key, fallback) {
    if (window.a11yI18n && typeof window.a11yI18n.t === 'function') {
      return window.a11yI18n.t(key)
    }
    return fallback
  }

  // --- Styles ---
  function injectStyles() {
    if (!document.getElementById('a11y-audio-desc-style')) {
      const style = prepareWidgetStyle(document.createElement('style'))
      style.id = 'a11y-audio-desc-style'
      style.textContent = `
        /* Highlight Style */
        .a11y-ad-highlight {
            outline: 3px solid #0d9488 !important;
            outline-offset: 2px;
            background-color: rgba(13, 148, 136, 0.1) !important;
            cursor: pointer !important;
            transition: all 0.2s ease;
        }

        /* Hover Effect (when feature is on) */
        body.a11y-ad-enabled *:hover {
             cursor: help;
        }

        body.a11y-ad-enabled .a11y-ad-hover:not(.a11y-ad-highlight) {
            outline: 2px dashed #0d9488 !important;
            outline-offset: 2px;
            background-color: rgba(13, 148, 136, 0.05) !important;
        }

        /* Player Container with Glassmorphism */
        .a11y-ad-player {
            position: fixed;
            bottom: 90px;
            right: 25px;
            width: 380px;

            /* Glassmorphism Base */
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(12px) saturate(180%);
            -webkit-backdrop-filter: blur(12px) saturate(180%);
            border: 1px solid rgba(209, 213, 219, 0.5); /* Gray-300 */
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);

            border-radius: 16px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.3s, transform 0.3s;
            pointer-events: none;
        }
        .a11y-ad-player.visible {
            opacity: 1;
            transform: translateY(0);
            pointer-events: auto;
        }

        /* Header / Visualizer Area */
        .a11y-ad-header {
            padding: 16px;
            background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            position: relative;
        }

        .a11y-ad-icon-animation {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: rgba(255,255,255,0.2);
            animation: pulse-ring 2s infinite;
        }

        @keyframes pulse-ring {
            0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
            100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
        }

        /* Content Area */
        .a11y-ad-content {
            padding: 16px;
        }
        .a11y-ad-text-display {
            font-size: 15px;
            line-height: 1.6;
            color: #1f2937;
            margin-bottom: 20px;
            max-height: 120px;
            overflow-y: auto;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 12px;
            font-weight: 500;
        }

        /* Controls */
        .a11y-ad-controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
        }

        .a11y-ad-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border-radius: 50%; /* Circle shape for all */
            background: transparent;
            border: 1px solid transparent;
            color: #4b5563;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .a11y-ad-btn:hover:not(:disabled) {
            background: rgba(0, 0, 0, 0.05);
            color: #111827;
            transform: scale(1.05); /* Gentle scale */
        }
        .a11y-ad-btn:disabled {
            opacity: 0.3;
            cursor: not-allowed;
        }

        .a11y-ad-btn-lg {
            width: 48px;
            height: 48px;
            background: #0d9488; /* Keep primary color for play */
            color: white;
            box-shadow: 0 4px 10px rgba(13, 148, 136, 0.2);
        }
        .a11y-ad-btn-lg:hover:not(:disabled) {
            background: #0f766e;
            transform: scale(1.05);
            box-shadow: 0 6px 12px rgba(13, 148, 136, 0.3);
        }

        /* Close Button - Red X Style */
        .a11y-ad-close {
            position: absolute;
            top: 10px;
            right: 10px;
            width: 32px;
            height: 32px;
            background: #ef4444; /* Red-500 */
            color: white;
            border: 2px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer !important;
            z-index: 20;
            transition: all 0.2s;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            padding: 0;
        }
        .a11y-ad-close:hover {
            background: #dc2626; /* Red-600 */
            transform: scale(1.1) rotate(90deg);
            color: white;
        }
        .a11y-ad-close svg {
            width: 18px;
            height: 18px;
            stroke-width: 2.5;
        }

        /* Ensure player elements don't inherit the help cursor */
        .a11y-ad-player, .a11y-ad-player * {
             cursor: default !important;
        }

        .a11y-ad-btn {
             cursor: pointer !important;
        }

        /* Mobile Responsive */
        @media (max-width: 500px) {
            .a11y-ad-player {
                width: 94%;
                right: 3%;
                left: 3%;
                bottom: 100px;
            }
        }
      `
      document.head.appendChild(style)
    }
  }

  function removeStyles() {
    const style = document.getElementById('a11y-audio-desc-style')
    if (style) style.remove()
  }

  // --- Dynamic Text Update ---
  window.updateAudioDescriptionTexts = function () {
    if (!playerEl) return

    const tTitle = getTranslation('audioDescriptionBtn', 'Sesli Oku')
    const tClose = getTranslation('close', 'Kapat')
    const tPrev = getTranslation('previous', 'Önceki')
    const tNext = getTranslation('next', 'Sonraki')
    const tPlay = getTranslation('play', 'Oynat')
    const tPause = getTranslation('pause', 'Duraklat')
    const tReplay = getTranslation('replay', 'Tekrarla')

    // Update Title
    const titleEl = playerEl.querySelector('#a11y-ad-title')
    if (titleEl) titleEl.innerText = tTitle

    // Update Close Button
    const closeBtn = playerEl.querySelector('.a11y-ad-close')
    if (closeBtn) closeBtn.setAttribute('title', tClose)

    // Update Controls
    const prevBtn = playerEl.querySelector('#a11y-ad-prev')
    if (prevBtn) prevBtn.setAttribute('title', tPrev)

    const nextBtn = playerEl.querySelector('#a11y-ad-next')
    if (nextBtn) nextBtn.setAttribute('title', tNext)

    const replayBtn = playerEl.querySelector('#a11y-ad-replay')
    if (replayBtn) replayBtn.setAttribute('title', tReplay)

    // Update Play/Pause title based on current state (tricky, but we can set base title)
    // Since play/pause toggles, we might just leave the title as main action or update dynamically in toggle
    const playPauseBtn = playerEl.querySelector('#a11y-ad-play-pause')
    if (playPauseBtn) {
      // Just update the generic title or current state if possible
      // For now let's set it to Play as safe default or check icon visibility
      const isPlaying =
        playPauseBtn.querySelector('#a11y-ad-icon-pause').style.display !==
        'none'
      playPauseBtn.setAttribute('title', isPlaying ? tPause : tPlay)
    }
  }

  // --- Logic ---
  let playerEl = null
  let activeUtterance = null
  let playlist = []
  let currentIndex = -1

  function getPlayer() {
    if (playerEl) return playerEl

    const el = document.createElement('div')
    el.className = 'a11y-ad-player'
    el.innerHTML = renderPlayerContent()
    document.body.appendChild(el)

    // Event Listeners
    el.querySelector('.a11y-ad-close').addEventListener('click', closePlayer)
    el.querySelector('#a11y-ad-prev').addEventListener('click', playPrev)
    el.querySelector('#a11y-ad-next').addEventListener('click', playNext)
    el.querySelector('#a11y-ad-play-pause').addEventListener(
      'click',
      togglePlayPause,
    )
    el.querySelector('#a11y-ad-replay').addEventListener('click', replayCurrent)

    playerEl = el
    return el
  }

  function renderPlayerContent() {
    const tClose = getTranslation('close', 'Kapat')
    const tTitle = getTranslation('audioDescriptionBtn', 'Sesli Oku')

    return `
      <div class="a11y-ad-header">
        <div class="a11y-ad-icon-animation">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
        </div>
        <span id="a11y-ad-title" style="font-weight:600; font-size:14px;">${tTitle}</span>
        <button class="a11y-ad-close" title="${tClose}">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      <div class="a11y-ad-content">
        <div class="a11y-ad-text-display" id="a11y-ad-text"></div>
        <div class="a11y-ad-controls">
            <!-- Prev -->
            <button class="a11y-ad-btn" id="a11y-ad-prev" title="${getTranslation('previous', 'Önceki')}">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>
            </button>

            <!-- Replay -->
             <button class="a11y-ad-btn" id="a11y-ad-replay" title="${getTranslation('replay', 'Tekrarla')}">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>
            </button>

            <!-- Play/Pause -->
            <button class="a11y-ad-btn a11y-ad-btn-lg" id="a11y-ad-play-pause" title="${getTranslation('play', 'Oynat')}">
                <svg id="a11y-ad-icon-play" style="display:none;" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                <svg id="a11y-ad-icon-pause" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
            </button>

             <!-- Next -->
            <button class="a11y-ad-btn" id="a11y-ad-next" title="${getTranslation('next', 'Sonraki')}">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
            </button>
        </div>
      </div>
    `
  }

  // --- TTS Engine ---

  function stopSpeaking() {
    if (
      window.speechSynthesis &&
      (window.speechSynthesis.speaking || window.speechSynthesis.paused)
    ) {
      window.speechSynthesis.cancel()
    }
  }

  function speak(text) {
    stopSpeaking()

    if (
      !text ||
      !window.speechSynthesis ||
      typeof window.SpeechSynthesisUtterance !== 'function'
    ) {
      return
    }

    activeUtterance = new window.SpeechSynthesisUtterance(text)

    // Language Mock/Detection
    let lang = 'tr-TR' // Default
    if (window.a11yI18n) {
      const map = {
        tr: 'tr-TR',
        en: 'en-US',
        ar: 'ar-SA', // Basic logic
      }
      const current = window.a11yI18n.getCurrentLang()
      if (map[current]) lang = map[current]
    }

    activeUtterance.lang = lang

    // Update Icons on End
    activeUtterance.onend = () => {
      updatePlayPauseIcon(false) // Show Play
    }

    window.speechSynthesis.speak(activeUtterance)
    updatePlayPauseIcon(true) // Show Pause
  }

  function updatePlayPauseIcon(isPlaying) {
    const player = getPlayer()
    const playIcon = player.querySelector('#a11y-ad-icon-play')
    const pauseIcon = player.querySelector('#a11y-ad-icon-pause')

    if (isPlaying) {
      playIcon.style.display = 'none'
      pauseIcon.style.display = 'block'
    } else {
      playIcon.style.display = 'block'
      pauseIcon.style.display = 'none'
    }
  }

  // --- DOM & Navigation ---

  function buildPlaylist() {
    // Scan accessible text elements
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: function (node) {
          if (
            [
              'P',
              'H1',
              'H2',
              'H3',
              'H4',
              'H5',
              'H6',
              'LI',
              'BLOCKQUOTE',
              'SPAN',
              'DIV',
            ].includes(node.tagName)
          ) {
            if (
              node.innerText.trim().length > 3 &&
              node.offsetParent !== null
            ) {
              // Visible and meaningful
              // Avoid nested duplicates (simple check)
              if (
                node.children.length > 0 &&
                Array.from(node.children).some(c =>
                  ['P', 'DIV'].includes(c.tagName),
                )
              ) {
                return NodeFilter.FILTER_SKIP
              }
              return NodeFilter.FILTER_ACCEPT
            }
          }
          return NodeFilter.FILTER_SKIP
        },
      },
    )

    playlist = []
    let currentNode
    while ((currentNode = walker.nextNode())) {
      // Exclude widget itself
      if (
        currentNode.closest('#a11y-widget-host') ||
        currentNode.closest('.a11y-ad-player')
      )
        continue
      playlist.push(currentNode)
    }
  }

  function highlightItem(element) {
    // Remove old highlights
    document
      .querySelectorAll('.a11y-ad-highlight')
      .forEach(el => el.classList.remove('a11y-ad-highlight'))

    if (element) {
      element.classList.add('a11y-ad-highlight')
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  function activateItem(element) {
    if (!element) return

    // Find index
    const index = playlist.indexOf(element)
    if (index !== -1) currentIndex = index

    // UI Updates
    highlightItem(element)
    const text = element.innerText.trim()

    const player = getPlayer()
    player.querySelector('#a11y-ad-text').textContent = text
    player.classList.add('visible')

    // Speak
    speak(text)

    // Notify other players to close
    document.dispatchEvent(new CustomEvent('a11y-ad-activated'))

    // Update Button States
    player.querySelector('#a11y-ad-prev').disabled = currentIndex <= 0
    player.querySelector('#a11y-ad-next').disabled =
      currentIndex >= playlist.length - 1
  }

  function playNext() {
    if (currentIndex < playlist.length - 1) {
      currentIndex++
      activateItem(playlist[currentIndex])
    }
  }

  function playPrev() {
    if (currentIndex > 0) {
      currentIndex--
      activateItem(playlist[currentIndex])
    }
  }

  function replayCurrent() {
    if (currentIndex !== -1 && playlist[currentIndex]) {
      speak(playlist[currentIndex].innerText.trim())
    }
  }

  function togglePlayPause() {
    if (window.speechSynthesis.speaking) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume()
        updatePlayPauseIcon(true)
      } else {
        window.speechSynthesis.pause()
        updatePlayPauseIcon(false)
      }
    } else {
      replayCurrent()
    }
  }

  function closePlayer() {
    stopSpeaking()
    getPlayer().classList.remove('visible')
    highlightItem(null)
    currentIndex = -1
  }

  // --- Interaction Global Listeners ---

  function handleGlobalMouseOver(e) {
    if (
      e.target.closest('#a11y-widget-host') ||
      e.target.closest('.a11y-ad-player')
    )
      return

    // Simple hover effect
    e.target.classList.add('a11y-ad-hover')
    e.stopPropagation()
  }

  function handleGlobalMouseOut(e) {
    e.target.classList.remove('a11y-ad-hover')
  }

  function handleGlobalClick(e) {
    if (
      e.target.closest('#a11y-widget-host') ||
      e.target.closest('.a11y-ad-player')
    )
      return

    // Try to match clicked element to playlist or find closest parent in playlist
    let target = e.target
    let found = null

    // Look up until we find something in our playlist or hit body
    while (target && target !== document.body) {
      if (playlist.includes(target)) {
        found = target
        break
      }
      target = target.parentElement
    }

    if (found) {
      e.preventDefault()
      e.stopPropagation()
      activateItem(found)
    }
  }

  // --- Feature Toggle ---

  function enableFeature() {
    document.body.classList.add('a11y-ad-enabled')
    injectStyles()
    buildPlaylist()

    document.addEventListener('mouseover', handleGlobalMouseOver)
    document.addEventListener('mouseout', handleGlobalMouseOut)
    // Event Listeners for mutual exclusion
    document.addEventListener('a11y-sl-activated', closePlayer)

    document.addEventListener('click', handleGlobalClick, true) // Capture phase to beat links
  }

  function disableFeature() {
    document.body.classList.remove('a11y-ad-enabled')
    closePlayer()
    removeStyles()

    document.removeEventListener('mouseover', handleGlobalMouseOver)
    document.removeEventListener('mouseout', handleGlobalMouseOut)
    document.removeEventListener('click', handleGlobalClick, true)
    document.removeEventListener('a11y-sl-activated', closePlayer)

    if (playerEl) {
      playerEl.remove()
      playerEl = null
    }
  }

  function toggleState(state) {
    const supported =
      Boolean(window.speechSynthesis) &&
      typeof window.SpeechSynthesisUtterance === 'function'
    CURRENT_AUDIO_DESC_STATE = Boolean(state && supported)
    if (CURRENT_AUDIO_DESC_STATE) {
      enableFeature()
    } else {
      disableFeature()
    }
    toggleFeature(button, CURRENT_AUDIO_DESC_STATE)
  }

  // --- Initialization ---

  const handleAudioDesc = function () {
    const newState = !CURRENT_AUDIO_DESC_STATE
    localStorage.setItem('a11y-audio-desc', newState.toString())
    toggleState(newState)
  }

  initButton(button, handleAudioDesc)

  const buttonElement = root.getElementById(button.id)
  const supported =
    Boolean(window.speechSynthesis) &&
    typeof window.SpeechSynthesisUtterance === 'function'
  if (!supported && buttonElement) {
    buttonElement.disabled = true
    buttonElement.setAttribute('aria-disabled', 'true')
  }

  const savedState = localStorage.getItem('a11y-audio-desc')
  if (savedState === 'true' && supported) toggleState(true)

  registerReset(() => {
    toggleState(false)
  })
  if (runtime.registerRefresh) {
    runtime.registerRefresh(() => {
      if (CURRENT_AUDIO_DESC_STATE) buildPlaylist()
    })
  }
  if (runtime.registerCleanup) {
    runtime.registerCleanup(() => toggleState(false))
  }
}
