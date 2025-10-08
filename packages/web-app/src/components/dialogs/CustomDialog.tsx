import { RiCloseFill } from 'react-icons/ri';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { styled } from '@mui/material/styles';
import { ReactNode } from 'react';
import { Stack, useTheme } from '@mui/material';
import DialogActions from '@mui/material/DialogActions';

export const CUSTOM_DIALOG_CONTENT_HEIGHT = 'calc(100vh - 120px)';

const StyledDialog = styled(Dialog)(() => ({
  '& .MuiDialog-container': {
    alignItems: 'flex-start',
    marginTop: '60px',
    marginBottom: '60px',
    maxHeight: CUSTOM_DIALOG_CONTENT_HEIGHT, // ビューポートの高さから120pxを引いた値を設定する
  },
}));

export type CustomDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode; // ダイアログのフッターの部分、ボタンなどを設定する。この部分はスクロールされない。
  size?: 'small' | 'medium' | 'large' | 'extraLarge';
  isContentPaddingNone?: boolean; // contentのpaddingをoffにするためのフラグ
};

export default function CustomDialog({
  isOpen,
  onClose,
  title,
  children,
  actions,
  size = 'small',
  isContentPaddingNone = false,
}: CustomDialogProps) {
  const theme = useTheme();

  return (
    <StyledDialog
      open={isOpen}
      onClose={onClose}
      sx={{
        backdropFilter: 'blur(4px)',
        '& .MuiDialog-paper': {
          width: '100%',
          maxWidth:
            size === 'small'
              ? '569px'
              : size === 'medium'
              ? '982px'
              : size === 'large'
              ? '1200px'
              : size === 'extraLarge'
              ? '1600px'
              : '569px',
        },
      }}
    >
      <Stack
        justifyContent="space-between"
        direction="row"
        padding="16px"
        alignItems="center"
        sx={{ backgroundColor: 'grey.700' }}
      >
        <DialogTitle
          style={{
            justifyContent: 'center',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            padding: 0,
            position: 'relative',
            color: theme.palette.text.secondary,
          }}
          variant="body1"
        >
          {title}
          <RiCloseFill
            onClick={onClose}
            role="button"
            aria-label="閉じる"
            style={{
              cursor: 'pointer',
              width: '20px',
              fontSize: '20px',
              position: 'absolute',
              right: 0,
            }}
            color={theme.palette.text.secondary}
          />
        </DialogTitle>
      </Stack>
      <DialogContent
        sx={{
          border: `1px solid ${theme.palette.grey[400]}`,
          '&.MuiDialogContent-root': {
            padding: isContentPaddingNone ? '0px' : '32px 20px 48px 20px',
          },
        }}
      >
        {children}
      </DialogContent>
      {actions && <DialogActions sx={{ p: '20px' }}>{actions}</DialogActions>}
    </StyledDialog>
  );
}
