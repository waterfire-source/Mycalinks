import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  IconButton,
  SxProps,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

type Props = {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onSubmit?: () => void | Promise<void>;
  isCancel?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  sx?: SxProps;
};

export const CommonModal = ({
  children,
  isOpen,
  onClose,
  title,
  onSubmit,
  isCancel = false,
  submitLabel = '保存',
  cancelLabel = 'キャンセル',
  isSubmitting = false,
  sx = {},
}: Props) => {
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
          ...sx,
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
        {title}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'white',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <Stack
          direction="column"
          spacing={2}
          sx={{ width: '100%', px: 2, pb: onSubmit || isCancel ? 2 : 0 }}
        >
          {onSubmit && (
            <Button
              onClick={onSubmit}
              variant="contained"
              color="primary"
              sx={{ borderRadius: '10px' }}
              disabled={isSubmitting}
            >
              {submitLabel}
            </Button>
          )}
          {isCancel && (
            <Button
              onClick={onClose}
              color="inherit"
              sx={{ borderRadius: '10px' }}
              disabled={isSubmitting}
            >
              {cancelLabel}
            </Button>
          )}
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
