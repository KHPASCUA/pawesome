import { useState, useCallback } from "react";

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, title, message, duration = 4000) => {
    const id = Date.now();
    const newToast = { id, type, title, message, duration };
    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((title, message, duration) => {
    return addToast("success", title, message, duration);
  }, [addToast]);

  const error = useCallback((title, message, duration) => {
    return addToast("error", title, message, duration);
  }, [addToast]);

  const warning = useCallback((title, message, duration) => {
    return addToast("warning", title, message, duration);
  }, [addToast]);

  const info = useCallback((title, message, duration) => {
    return addToast("info", title, message, duration);
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
};
