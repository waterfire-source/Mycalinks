import React, { useRef, useEffect, useMemo, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Box, CircularProgress, Backdrop } from '@mui/material';
import { useAlert } from '@/contexts/AlertContext';

type BarcodeScannerProps = {
  onBarcodeDetected: (barcode: string) => void;
  detectionCooldown?: number;
};

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onBarcodeDetected,
  detectionCooldown = 5000,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useMemo(() => new BrowserMultiFormatReader(), []);
  const stopVideoStream = useRef<(() => void) | null>(null);
  const { setAlertState } = useAlert();

  const [isBackdropOpen, setIsBackdropOpen] = useState(false);
  const isScanningPausedRef = useRef(false);

  useEffect(() => {
    const startScanning = async () => {
      if (!videoRef.current) return;

      try {
        await codeReader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result, err) => {
            if (err) {
              return;
            }
            if (result && !isScanningPausedRef.current) {
              // スキャンを一時停止
              isScanningPausedRef.current = true;
              setIsBackdropOpen(true);

              setAlertState({
                message: `バーコードが認識されました：${result.getText()}`,
                severity: 'success',
              });

              onBarcodeDetected(result.getText());

              // 指定されたクールダウン時間後にスキャンを再開
              setTimeout(() => {
                isScanningPausedRef.current = false;
                setIsBackdropOpen(false);
              }, detectionCooldown);
            }
          },
        );

        // ストリームを停止する関数を保持
        stopVideoStream.current = () => {
          const stream = videoRef.current?.srcObject as MediaStream;
          if (stream) {
            stream.getTracks().forEach((track) => track.stop());
          }
        };
      } catch (err) {
        console.error('カメラ初期化エラー:', err);
      }
    };

    startScanning();

    return () => {
      // ストリームを停止
      stopVideoStream.current?.();
    };
  }, [codeReader, onBarcodeDetected, detectionCooldown, setAlertState]);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        backgroundColor: 'black',
        overflow: 'hidden',
        height: '100%',
      }}
    >
      {/* カメラプレビュー */}
      <video
        ref={videoRef}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        autoPlay
        muted
        playsInline
      />
      {/* 認識中オーバーレイ */}
      <Backdrop
        open={isBackdropOpen}
        sx={{
          position: 'fixed',
          color: 'gray.200',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      >
        <CircularProgress sx={{ color: 'primary.main' }} />
        <Box mt={2} sx={{ color: 'text.secondary' }}>
          認識中...
        </Box>
      </Backdrop>
    </Box>
  );
};

export default BarcodeScanner;
