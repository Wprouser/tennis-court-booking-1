import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { BookingsProvider } from './context/BookingsContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <BookingsProvider>
        <App />
      </BookingsProvider>
    </BrowserRouter>
  </StrictMode>,
)
