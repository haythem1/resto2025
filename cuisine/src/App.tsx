import React, { Suspense, lazy, useState } from 'react'
import ErrorBoundary from './ErrorBoundary'
import ServerConfig from './components/ServerConfig'

const KitchenView = lazy(() => import('./components/KitchenView'))

export default function App() {
  const [serverUrl, setServerUrl] = useState(() => {
    try {
         const stored = localStorage.getItem('kitchenServerUrl')


const API_BASE=`${stored}:3000`

      return API_BASE
    } catch {
      return 'http://localhost:3000'
    }
  })

  return (
    <ErrorBoundary>
      <div className="app-root">
        <header className="app-header">
          <h1>🍳 Cuisine - Commandes à préparer</h1>
        </header>
        <main className="app-main">
          <ServerConfig onServerUrlChange={setServerUrl} />
            <KitchenView />
        </main>
      </div>
    </ErrorBoundary>
  )
}
