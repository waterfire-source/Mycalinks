import {
  Alert as MuiAlert,
  AlertProps as MuiAlertProps,
  Snackbar,
  SnackbarProps,
} from '@mui/material';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  bgColor?: string;
  color?: string;
  duration?: number;
  anchorOrigin?: SnackbarProps['anchorOrigin'];
  severity?: MuiAlertProps['severity'];
};

export const Alert = ({
  isOpen,
  onClose,
  message,
  bgColor = 'primary.main',
  color = 'white',
  duration = 3000,
  anchorOrigin = { vertical: 'top', horizontal: 'center' },
  severity = 'success',
}: Props) => {
  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      onClick={onClose}
      sx={{
        '& .MuiAlert-root': {
          bgcolor: bgColor,
          color: color,
          borderRadius: '10px',
          '& .MuiAlert-message': {
            textAlign: 'left',
            flex: 1,
          },
        },
      }}
    >
      <MuiAlert
        severity={severity}
        icon={false}
        onClose={onClose}
        onClick={onClose}
        sx={{
          '& .MuiAlert-message': {
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.9rem',
            p: 0,
          },
        }}
      >
        {message}
      </MuiAlert>
    </Snackbar>
  );
};
