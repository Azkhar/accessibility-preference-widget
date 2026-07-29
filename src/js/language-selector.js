/**
 * Erişilebilirlik Dil Seçici Modülü
 */

function languageSelector(root) {
  // i18n helper
  const tr = key => (window.a11yI18n ? window.a11yI18n.t(key) : key)

  const container = root.querySelector('.a11y-menu-content') // Insert top of menu content not specific container
  // Or create specific container? init.js creates structure.
  // We need a specific root for this. init.js should provide it or we insert into main grid.
  // Best: Create a container inside 'a11y-grid' or just prepend to it.

  // Let's assume we prepend to a11y-grid or a dedicated slot.
  // For now, let's target specific ID created in init.js or create it here.

  let langRoot = root.getElementById('a11y-lang-root')
  if (!langRoot) {
    // Create if missing (inserted before profiles)
    langRoot = document.createElement('div')
    langRoot.id = 'a11y-lang-root'
    langRoot.className = 'a11y-lang-selector-root'

    const profilesRoot = root.getElementById('a11y-profiles-root')
    if (profilesRoot) {
      profilesRoot.parentNode.insertBefore(langRoot, profilesRoot)
    } else {
      // Fallback
      const grid = root.querySelector('.a11y-grid')
      if (grid) grid.prepend(langRoot)
    }
  }

  // Initial Render
  renderLanguageSelector(langRoot, root)

  // Register global updater
  window.updateLanguageSelectorUI = () => {
    // Re-render or just update active state?
    // Re-render is safer for text updates "Select Language"
    // But we lose open state.
    // Better: Update texts and active class.
    updateLanguageSelectorState(langRoot)
  }
}

function renderLanguageSelector(container, root) {
  // i18n
  const tr = key => (window.a11yI18n ? window.a11yI18n.t(key) : key)
  const headerTitle = tr('languageHeader')
  const searchPlaceholder = tr('searchLanguage')
  const languages = window.a11yI18n.getLanguages()
  const currentLang = window.a11yI18n.getCurrentLang()

  // HTML Structure
  container.innerHTML = `
        <div class="a11y-lang-header" id="a11y-lang-toggle">
            <div style="display: flex; align-items: center; gap: 8px;">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/></svg>
                <span id="a11y-lang-title">${headerTitle}</span>
            </div>
            <svg viewBox="0 0 24 24" width="24" height="24" style="transition: transform 0.3s; transform: rotate(-90deg);"><path d="M7 10l5 5 5-5z"/></svg>
        </div>
        <div class="a11y-lang-content" id="a11y-lang-content">
            <div class="a11y-lang-search">
                <input type="text" id="a11y-lang-filter" placeholder="${searchPlaceholder}" aria-label="${searchPlaceholder}">
            </div>
            <div class="a11y-lang-grid" id="a11y-lang-list">
                ${generateLangButtons(languages, currentLang)}
            </div>
        </div>
    `

  // Logic
  const toggle = container.querySelector('#a11y-lang-toggle')
  const content = container.querySelector('#a11y-lang-content')
  const arrow = toggle.querySelector('svg')
  const filterInput = container.querySelector('#a11y-lang-filter')
  const langList = container.querySelector('#a11y-lang-list')

  let isOpen = false

  toggle.addEventListener('click', () => {
    isOpen = !isOpen
    if (isOpen) {
      content.style.maxHeight = '600px'
      arrow.style.transform = 'rotate(180deg)'
    } else {
      content.style.maxHeight = '0'
      arrow.style.transform = 'rotate(0deg)'
    }
  })

  // Search Listener
  filterInput.addEventListener('input', e => {
    const query = e.target.value.toLowerCase()
    const btns = langList.querySelectorAll('.a11y-lang-btn')
    btns.forEach(btn => {
      const name = btn.textContent.toLowerCase() // Includes flag but ok
      if (name.includes(query)) {
        btn.style.display = 'flex'
      } else {
        btn.style.display = 'none'
      }
    })
  })

  // Click Listeners (Delegation)
  langList.addEventListener('click', e => {
    const btn = e.target.closest('.a11y-lang-btn')
    if (!btn) return

    const code = btn.getAttribute('data-lang')
    window.a11yI18n.setLanguage(code, root)

    // Auto Close? User Request: "direkt seçmeli olsun" implies selection -> action.
    // Maybe close after selection to show result?
    // Let's keep it consistent.
    // isOpen = false
    // content.style.maxHeight = '0'
    // arrow.style.transform = 'rotate(0deg)'
  })
}

function generateLangButtons(languages, currentLang) {
  return languages
    .map(lang => {
      const activeClass = lang.code === currentLang ? 'active' : ''
      return `
            <button class="a11y-lang-btn ${activeClass}" data-lang="${lang.code}">
                <div class="a11y-lang-flag">${lang.flag}</div>
                <div class="a11y-lang-name">${lang.name}</div>
            </button>
        `
    })
    .join('')
}

function updateLanguageSelectorState(container) {
  // i18n
  const tr = key => (window.a11yI18n ? window.a11yI18n.t(key) : key)

  if (!container) return

  // Update active class
  const currentLang = window.a11yI18n.getCurrentLang()
  const btns = container.querySelectorAll('.a11y-lang-btn')
  btns.forEach(btn => {
    if (btn.getAttribute('data-lang') === currentLang) {
      btn.classList.add('active')
    } else {
      btn.classList.remove('active')
    }
  })

  // Update Texts
  const title = container.querySelector('#a11y-lang-title')
  if (title) title.innerText = tr('languageHeader')

  const input = container.querySelector('#a11y-lang-filter')
  if (input) {
    input.placeholder = tr('searchLanguage')
    input.setAttribute('aria-label', tr('searchLanguage'))
  }
}
