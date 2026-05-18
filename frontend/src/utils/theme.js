import React from "react";

// ===== CENTRALIZED THEME MANAGEMENT ===== //

// Apply theme to the document
export const applyTheme = (theme) => {
  const normalizedTheme = theme === "dark" ? "dark" : "light";
  const root = document.documentElement;

  // Clean up any existing dark mode classes
  document.body.classList.remove("dark", "dark-mode", "dark-theme", "night-mode");
  document.documentElement.classList.remove("dark", "dark-mode", "dark-theme", "night-mode");
  document.body.removeAttribute("data-theme");

  root.setAttribute("data-theme", normalizedTheme);
  localStorage.setItem("theme", normalizedTheme);
};

// Get current theme from localStorage or default to light
export const getCurrentTheme = () => {
  return localStorage.getItem("theme") || "light";
};

// Toggle theme between light and dark
export const toggleTheme = () => {
  const currentTheme = getCurrentTheme();
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  applyTheme(newTheme);
  return newTheme;
};

// Initialize theme on app load
export const initializeTheme = () => {
  const savedTheme = getCurrentTheme();
  applyTheme(savedTheme);
  return savedTheme;
};

// Hook for React components to use theme
export const useTheme = () => {
  const [theme, setTheme] = React.useState(getCurrentTheme());

  React.useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  React.useEffect(() => {
    // Listen for storage changes (for cross-tab sync)
    const handleStorageChange = (e) => {
      if (e.key === "theme") {
        const newTheme = e.newValue || "light";
        applyTheme(newTheme);
        setTheme(newTheme);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const toggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    return newTheme;
  };

  const updateTheme = (nextTheme) => {
    const normalizedTheme = nextTheme === "dark" ? "dark" : "light";
    setTheme(normalizedTheme);
    return normalizedTheme;
  };

  return {
    theme,
    isDark: theme === "dark",
    isLight: theme === "light",
    toggle,
    setTheme: updateTheme,
  };
};
