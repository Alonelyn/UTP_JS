import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles/tokens.css'
import './index.css'
import './styles/devtool.css'
import './styles/loader.css'
import App from './App.jsx'
import { LoaderProvider } from './context/LoaderContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <LoaderProvider>
        <App />
      </LoaderProvider>
    </ThemeProvider>
  </StrictMode>,
)
