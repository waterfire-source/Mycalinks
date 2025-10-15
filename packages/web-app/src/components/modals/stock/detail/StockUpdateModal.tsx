import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button } from '@mui/material';
import Image from 'next/image';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { FaTimes } from 'react-icons/fa';

// Propsのインターフェースを定義
interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, cost?: number) => void;
  isStockAdd: boolean; // 仕入れ値を入力するかどうか（在庫数が増える場合）
}

// StockUpdateModalコンポーネントの定義
export const StockUpdateModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  isStockAdd,
}) => {
  const [cost, setCost] = useState<number>(0); // 仕入れ値の状態
  const [reason, setReason] = useState<string>(''); // 理由の状態
  const [reasonError, setReasonError] = useState<boolean>(false); // 理由のエラー状態

  // モーダルが閉じられたときに状態をリセット
  useEffect(() => {
    if (!isOpen) {
      setCost(0);
      setReason('');
    }
  }, [isOpen]);

  // 確認ボタンが押されたときの処理
  const handleConfirm = () => {
    if (reason.trim() === '') {
      setReasonError(true); // 理由が空の場合、エラーを設定
      return;
    }
    onConfirm(reason, isStockAdd ? cost : undefined); // 確認処理を呼び出す
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          maxWidth: 600,
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 2,
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px',
            backgroundColor: 'grey.700',
            borderRadius: '4px 4px 0 0',
            color: 'text.secondary',
            position: 'relative',
            height: '60px',
            width: '100%',
          }}
        >
          <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
            <Typography variant="h6" color="common.white">
              在庫数が変更されています
            </Typography>
          </Box>
          <Button
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: '10px',
              color: 'common.white',
              minWidth: 'auto',
            }}
          >
            <FaTimes size={20} />
          </Button>
        </Box>
        <Box sx={{ pt: 2 }}>
          <Image
            src="/images/dangerous_icon.png"
            alt="Dangerous icon"
            width={80}
            height={80}
          />
          <Typography variant="body1" sx={{ pt: 2 }}>
            在庫数が変更されています。
            <br />
            在庫変更理由を記載してください。
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            width: '100%', // Ensuring the same width
            padding: '0 30px 30px 30px',
          }}
        >
          {isStockAdd && (
            <Box sx={{ width: '100%' }}>
              <Typography sx={{ mb: 1, textAlign: 'left' }}>
                仕入れ値
              </Typography>
              <NumericTextField
                value={cost}
                onChange={(value) => setCost(value ?? 0)}
                sx={{ width: '100%' }}
                suffix="円"
              />
            </Box>
          )}
          <Box sx={{ width: '100%' }}>
            <Typography sx={{ mb: 1, textAlign: 'left' }}>理由</Typography>
            <TextField
              sx={{ width: '100%' }}
              name="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="変更理由を入力してください"
              multiline
              rows={5}
              error={reasonError}
              helperText={reasonError ? '理由は必須です' : ''}
            />
          </Box>
          <PrimaryButton
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleConfirm}
          >
            変更
          </PrimaryButton>
          <SecondaryButton fullWidth onClick={onClose}>
            キャンセル
          </SecondaryButton>
        </Box>
      </Box>
    </Modal>
  );
};
