import React from 'react';
import { Modal, Box, Typography, IconButton } from '@mui/material';
import Image from 'next/image';
import CloseIcon from '@mui/icons-material/Close';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmButtonText: string;
  cancelButtonText: string;
}

// 警告画像付きアラートモーダル
const AlertConfirmationModal: React.FC<Props> = ({
  isOpen, // モーダルの開閉状態
  onClose, // モーダルの閉じるハンドラ
  onConfirm, // 確認ボタンのハンドラ
  title, // モーダルのタイトル
  message, // モーダルのメッセージ
  confirmButtonText, // 確認ボタンのテキスト
  cancelButtonText, // キャンセルボタンのテキスト
}) => {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            padding: '10px',
            backgroundColor: 'grey.700',
            borderRadius: '4px 4px 0 0',
            position: 'relative',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: 'common.white',
              width: '100%',
              textAlign: 'center',
            }}
          >
            {title}
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              color: 'common.white',
              position: 'absolute',
              right: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Image
            src="/images/dangerous_icon.png"
            alt="Dangerous icon"
            width={110}
            height={110}
          />
          <Typography variant="h6" component="h2" sx={{ mt: 2, mb: 4 }}>
            {message}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
            <SecondaryButton
              variant="contained"
              onClick={onClose}
              sx={{ bgcolor: 'grey.500', color: 'white', width: 150 }}
            >
              {cancelButtonText}
            </SecondaryButton>
            <PrimaryButton
              variant="contained"
              color="error"
              onClick={onConfirm}
              sx={{ width: 150 }}
            >
              {confirmButtonText}
            </PrimaryButton>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default AlertConfirmationModal;
