'use client';

import { useState, useEffect } from 'react';
import { Box, IconButton, Backdrop, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Image from 'next/image';

interface ImageViewerProps {
  images: Array<{
    src: string;
    alt: string;
    description?: string;
  }>;
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
  title?: string;
}

/**
 * 画像ビューアーコンポーネント
 * 全画面オーバーレイで画像を表示し、複数枚の場合はスライドショー機能付き
 */
export const ImageViewer = ({
  images,
  isOpen,
  onClose,
  initialIndex = 0,
}: ImageViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // 初期インデックスが変更された時に更新
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // キーボード操作対応
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, currentIndex]);

  const handleNext = () => {
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }
  };

  const handlePrevious = () => {
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const handleBackdropClick = (event: React.MouseEvent) => {
    // 画像以外の場所をクリックした場合のみ閉じる
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <Backdrop
      open={isOpen}
      onClick={handleBackdropClick}
      sx={{
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        overflow: 'auto',
      }}
    >
      {/* ヘッダー */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 2,
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)',
          zIndex: 10000,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          {images.length > 1 && (
            <Typography variant="body2" color="rgba(255, 255, 255, 0.8)">
              {currentIndex + 1} / {images.length}
            </Typography>
          )}
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: 'white',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* メイン画像 */}
      <Box
        sx={{
          position: 'fixed',
          top: '90px',
          left: 0,
          right: 0,
          height: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Image
            src={currentImage.src}
            alt={currentImage.alt}
            width={800}
            height={800}
            style={{
              width: '100%',
              maxHeight: '60vh',
              objectFit: 'contain',
              borderRadius: 8,
            }}
            priority
          />
        </Box>

        {/* インジケーター（画像のすぐ下） */}
        {images.length > 1 && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 40,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            {images.map((_, index) => (
              <Box
                key={index}
                onClick={() => setCurrentIndex(index)}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor:
                    index === currentIndex
                      ? 'white'
                      : 'rgba(255, 255, 255, 0.4)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'white',
                    transform: 'scale(1.2)',
                  },
                }}
              />
            ))}
          </Box>
        )}

        {/* 前の画像ボタン */}
        {images.length > 1 && (
          <IconButton
            onClick={handlePrevious}
            sx={{
              position: 'absolute',
              left: { xs: 10, md: -60 },
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              },
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <ArrowBackIosIcon />
          </IconButton>
        )}

        {/* 次の画像ボタン */}
        {images.length > 1 && (
          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              right: { xs: 10, md: -60 },
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              },
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        )}
      </Box>

      {/* タイトル・説明文エリア */}
      {currentImage.description && (
        <Box
          sx={{
            position: 'fixed',
            bottom: '190px',
            left: '50%',
            transform: 'translateX(-50%) translateY(100%)',
            display: 'flex',
            justifyContent: 'center',
            px: 2,
            width: '100%',
            minWidth: '100%',
            height: '120px',
            overflow: 'scroll',
          }}
        >
          <Box
            sx={{
              color: 'white',
              px: 3,
              py: 2,
              maxWidth: '100%',
              minWidth: '100%',
              textAlign: 'center',
              backdropFilter: 'blur(8px)',
            }}
          >
            {currentImage.description && (
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.9,
                  lineHeight: 1.5,
                  fontSize: { xs: '0.875rem', md: '1rem' },
                }}
              >
                {currentImage.description}
              </Typography>
            )}
          </Box>
        </Box>
      )}
    </Backdrop>
  );
};
