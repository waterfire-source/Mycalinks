import PrimaryButton from '@/components/buttons/PrimaryButton';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

type CannotDeleteGenreDialogProps = {
  open: boolean;
  onClose: () => void;
};

export const CannotDeleteGenreDialog = ({
  open,
  onClose,
}: CannotDeleteGenreDialogProps) => {
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
          padding: '16px 24px',
        }}
      >
        <Typography variant="h3" color="#b82a2a" fontWeight="bold">
          登録されている在庫があります
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
      <DialogContent sx={{ p: 3, pt: 3 }}>
        <Typography variant="body1">
          Mycalinksから登録されたジャンルは削除できません。不要な場合は非表示に設定することができます。
        </Typography>
      </DialogContent>
      <DialogActions
        sx={{
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <PrimaryButton
          variant="contained"
          color="primary"
          onClick={onClose}
          sx={{
            padding: '3px 30px',
            fontSize: '12px',
            bgcolor: '#b82a2a',
            '&:hover': {
              bgcolor: '#9c2323',
            },
          }}
        >
          理解した
        </PrimaryButton>
      </DialogActions>
    </Dialog>
  );
};
