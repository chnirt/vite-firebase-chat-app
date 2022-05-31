import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'

import App from './App'
import { AuthProvider } from './context'
import { ForkMe, Loading } from './components'

import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ForkMe />
    <AuthProvider>
      <Suspense fallback={<Loading />}>
        <Router>
          <App />
        </Router>
      </Suspense>
    </AuthProvider>
  </React.StrictMode>
)
