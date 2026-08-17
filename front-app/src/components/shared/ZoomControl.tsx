'use client';

import React, { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import styles from './ZoomControl.module.css';

export function ZoomControl() {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    // Ajusta o font-size do html, o que escala todos os rems da aplicação
    document.documentElement.style.fontSize = `${16 * zoom}px`;
  }, [zoom]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.8));

  return (
    <div className={styles.container}>
      <button onClick={handleZoomIn} className={styles.button} aria-label="Aumentar zoom" title="Aumentar zoom">
        <ZoomIn size={24} strokeWidth={2.5} />
      </button>
      <div className={styles.divider} />
      <button onClick={handleZoomOut} className={styles.button} aria-label="Diminuir zoom" title="Diminuir zoom">
        <ZoomOut size={24} strokeWidth={2.5} />
      </button>
    </div>
  );
}
