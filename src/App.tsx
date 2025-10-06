// src/App.tsx
import { useEffect } from 'react'
import { AppLayout } from './features/layout/AppLayout'
import { ErrorBoundary } from './features/layout/ErrorBoundary'
import { ToastContainer } from './lib/components/Toast'
import { useStore } from './lib/store'
import { logger } from './lib/logger'

function App() {
  const checkAPIAvailability = useStore((state) => state.checkAPIAvailability)

  useEffect(() => {
    // Check Chrome AI availability on mount
    checkAPIAvailability()
    logger.info('app.mounted', { 
      timestamp: Date.now(),
      userAgent: navigator.userAgent 
    })

    // Log Chrome AI availability
    if (!window.ai) {
      logger.warn('chrome-ai.unavailable', {
        message: 'Chrome AI APIs not detected. Enable flags in chrome://flags'
      })
    }
  }, [checkAPIAvailability])

  return (
    <ErrorBoundary>
      <AppLayout />
      <ToastContainer />
    </ErrorBoundary>
  )
}

export default App