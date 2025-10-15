'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Stack, TextField } from '@mui/material';
import { FaBarcode } from 'react-icons/fa';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { useScanner } from '@/hooks/useScanner';

interface Props {
  isShowInputField?: boolean;
  handleScanSearch: (code: string) => Promise<void>;
}

export const ProductScanButton: React.FC<Props> = ({
  isShowInputField = false,
  handleScanSearch,
}) => {
  const [scanCode, setScanCode] = useState<string>('');

  const { isScanning, setIsScanning } = useScanner(async (code) => {
    if (!code) return;
    await handleScanSearch(code);
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const inputScanItemRef = useRef<HTMLInputElement>(null);

  const activateScanMode = () => {
    setIsScanning(true);
    if (inputScanItemRef.current) {
      inputScanItemRef.current.focus();
    }
  };

  const toggleScanMode = () => {
    if (isScanning) {
      setIsScanning(false);
    } else {
      activateScanMode();
    }
  };

  useEffect(() => {
    const handleOutsideInteraction = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsScanning(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideInteraction);
    document.addEventListener('touchstart', handleOutsideInteraction);

    return () => {
      document.removeEventListener('mousedown', handleOutsideInteraction);
      document.removeEventListener('touchstart', handleOutsideInteraction);
    };
  }, [setIsScanning]);

  return (
    // コンテナ全体に ref を付与
    <Stack ref={containerRef} direction="row" gap="16px">
      {isShowInputField && (
        <TextField
          type="number"
          variant="outlined"
          placeholder="商品コード"
          inputRef={inputScanItemRef}
          value={scanCode}
          onChange={(event) => setScanCode(event.target.value)}
          onKeyPress={(event) => {
            if (event.key === 'Enter' && scanCode) {
              handleScanSearch(scanCode);
            }
          }}
        />
      )}

      {isScanning ? (
        <SecondaryButtonWithIcon
          sx={{ height: '40px' }}
          icon={<FaBarcode size={20} />}
          onClick={toggleScanMode}
        >
          スキャン終了
        </SecondaryButtonWithIcon>
      ) : (
        <PrimaryButtonWithIcon
          sx={{ height: '40px' }}
          icon={<FaBarcode size={20} />}
          onClick={toggleScanMode}
        >
          スキャン開始
        </PrimaryButtonWithIcon>
      )}
    </Stack>
  );
};
