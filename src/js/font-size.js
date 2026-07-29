const DEFAULT_FONT_SIZE = 100
const FONT_STEP = 5

let CURRENT_FONT_SIZE_LEVEL = 0

function fontSize(root, initButton, cycleFeature, registerReset) {
  // Hangi etiketlerin boyutu değişmeli? (Layout'u bozmamak için div'i dahil etmiyoruz, sadece metinleri alıyoruz)
  const TEXT_TAGS =
    'h1, h2, h3, h4, h5, h6, p, a, span, li, td, th, blockquote, label, button, input, textarea, cite, caption, small, b, i, strong, em'

  const button = {
    name: 'Yazı Boyutu',
    icon: `<svg class="a11y-card-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z" /></svg>`,
    id: 'fontSizeBtn',
    type: 'cycle',
    cycleOptions: {
      maxLevel: 4, // 4 kademe (Örn: %100, %105, %110, %115, %120)
      currentLevel: 0,
    },
  }

  const handleFontSize = function () {
    CURRENT_FONT_SIZE_LEVEL =
      (CURRENT_FONT_SIZE_LEVEL + 1) % (button.cycleOptions.maxLevel + 1)
    localStorage.setItem('a11y-font-size', CURRENT_FONT_SIZE_LEVEL)

    updatePageFonts(CURRENT_FONT_SIZE_LEVEL)

    // UI güncellemesi
    cycleFeature(button, CURRENT_FONT_SIZE_LEVEL)
  }

  /**
   * Sayfadaki elementleri tarayıp font boyutlarını oranla çarpar.
   */
  function updatePageFonts(level) {
    // Çarpanı hesapla (Örn: Level 0 = 1, Level 1 = 1.05, Level 2 = 1.10)
    const multiplier = 1 + level * (FONT_STEP / 100)

    // Hedeflenen tüm elementleri seç
    const elements = document.querySelectorAll(TEXT_TAGS)

    elements.forEach(el => {
      // 1. Orijinal boyutu daha önce kaydettik mi? Kontrol et.
      if (!el.getAttribute('data-a11y-org-size')) {
        // Kaydetmediysek, tarayıcının hesapladığı (CSS'ten gelen) net piksel değerini al
        const computedStyle = window.getComputedStyle(el)
        const fontSizeStr = computedStyle.fontSize // Örn: "16px" veya "32px"

        // Sadece geçerli bir piksel değeri varsa kaydet
        if (fontSizeStr && fontSizeStr.includes('px')) {
          el.setAttribute('data-a11y-org-size', parseFloat(fontSizeStr))
        } else {
          return // Piksel okuyamazsak atla
        }
      }

      // 2. Orijinal boyutu al
      const originalSize = parseFloat(el.getAttribute('data-a11y-org-size'))

      // 3. Eğer level 0 ise (Reset), inline stili temizle ki site orijinal CSS'ine dönsün
      if (level === 0) {
        el.style.removeProperty('font-size')
      } else {
        // 4. Değilse, yeni boyutu hesapla ve ata
        const newSize = originalSize * multiplier
        el.style.fontSize = `${newSize}px` // !important kullanmaya gerek kalmaz çünkü inline style en baskındır.
      }
    })
  }

  // ÖNCE butonu oluştur
  initButton(button, handleFontSize)

  // SONRA başlangıç kontrolünü yap
  function control() {
    let option = localStorage.getItem('a11y-font-size')
    if (option !== null) {
      CURRENT_FONT_SIZE_LEVEL = parseInt(option)

      // Butonun görsel durumunu güncelle - BU SATIR EKSİKTİ!
      cycleFeature(button, CURRENT_FONT_SIZE_LEVEL)

      // Fontları güncelle
      if (CURRENT_FONT_SIZE_LEVEL > 0) {
        updatePageFonts(CURRENT_FONT_SIZE_LEVEL)
      }
    }
  }

  // DOM tamamen yüklendiğinde çalıştırmak daha güvenlidir
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', control)
  } else {
    control()
  }

  // Reset fonksiyonunu kaydet
  registerReset(() => {
    CURRENT_FONT_SIZE_LEVEL = 0
    updatePageFonts(0)
  })
}
