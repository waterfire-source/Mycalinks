'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SecondaryButton from '@/components/buttons/SecondaryButton';

type ReceiptIssueModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onIssue: (name: string) => void;
  receiptName: string;
  isReissue?: boolean;
  isIssuing?: boolean;
};

export const ReceiptIssueModal = ({
  isOpen,
  onClose,
  onIssue,
  receiptName,
  isReissue,
  isIssuing = false,
}: ReceiptIssueModalProps) => {
  const handleIssue = () => {
    if (receiptName.trim() && !isIssuing) {
      onIssue(receiptName);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '10px',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          textAlign: 'center',
          fontSize: '1rem !important',
          fontWeight: 'bold',
          py: 1,
          position: 'relative',
        }}
      >
        {isReissue ? '領収書再発行' : '領収書発行'}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'white',
          }}
          disabled={isIssuing}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 3, px: 3 }}>
        <Typography
          variant="body1"
          sx={{
            my: 2,
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          {isReissue
            ? '以下の内容で領収書を再発行します。'
            : '一度発行すると、後で変更することができません。'}
        </Typography>

        <Typography
          sx={{
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          宛名:{receiptName}
        </Typography>
      </DialogContent>

      <DialogActions>
        <Stack
          direction="column"
          spacing={1}
          sx={{ width: '100%', px: 2, pb: 2 }}
        >
          <Button
            onClick={() => handleIssue()}
            variant="contained"
            color="primary"
            sx={{
              borderRadius: '10px',
              py: 1,
            }}
            disabled={!receiptName.trim() || isIssuing}
          >
            {isIssuing ? (
              <CircularProgress size={20} color="inherit" />
            ) : isReissue ? (
              '再発行'
            ) : (
              '発行'
            )}
          </Button>
          <SecondaryButton
            onClick={onClose}
            sx={{
              color: 'white',
              borderRadius: '10px',
              fontSize: '0.875rem !important',
              py: 1,
            }}
            disabled={isIssuing}
          >
            戻る
          </SecondaryButton>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default ReceiptIssueModal;
