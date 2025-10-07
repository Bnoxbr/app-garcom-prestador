import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
// GARANTIR que estamos a importar do ficheiro correto: 'hooks/useAuth'
import { AuthProvider } from './contexts/AuthContext'; 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* O AuthProvider deve envolver toda a aplicação (App) */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);