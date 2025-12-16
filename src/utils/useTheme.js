const THEME_KEY = 'app-theme' // stores "light", "dark", "auto"

function resolveTheme(preference) {
  if (preference === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
  return preference || 'light'
}

export function applyTheme(preference) {
  const resolved = resolveTheme(preference)

  document.documentElement.setAttribute('data-bs-theme', resolved)
  document.body.setAttribute('data-bs-theme', resolved)

  // store the *preference* ("light" / "dark" / "auto")
  localStorage.setItem(THEME_KEY, preference || 'auto')
}

export function initTheme() {
  const stored = localStorage.getItem(THEME_KEY) || 'light' // default
  applyTheme(stored)
}

export function getStoredTheme() {
  return localStorage.getItem(THEME_KEY) || 'light'
}