import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/theme.css';
import './styles/dashboard.css';
import './styles/sidebar.css';
import './styles/table.css';
import './styles/modal.css';
import './styles/animation.css';
import './styles/responsive.css';
import App from './App'; // ✅ corrected path
import reportWebVitals from './reportWebVitals'; // ✅ corrected path

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();