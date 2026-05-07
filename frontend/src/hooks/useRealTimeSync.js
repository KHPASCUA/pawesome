import { useEffect, useRef, useCallback } from 'react';

/**
 * Real-time synchronization hook for reports
 * Implements polling every 30 seconds with cleanup on unmount
 * 
 * @param {Function} fetchData - Function to fetch data
 * @param {Array} dependencies - Dependencies that should trigger refetch
 * @param {number} interval - Polling interval in milliseconds (default: 30000)
 * @returns {Object} - { startPolling, stopPolling, isPolling }
 */
export const useRealTimeSync = (fetchData, dependencies = [], interval = 30000) => {
  const intervalRef = useRef(null);
  const isPollingRef = useRef(false);
  const dependencyKey = JSON.stringify(dependencies);

  const startPolling = useCallback(() => {
    if (isPollingRef.current) return;

    isPollingRef.current = true;
    
    // Initial fetch
    fetchData();

    // Set up polling
    intervalRef.current = setInterval(() => {
      fetchData();
    }, interval);
  }, [fetchData, interval]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    isPollingRef.current = false;
  }, []);

  // Auto-start when dependencies change
  useEffect(() => {
    startPolling();

    return () => {
      stopPolling();
    };
  }, [dependencyKey, startPolling, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    startPolling,
    stopPolling,
    isPolling: isPollingRef.current,
  };
};
