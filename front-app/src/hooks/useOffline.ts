'use client';

import { useState, useEffect } from 'react';

export function useOffline() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsOffline(!navigator.onLine);
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return { isOffline };
}
