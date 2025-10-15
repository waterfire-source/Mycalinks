import { useState } from 'react';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { useStore } from '@/contexts/StoreContext';
import { ChangeRegisterKind } from '@/feature/cash/constants';
import { useCashChange } from '@/feature/cash/hooks/useCashChange';
import { useCashHistorySearch } from '@/feature/cash/hooks/useCashHistorySearch';
import { Box, TextField, Typography } from '@mui/material';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import { useAlert } from '@/contexts/AlertContext';

interface Props {
  open: boolean;
  onClose: () => void;
  selectedCashRegisterId: number | null;
}

export const RegistrationModal = ({
  open,
  onClose,
  selectedCashRegisterId,
}: Props) => {
  const { store, resetStore } = useStore();
  const { handleError } = useErrorAlert();
  const { setAlertState } = useAlert();
  // レジ履歴の絞り込みと取得を行うカスタムフック
  const { performSearch } = useCashHistorySearch(store.id);

  // レジの入出金を行うカスタムフック
  const {
    changeRegisterCashInfo,
    handlerChangeRegisterInfo,
    submitChangeRegisterCash,
  } = useCashChange(store.id, selectedCashRegisterId);

  // 入出金登録ハンドラ：submitChangeRegisterCash の完了を待機し、完了後モーダルを閉じる
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmitChangeRegisterCash = async () => {
    setIsSubmitting(true);
    try {
      await submitChangeRegisterCash();
      setAlertState({
        message: '処理が完了しました',
        severity: 'success',
      });
      onClose();
      resetStore();
      performSearch();
    } catch (error) {
      console.log('error: ', error);
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomModalWithIcon
      open={open}
      onClose={onClose}
      title={`入出金登録`}
      width="90%"
      height="90%"
      onActionButtonClick={handleSubmitChangeRegisterCash}
      actionButtonText={'入出金登録'}
      onCancelClick={onClose}
      cancelButtonText="入出金をやめる"
      loading={isSubmitting}
    >
      <Box
        sx={{
          display: 'flex',
          flexFlow: 'column', // 縦並び
          gap: 0,
          height: '100%',
          alignItems: 'start',
          mx: 6,
          mt: 2,
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <SecondaryButton
            sx={{ width: '100px', height: '100%' }}
            selected={changeRegisterCashInfo.type === ChangeRegisterKind.import}
            onClick={() =>
              handlerChangeRegisterInfo('type', {
                value: ChangeRegisterKind.import,
              })
            }
          >
            入金
          </SecondaryButton>
          <SecondaryButton
            sx={{ width: '100px', height: '100%' }}
            selected={changeRegisterCashInfo.type === ChangeRegisterKind.export}
            onClick={() =>
              handlerChangeRegisterInfo('type', {
                value: ChangeRegisterKind.export,
              })
            }
          >
            出金
          </SecondaryButton>
        </Box>
        <Box sx={{ my: 1 }} display="flex" alignItems="center" gap={3}>
          <Typography variant="body2">金額</Typography>
          <NumericTextField
            value={changeRegisterCashInfo.inputAmount || undefined}
            onChange={(num) => handlerChangeRegisterInfo('inputAmount', num)}
            InputProps={{
              endAdornment: <Typography>円</Typography>,
            }}
            noSpin
            sx={{ backgroundColor: 'common.white' }}
          />
        </Box>
        <Box flex={1} width="100%">
          <Typography variant="body2" sx={{ mt: 1 }}>
            理由
          </Typography>
          <TextField
            size="small"
            multiline
            sx={{
              backgroundColor: 'common.white',
              width: '70%',
              height: '90%',
              '& .MuiInputBase-root': {
                height: '100%',
                alignItems: 'flex-start', // 上寄せにする
              },
              '& .MuiInputBase-inputMultiline': {
                textAlign: 'left', // テキストを左寄せ
                verticalAlign: 'top', // テキストを上寄せ
                padding: '8px', // 内側の余白を調整
              },
            }}
            onChange={(e) => handlerChangeRegisterInfo('reason', e.target)}
          ></TextField>
        </Box>
      </Box>
    </CustomModalWithIcon>
  );
};
