import React from "react";
import "./App.css"; // Import global CSS fixes
import "./styles/dashboardGlobal.css"; // Import global dashboard theme
import AppRoutes from "./routes/AppRoutes"; // ✅ direct path to AppRoutes.jsx

function App() {
  return <AppRoutes />;
}

export default App;