import PrimaryButton from '@/components/buttons/PrimaryButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Dispatch, SetStateAction } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  term: string | undefined;
  setTerm: Dispatch<SetStateAction<string | undefined>>;
  updateTerm: () => Promise<void>;
  isUpdateLoading: boolean;
  defaultTerm: string;
}
export const PurchaseSettingDialog = ({
  isOpen,
  onClose,
  term,
  setTerm,
  updateTerm,
  isUpdateLoading,
  defaultTerm,
}: Props) => {
  // デフォルト入力ボタンを押した時の処理
  const handleClickDefault = () => {
    setTerm(defaultTerm);
  };
  // 設定完了ボタン押した時
  const handleClickSettingComplete = async () => {
    await updateTerm();
    onClose();
  };
  return (
    <Dialog open={isOpen}>
      <DialogTitle
        textAlign="center"
        sx={{ backgroundColor: 'grey.700', color: 'white' }}
      >
        買取規約
      </DialogTitle>
      <DialogContent
        sx={{
          minHeight: 'calc(100vh - 320px)',
          minWidth: '600px',
        }}
      >
        {term === '' && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              買取機能をご利用いただくには買取規約文の設定が必要です。
            </Typography>
            <Typography sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              買取規約文は後から変更可能です。
            </Typography>
          </Box>
        )}
        <Stack gap="32px" paddingTop="18px">
          <Stack direction="row" gap="16px" alignItems="center">
            <Typography>買取規約文</Typography>
            <SecondaryButton onClick={handleClickDefault}>
              デフォルト入力
            </SecondaryButton>
          </Stack>
          <TextField
            minRows={10}
            multiline
            value={term}
            onChange={(e) => {
              setTerm(e.target.value);
            }}
          ></TextField>
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{ alignItems: 'center', justifyContent: 'center', pb: '32px' }}
      >
        <PrimaryButton
          onClick={handleClickSettingComplete}
          size="large"
          sx={{ width: '50%' }}
          loading={isUpdateLoading}
          disabled={term === ''}
        >
          設定完了
        </PrimaryButton>
      </DialogActions>
    </Dialog>
  );
};
