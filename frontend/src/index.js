import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import './index.css';
import './styles/theme.css';
import './styles/dashboard.css';
import './styles/sidebar.css';
import './styles/table.css';
import './styles/modal.css';
import './styles/animation.css';
import './styles/responsive.css';
import './styles/globalTheme.css';
import App from './App'; // 
import reportWebVitals from './reportWebVitals'; // 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
    <Toaster position="top-right" />
  </React.StrictMode>
);

reportWebVitals();