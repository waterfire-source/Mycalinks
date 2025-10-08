import React from 'react';

import PrimaryButton from '@/components/buttons/PrimaryButton';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

type ConfirmationDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  memo: string;
  setMemo: React.Dispatch<React.SetStateAction<string>>;
  isLoading?: boolean;
};

// ConfirmationDialogと似たようなreturnだが、デザイン(主にpadding)の都合で別途作成（2025/05/20）
export const CustomerMemoModal = ({
  open,
  onClose,
  onConfirm,
  memo,
  setMemo,
  isLoading = false,
}: ConfirmationDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: '8px',
          overflow: 'visible',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px 0 24px',
        }}
      >
        <Typography variant="h3" color="#b82a2a" fontWeight="bold">
          顧客メモ
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="body1">メモ</Typography>
        <TextField
          fullWidth
          multiline
          minRows={5}
          maxRows={Infinity}
          sx={{ flex: 1 }}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </DialogContent>
      <DialogActions
        sx={{
          padding: '0px 24px 16px 24px',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Button variant="text" onClick={onClose} sx={{ color: '#b82a2a' }}>
          閉じる
        </Button>
        <PrimaryButton
          variant="contained"
          color="primary"
          onClick={onConfirm}
          sx={{
            padding: '3px 30px',
            fontSize: '12px',
            bgcolor: '#b82a2a',
            '&:hover': {
              bgcolor: '#9c2323',
            },
          }}
          loading={isLoading}
        >
          保存
        </PrimaryButton>
      </DialogActions>
    </Dialog>
  );
};
