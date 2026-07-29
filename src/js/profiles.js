/**
 * Erişilebilirlik Profilleri Modülü
 */

const PROFILES = [
  {
    id: 'color-blind',
    icon: `<svg viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>`,
    actions: { highContrast: true },
  },
  {
    id: 'dyslexia',
    icon: `<svg viewBox="0 0 24 24"><path d="M9 11l3-3 3 3M12 8v6" stroke="currentColor" stroke-width="2" fill="none"/><text x="12" y="22" font-size="10" text-anchor="middle" font-weight="bold" fill="currentColor">Df</text></svg>`,
    actions: { fontFamily: 2, letterSpacing: 2 },
  },
  {
    id: 'vision-impaired',
    icon: `<svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" /></svg>`,
    actions: { fontSize: 2, highContrast: true, largeCursor: true },
  },
  {
    id: 'cognitive-disability',
    icon: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 6C13.66 6 15 7.34 15 9C15 10.66 13.66 12 12 12C10.34 12 9 10.66 9 9C9 7.34 10.34 6 12 6ZM12 20C9.33 20 7 18 7 15.5V15H17V15.5C17 18 14.67 20 12 20Z" /></svg>`,
    actions: {
      highlightLinks: true,
      readingGuide: true,
      highlightTitles: true,
    },
  },
  {
    id: 'seizure-safe',
    icon: `<svg viewBox="0 0 24 24"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" /></svg>`,
    actions: { pauseAnimations: true, monochrome: true },
  },
  {
    id: 'adhd-friendly',
    icon: `<svg viewBox="0 0 24 24"><path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM17 17H7V15H17V17ZM17 13H7V11H17V13ZM17 9H7V7H17V9Z" /></svg>`,
    actions: { readingGuide: 2, focusIndicator: true },
  },
]

let ACTIVE_PROFILES = {}

function profiles(root, moduleMethods, registerReset, runtime = {}) {
  // i18n helper (Scope safe)
  const tr = key => (window.a11yI18n ? window.a11yI18n.t(key) : key)

  const container = root.getElementById('a11y-profiles-root')
  if (!container) return

  // Header Ekle (Collapsible Control ile)
  // Leading Icon Eklendi
  const headerHtml = `
    <button
      type="button"
      class="a11y-profiles-header"
      aria-expanded="false"
      aria-controls="a11y-profiles-content"
    >
        <span class="a11y-disclosure-label">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
            <span>${tr('profilesHeader')}</span>
        </span>
        <svg class="a11y-profiles-toggle-icon" viewBox="0 0 24 24" width="24" height="24" style="transition: transform 0.3s; transform: rotate(-90deg);"><path d="M7 10l5 5 5-5z"/></svg>
    </button>`

  // Profil Grid Container
  // Default kapalı (isOpen=false)
  const listHtml = `
    <div class="a11y-profiles-wrapper">
        ${headerHtml}
        <div
          class="a11y-profiles-content"
          id="a11y-profiles-content"
          hidden
        >
            <div class="a11y-profiles-grid"></div>
        </div>
    </div>
  `
  container.innerHTML = listHtml

  const headerEl = container.querySelector('.a11y-profiles-header')
  const contentEl = container.querySelector('.a11y-profiles-content')
  const toggleIcon = container.querySelector('.a11y-profiles-toggle-icon')

  let isOpen = false
  const handleHeaderClick = () => {
    isOpen = !isOpen
    headerEl.setAttribute('aria-expanded', String(isOpen))
    contentEl.hidden = !isOpen
    toggleIcon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(-90deg)'
  }
  headerEl.addEventListener('click', handleHeaderClick)

  const grid = container.querySelector('.a11y-profiles-grid')

  PROFILES.forEach(profile => {
    // HTML Oluştur (Brutalist Button Yapısı - Custom Class)
    const profileCard = document.createElement('button')
    profileCard.type = 'button'
    profileCard.className = 'a11y-profile-card'
    profileCard.id = `profile-${profile.id}`
    profileCard.setAttribute('aria-pressed', 'false')
    // Style handled in CSS now

    // Icon + Title
    profileCard.innerHTML = `
      <div class="a11y-profile-icon">${profile.icon}</div>
      <div class="a11y-profile-title">
        <span>${tr(profile.id)}</span>
      </div>
    `

    // Event Listener (Tüm kart tıklanabilir)
    profileCard.addEventListener('click', () => {
      toggleProfile(profile.id, root, moduleMethods)
    })

    grid.appendChild(profileCard)
  })

  // Başlangıç durumunu yükle
  loadState(root)

  // Reset logic
  registerReset(() => {
    ACTIVE_PROFILES = {}
    const allCards = container.querySelectorAll('.a11y-profile-card')
    allCards.forEach(card => {
      card.classList.remove('active')
      card.setAttribute('aria-pressed', 'false')
    })
    localStorage.removeItem('a11y-active-profiles')
  })

  if (runtime.registerCleanup) {
    runtime.registerCleanup(() => {
      headerEl.removeEventListener('click', handleHeaderClick)
    })
  }
}

function toggleProfile(profileId, root, moduleMethods) {
  const profile = PROFILES.find(p => p.id === profileId)
  if (!profile) return

  const isActive = !!ACTIVE_PROFILES[profileId]
  const newState = !isActive

  ACTIVE_PROFILES[profileId] = newState
  if (!newState) delete ACTIVE_PROFILES[profileId]

  updateProfileUI(profileId, newState, root)
  applyProfileActions(profile, newState, root, moduleMethods)
  saveState()
}

function updateProfileUI(profileId, isActive, root) {
  const profileCard = root.getElementById(`profile-${profileId}`)
  if (!profileCard) return

  profileCard.classList.toggle('active', isActive)
  profileCard.setAttribute('aria-pressed', isActive ? 'true' : 'false')
}

// Çevirileri güncelleyen fonksiyon
window.updateProfileTexts = function (root) {
  // i18n helper (Fix ReferenceError)
  const tr = key => (window.a11yI18n ? window.a11yI18n.t(key) : key)

  const grid = root.querySelector('.a11y-profiles-grid')
  if (!grid) return

  const headerSpan = root.querySelector('.a11y-profiles-header span')
  if (headerSpan) headerSpan.innerText = tr('profilesHeader')

  PROFILES.forEach(profile => {
    const card = root.getElementById(`profile-${profile.id}`)
    if (card) {
      const span = card.querySelector('.a11y-profile-title span')
      if (span) span.innerText = tr(profile.id)
    }
  })
}

/**
 * Akıllı Profil Uygulayıcı
 * Modülün mevcut durumunu kontrol ederek hedef duruma getirir.
 */
function applyProfileActions(profile, isActive, root, moduleMethods) {
  const actions = profile.actions

  Object.keys(actions).forEach(actionKey => {
    const actionValue = actions[actionKey] // true or number (level)

    // Action Key -> Button ID Mapping
    const buttonMap = {
      fontSize: 'fontSizeBtn',
      highContrast: 'highContrastBtn',
      pauseAnimations: 'pauseAnimationsBtn',
      monochrome: 'monochromeBtn',
      readingGuide: 'readingGuideBtn',
      focusIndicator: 'focusIndicatorBtn',
      highlightLinks: 'highlightLinksBtn',
      highlightTitles: 'highlightTitlesBtn',
      largeCursor: 'largeCursorBtn',
      fontFamily: 'fontFamilyBtn',
      letterSpacing: 'letterSpacingBtn',
      hideImages: 'hideImagesBtn',
      lineHeight: 'lineHeightBtn',
    }

    const btnId = buttonMap[actionKey]
    const handler = moduleMethods[btnId]

    if (!handler) return

    const targetLevel = isActive
      ? typeof actionValue === 'number'
        ? actionValue
        : 1
      : 0

    if (typeof handler.setPreference === 'function') {
      handler.setPreference(
        typeof actionValue === 'number' ? targetLevel : targetLevel > 0,
      )
    }
  })
}

function saveState() {
  localStorage.setItem('a11y-active-profiles', JSON.stringify(ACTIVE_PROFILES))
}

function loadState(root) {
  try {
    const saved = localStorage.getItem('a11y-active-profiles')
    if (saved) {
      ACTIVE_PROFILES = JSON.parse(saved)
      Object.keys(ACTIVE_PROFILES).forEach(id => {
        if (ACTIVE_PROFILES[id]) {
          updateProfileUI(id, true, root)
        }
      })
    }
  } catch {
    ACTIVE_PROFILES = {}
  }
}
