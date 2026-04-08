import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0f1e3d',
            color: '#e2e8f0',
            border: '1px solid rgba(59,130,246,0.3)',
            fontFamily: 'DM Sans, sans-serif',
          },
          success: { iconTheme: { primary: '#3b82f6', secondary: '#0f1e3d' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#0f1e3d' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)