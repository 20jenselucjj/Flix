import { registerSW } from 'virtual:pwa-register'

export function initPWA() {
  const updateSW = registerSW({
    onNeedRefresh() {
      // Prompt user to refresh
      if (confirm('New content available. Reload?')) {
        updateSW(true)
      }
    },
    onOfflineReady() {
      console.log('App is ready to work offline')
    },
    onRegisterError(error) {
      // Ignore InvalidStateError which happens in some restricted environments (like Trae preview)
      if (error?.name === 'InvalidStateError') {
        // Silently ignore or log a warning
        // console.warn('PWA registration skipped in restricted environment')
        return
      }
      console.error('SW registration error', error)
    }
  })
}
