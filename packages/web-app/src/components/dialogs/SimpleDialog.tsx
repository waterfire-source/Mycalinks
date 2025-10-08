import { Dialog, DialogContent, IconButton } from '@mui/material';
import { ReactNode } from 'react';
import { RiCloseFill } from 'react-icons/ri';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  allowOutsideClickToClose?: boolean; // 画面外をクリックした時に画面を閉じるかどうかのフラグ
  showCloseIcon?: boolean;
  closeIconColor?: string;
  minWidth?: string;
  height?: string;
}

// バツボタンがあるだけのダイアログ
export const SimpleDialog = ({
  isOpen,
  onClose,
  children,
  allowOutsideClickToClose = true,
  showCloseIcon = true,
  closeIconColor = '#FFF',
  minWidth = '600px',
  height = 'calc(100vh - 64px)',
}: Props) => (
  <Dialog
    open={isOpen}
    sx={{
      padding: 0,
      mx: 'auto',
      '& .MuiDialog-container': {
        '& .MuiPaper-root': {
          minWidth,
        },
      },
    }}
    onClose={allowOutsideClickToClose ? onClose : () => {}}
    slotProps={{
      backdrop: {
        sx: {
          opacity: '50%',
        },
      },
    }}
  >
    {showCloseIcon && (
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: '4px',
          top: '4px',
        }}
      >
        <RiCloseFill color={closeIconColor} size={24} />
      </IconButton>
    )}
    <DialogContent sx={{ height, minWidth, padding: 0 }}>
      {children}
    </DialogContent>
  </Dialog>
);
