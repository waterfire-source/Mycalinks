import { useEffect, useRef, useState } from 'react';

export const useScanner = (onScan: (code: string) => void) => {
  const [isScanning, setIsScanning] = useState(false);
  const inputBuffer = useRef('');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isScanning) return;

      // 特殊キーは無視
      if (event.key.length !== 1) {
        if (event.key !== 'Enter') return;
      }

      // イベントの伝播を止める
      event.preventDefault();
      event.stopPropagation();

      if (event.key === 'Enter') {
        onScan(inputBuffer.current);
        inputBuffer.current = '';
      } else {
        inputBuffer.current += event.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isScanning, onScan]);

  return { isScanning, setIsScanning, inputBuffer };
};
