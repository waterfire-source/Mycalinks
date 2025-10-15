import { Box, IconButton } from '@mui/material';
import { FaCamera, FaTimes } from 'react-icons/fa';
import Image from 'next/image';
import { useRef, useState } from 'react';

interface Props {
  onImageUpload?: (file: File | null) => void;
}

// 画像アップロードエリア
export const ImageUploadArea = ({ onImageUpload }: Props) => {
  const [image, setImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files && files[0]) {
      const url = URL.createObjectURL(files[0]);
      setImage(url);

      if (onImageUpload) {
        onImageUpload(files[0]);
      }
    }
  };

  const handleDeleteImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // 親要素のクリックイベントを防止
    setImage('');
    if (onImageUpload) {
      onImageUpload(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box
      onClick={handleImageClick}
      sx={{
        width: 250,
        height: 250,
        border: '1px dashed grey',
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'grey.100',
      }}
    >
      {image ? (
        <>
          <Image
            src={image}
            alt="アップロード画像"
            fill
            style={{ objectFit: 'cover' }}
          />
          <IconButton
            onClick={handleDeleteImage}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.7)',
              },
            }}
          >
            <FaTimes size={16} color="white" />
          </IconButton>
        </>
      ) : (
        <IconButton color="primary" sx={{ p: 0 }}>
          <FaCamera size={100} color="grey" />
        </IconButton>
      )}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </Box>
  );
};
