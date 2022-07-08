import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'

import App from './App'
import { AuthProvider, RemoteConfigProvider, I18nProvider } from './context'
// import { ForkMe } from './components'
import { basename } from './constants'

import './index.less'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RemoteConfigProvider>
      {/* <ForkMe /> */}
      <AuthProvider>
        <Router basename={basename}>
          <I18nProvider>
            <App />
          </I18nProvider>
        </Router>
      </AuthProvider>
    </RemoteConfigProvider>
  </React.StrictMode>
)
