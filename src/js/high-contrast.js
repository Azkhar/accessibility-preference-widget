let CURRENT_HIGH_CONTRAST_LEVEL = 0 // 0 = kapalı, 1 = koyu, 2 = sıcak, 3 = açık, 4 = mavi

function highContrast(root, initButton, cycleFeature, registerReset) {
  const modes = [
    {
      id: 'off',
      name: 'Kapalı',
      bodyClass: '',
      displayName: 'Yüksek Kontrast',
    },
    {
      id: 'dark',
      name: 'Koyu Kontrast',
      bodyClass: 'a11y-contrast-dark',
      displayName: 'Koyu Kontrast',
    },
    {
      id: 'warm',
      name: 'Sıcak Kontrast',
      bodyClass: 'a11y-contrast-warm',
      displayName: 'Sıcak Kontrast',
    },
    {
      id: 'light',
      name: 'Açık Kontrast',
      bodyClass: 'a11y-contrast-light',
      displayName: 'Açık Kontrast',
    },
    {
      id: 'blue',
      name: 'Mavi Kontrast',
      bodyClass: 'a11y-contrast-blue',
      displayName: 'Mavi Kontrast',
    },
  ]

  const button = {
    name: 'Yüksek Kontrast',
    icon: `<svg class="a11y-card-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93s3.05-7.44 7-7.93v15.86zm2-15.86c1.03.13 2 .45 2.87.93H13v-.93zM13 7h5.24c.25.31.48.65.68 1H13V7zm0 3h6.74c.08.33.15.66.19 1H13v-1zm0 9.93V19h2.87c-.87.48-1.84.8-2.87.93zM18.24 17H13v-1h5.92c-.2.35-.43.69-.68 1zm1.5-3H13v-1h6.93c-.04.34-.11.67-.19 1z"/>
          </svg>`,
    id: 'highContrastBtn',
    type: 'cycle',
    cycleOptions: {
      maxLevel: modes.length - 1,
      currentLevel: 0,
    },
  }

  // Tüm kontrast sınıflarını temizle
  function clearContrastClasses() {
    modes.forEach(mode => {
      if (mode.bodyClass) {
        document.body.classList.remove(mode.bodyClass)
      }
    })
  }

  // Buton adını güncelle
  // Buton adını güncelleme fonksiyonu KALDIRILDI
  // Kullanıcı isteği üzerine artık buton adı değişmeyecek (Sadece "Kontrast" kalacak)
  // function updateButtonName(level) { ... }

  // Seviyeyi uygula
  function setHighContrast(level) {
    // Geçerli bir seviye mi kontrol et
    if (isNaN(level) || level < 0 || level >= modes.length) {
      level = 0
    }

    CURRENT_HIGH_CONTRAST_LEVEL = level
    localStorage.setItem('a11y-high-contrast-level', level.toString())

    // Tüm kontrast sınıflarını temizle
    clearContrastClasses()

    // Eğer seviye 0 değilse, ilgili sınıfı ekle
    const mode = modes[level]
    if (mode.bodyClass) {
      document.body.classList.add(mode.bodyClass)
    }

    // UI'ı güncelle
    cycleFeature(button, level)
    // updateButtonName(level) // ARTIK ÇAĞRILMIYOR
  }

  // CSS stillerini ekle
  function ensureContrastStyle() {
    let styleEl = document.getElementById('a11y-high-contrast-style')
    if (!styleEl) {
      styleEl = prepareWidgetStyle(document.createElement('style'))
      styleEl.id = 'a11y-high-contrast-style'
      document.head.appendChild(styleEl)

      styleEl.textContent = `
        /* Invert Colors - Renkleri ters çevir */
        body.a11y-contrast-invert {
          filter: invert(1) hue-rotate(180deg) !important;
        }

        /* ÖNEMLİ DÜZELTME: Widget'ı invert etkisinden hariç tut ve layout bozulmasını önle */
        /* Bu kural, body'ye uygulanan filter'ı widget elemanlarında nötrler. */
        body.a11y-contrast-invert #a11y-widget-trigger,
        body.a11y-contrast-invert #a11y-widget-panel {
          /* Layout sorununu önlemek için yığınlama bağlamı oluşturulur */
          isolation: isolate !important;
          z-index: 9999999 !important;
          /* Filtreyi tamamen kaldır ve manuel renkleri uygula */
          filter: none !important;
          background: #FFFFFF !important;
          border-color: #333333 !important;
          color: #000000 !important;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.5) !important;
        }

        body.a11y-contrast-invert #a11y-widget-panel *,
        body.a11y-contrast-invert #a11y-widget-trigger * {
            color: #000000 !important;
            background-color: transparent !important;
            border-color: #000000 !important;
            filter: none !important;
        }

        /* Resimler ve videolar için invert'i kaldır */
        body.a11y-contrast-invert img,
        body.a11y-contrast-invert video,
        body.a11y-contrast-invert iframe,
        body.a11y-contrast-invert canvas {
          filter: invert(1) hue-rotate(180deg) !important;
        }

        /* 1. 🌑 Koyu Kontrast (Dark Contrast) - Daha yumuşak siyah ve canlı sarı */
        body.a11y-contrast-dark,
        body.a11y-contrast-dark *:not(script):not(style):not(#a11y-widget-trigger):not(#a11y-widget-panel):not(#a11y-widget-panel *) {
          background: #121212 !important; /* Yumuşak Koyu Gri */
          color: #FFFFFF !important; /* Saf Beyaz Metin */
          border-color: #3D3D3D !important;
          box-shadow: none !important;
          background-image: none !important;
        }

        body.a11y-contrast-dark a,
        body.a11y-contrast-dark [href],
        body.a11y-contrast-dark [role="link"] {
          color: #FFEB3B !important; /* Canlı Parlak Sarı */
          text-decoration: underline !important;
          text-decoration-thickness: 2px !important;
          text-underline-offset: 4px !important;
          background-color: transparent !important; /* Arka planı kaldır */
          padding: 0 !important;
          border-radius: 0 !important;
        }

        body.a11y-contrast-dark a:hover {
            color: #FFFFFF !important;
            background-color: #303030 !important;
        }

        body.a11y-contrast-dark button,
        body.a11y-contrast-dark [type="button"],
        body.a11y-contrast-dark [type="submit"],
        body.a11y-contrast-dark [role="button"] {
          background: #3D3D3D !important; /* Koyu Gri Buton Arka planı */
          color: #FFEB3B !important; /* Sarı Metin */
          border: 2px solid #FFEB3B !important;
          font-weight: bold !important;
          text-shadow: none !important;
          border-radius: 4px !important;
        }

        body.a11y-contrast-dark h1,
        body.a11y-contrast-dark h2,
        body.a11y-contrast-dark h3,
        body.a11y-contrast-dark h4,
        body.a11y-contrast-dark h5,
        body.a11y-contrast-dark h6 {
          color: #8C9EFF !important; /* Açık Mavi Başlık */
          text-shadow: none !important;
          border-bottom: 2px solid #3D3D3D !important;
          padding-bottom: 8px !important;
          margin-bottom: 16px !important;
        }

        body.a11y-contrast-dark input,
        body.a11y-contrast-dark select,
        body.a11y-contrast-dark textarea {
          background: #303030 !important;
          color: #FFFFFF !important;
          border: 2px solid #FFEB3B !important; /* Sarı çerçeve */
          border-radius: 4px !important;
        }

        body.a11y-contrast-dark table {
          border: 1px solid #3D3D3D !important;
          width: 100% !important;
        }

        body.a11y-contrast-dark th {
          background: #3D3D3D !important;
          color: #FFFFFF !important;
          border: 1px solid #3D3D3D !important;
        }

        body.a11y-contrast-dark td {
          border: 1px solid #3D3D3D !important;
          padding: 8px !important;
        }

        /* 2. 🔥 Sıcak Kontrast (Warm Contrast) - Daha zengin ve daha az kırmızımsı */
        body.a11y-contrast-warm,
        body.a11y-contrast-warm *:not(script):not(style):not(#a11y-widget-trigger):not(#a11y-widget-panel):not(#a11y-widget-panel *) {
          background: #201A1B !important; /* Koyu Kahverengi/Kızıl */
          color: #F8F4E3 !important; /* Kremsi Beyaz Metin */
          border-color: #C38865 !important; /* Kahverengi vurgu */
        }

        body.a11y-contrast-warm a,
        body.a11y-contrast-warm [href] {
          color: #FFBB77 !important; /* Açık Turuncu Link */
          text-decoration: underline !important;
          background-color: transparent !important;
          padding: 0 !important;
        }

        body.a11y-contrast-warm button {
          background: #C38865 !important;
          color: #201A1B !important;
          border: 2px solid #FFBB77 !important;
          font-weight: bold !important;
          border-radius: 4px !important;
        }

        body.a11y-contrast-warm h1,
        body.a11y-contrast-warm h2,
        body.a11y-contrast-warm h3 {
          color: #FFBB77 !important;
          border-left: 5px solid #C38865 !important;
          padding-left: 10px !important;
        }

        /* 3. ☀️ Açık Kontrast (Light Contrast) - Maksimum siyah-beyaz ve kalın çerçeveler */
        body.a11y-contrast-light,
        body.a11y-contrast-light *:not(script):not(style):not(#a11y-widget-trigger):not(#a11y-widget-panel):not(#a11y-widget-panel *) {
          background: #FFFFFF !important;
          color: #000000 !important;
          border-color: #000000 !important;
          box-shadow: none !important;
        }

        body.a11y-contrast-light a,
        body.a11y-contrast-light [href] {
          color: #0000FF !important; /* Mavi linkler (Standart) */
          text-decoration: underline !important;
          text-decoration-thickness: 3px !important; /* Daha kalın alt çizgi */
          text-underline-offset: 4px !important;
          background-color: transparent !important;
          padding: 0 !important;
        }

        body.a11y-contrast-light a:visited {
          color: #800080 !important; /* Mor ziyaret edilmiş link */
        }

        body.a11y-contrast-light button {
          background: #000000 !important;
          color: #FFFFFF !important;
          border: 3px solid #000000 !important;
          font-weight: bold !important;
          border-radius: 0 !important;
        }

        body.a11y-contrast-light input,
        body.a11y-contrast-light select,
        body.a11y-contrast-light textarea {
          background: #FFFFFF !important;
          color: #000000 !important;
          border: 3px solid #000000 !important;
        }

        body.a11y-contrast-light h1,
        body.a11y-contrast-light h2,
        body.a11y-contrast-light h3 {
          color: #000000 !important;
          border-left: 5px solid #000000 !important;
          padding: 8px 8px 8px 12px !important;
          background-color: #F8F8F8 !important;
          border-radius: 0 !important;
        }

        /* 4. 🟦 Mavi Kontrast (Blue Contrast) - Daha derin mavi ve net sarı */
        body.a11y-contrast-blue,
        body.a11y-contrast-blue *:not(script):not(style):not(#a11y-widget-trigger):not(#a11y-widget-panel):not(#a11y-widget-panel *) {
          background: #00004C !important; /* Derin Lacivert */
          color: #FFFF99 !important; /* Açık Neon Sarı */
          border-color: #4CC4FF !important; /* Açık Mavi Vurgu */
        }

        body.a11y-contrast-blue a,
        body.a11y-contrast-blue [href] {
          color: #4CC4FF !important;
          text-decoration: underline !important;
          background-color: transparent !important;
          padding: 0 !important;
          border-radius: 0 !important;
        }

        body.a11y-contrast-blue button {
          background: #FFFF99 !important;
          color: #00004C !important;
          border: 2px solid #4CC4FF !important;
          font-weight: bold !important;
          text-shadow: none !important;
          border-radius: 4px !important;
        }

        body.a11y-contrast-blue h1,
        body.a11y-contrast-blue h2,
        body.a11y-contrast-blue h3 {
          color: #4CC4FF !important;
          text-shadow: none !important;
          border-bottom: 2px solid #4CC4FF !important;
        }

        body.a11y-contrast-blue input,
        body.a11y-contrast-blue select,
        body.a11y-contrast-blue textarea {
          background: #000066 !important;
          color: #FFFF99 !important;
          border: 2px solid #4CC4FF !important;
        }

        /* Tüm kontrast modları için ortak kurallar (Geliştirildi) */
        body[class*="a11y-contrast-"] .badge,
        body[class*="a11y-contrast-"] .tag,
        body[class*="a11y-contrast-"] .pill {
          font-weight: 700 !important;
          border-width: 2px !important;
          padding: 4px 8px !important;
          border-radius: 50px !important; /* Hap şekli */
        }

        body[class*="a11y-contrast-"] .highlight,
        body[class*="a11y-contrast-"] mark {
          background-color: #FFFF00 !important; /* Evrensel vurgu rengi */
          color: #000000 !important;
          padding: 2px 4px !important;
        }

        body[class*="a11y-contrast-"] code,
        body[class*="a11y-contrast-"] pre {
          background-color: #333333 !important;
          color: #E0E0E0 !important;
          border: 1px solid currentColor !important;
          padding: 10px !important;
          border-radius: 4px !important;
        }

        body[class*="a11y-contrast-"] blockquote {
          border-left: 5px solid currentColor !important;
          padding-left: 15px !important;
          margin-left: 0 !important;
          font-style: italic !important;
          opacity: 0.9 !important;
        }
      `
    }
  }

  // Buton tıklama handler'ı
  const handleHighContrast = function () {
    const nextLevel = (CURRENT_HIGH_CONTRAST_LEVEL + 1) % modes.length
    setHighContrast(nextLevel)
  }
  handleHighContrast.setPreference = level => setHighContrast(Number(level))

  initButton(button, handleHighContrast)
  ensureContrastStyle()

  // Başlangıç kontrolü
  function control() {
    let level = 0

    // Önce yeni anahtarı kontrol et
    const savedLevel = localStorage.getItem('a11y-high-contrast-level')
    if (savedLevel !== null) {
      const parsed = parseInt(savedLevel, 10)
      if (!isNaN(parsed) && parsed >= 0 && parsed < modes.length) {
        level = parsed
      }
    } else {
      // Eski anahtarı kontrol et (boolean)
      const oldValue = localStorage.getItem('a11y-high-contrast')
      if (oldValue !== null) {
        // Eski sistemde true/false idi, true ise koyu moda geç
        level = oldValue === 'true' ? 1 : 0
        // Yeni sisteme geç
        localStorage.removeItem('a11y-high-contrast')
        localStorage.setItem('a11y-high-contrast-level', level.toString())
      }
    }

    CURRENT_HIGH_CONTRAST_LEVEL = level
    setHighContrast(level)
  }

  control()

  // Dil değişimi için global update fonksiyonu KALDIRILDI
  // window.updateHighContrastText = () => { ... }

  // Reset fonksiyonunu kaydet
  registerReset(() => {
    setHighContrast(0)
  })
}
