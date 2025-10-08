import { useState } from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrimaryButton from '@/components/buttons/PrimaryButton';

interface CustomInputDialogProps {
  open: boolean;
  onClose: () => void;
  onAddCustomName: (name: string) => void;
  title?: string;
  inputLabel?: string;
  placeholder?: string;
  buttonText?: string;
}

export const CustomInputDialog = ({
  open,
  onClose,
  onAddCustomName,
  title,
  inputLabel,
  placeholder,
  buttonText,
}: CustomInputDialogProps) => {
  const [customName, setCustomName] = useState('');

  const handleClose = () => {
    setCustomName('');
    onClose();
  };

  const handleAddCustomName = () => {
    if (customName.trim()) {
      onAddCustomName(customName);
      handleClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
          padding: '16px 24px',
        }}
      >
        <Typography variant="h3" color="#b82a2a" fontWeight="bold">
          {title}
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3, pt: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          {inputLabel}
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          placeholder={placeholder}
        />
      </DialogContent>
      <DialogActions
        sx={{
          padding: '16px 24px',
          display: 'flex',
          textAlign: 'right',
        }}
      >
        <Button variant="text" onClick={handleClose} sx={{ color: '#b82a2a' }}>
          キャンセル
        </Button>
        <PrimaryButton
          variant="contained"
          color={'primary'}
          onClick={handleAddCustomName}
          sx={{
            padding: '3px 30px',
            fontSize: '12px',
          }}
        >
          {buttonText}
        </PrimaryButton>
      </DialogActions>
    </Dialog>
  );
};
