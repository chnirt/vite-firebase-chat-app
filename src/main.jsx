import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'

import App from './App'
import { AuthProvider, RemoteConfigProvider, I18nProvider, LoadingProvider } from './context'
// import { ForkMe } from './components'
import { Header } from './components'
import { basename } from './constants'

import './index.less'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RemoteConfigProvider>
      <Header />
      {/* <ForkMe /> */}
      <LoadingProvider>
        <AuthProvider>
          <I18nProvider>
            <Router basename={basename}>
              <App />
            </Router>
          </I18nProvider>
        </AuthProvider>
      </LoadingProvider>
    </RemoteConfigProvider>
  </React.StrictMode>
)
