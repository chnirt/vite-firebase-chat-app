import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'

import App from './App'
import { AuthProvider, RemoteConfigProvider } from './context'
// import { ForkMe } from './components'
import { basename } from './constants'

import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RemoteConfigProvider>
      {/* <ForkMe /> */}
      <AuthProvider>
        <Router basename={basename}>
          <App />
        </Router>
      </AuthProvider>
    </RemoteConfigProvider>
  </React.StrictMode>
)
