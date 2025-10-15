'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { useErrorAlert } from '@/hooks/useErrorAlert';

// 連携データ型
interface OchanokoFormData {
  ochanokoEmail: string;
  ochanokoAccountId: string;
  ochanokoPassword: string;
  ochanokoApiToken: string;
}

interface OchanokoIntegrationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const OchanokoIntegrationModal = ({
  open,
  onClose,
  onSuccess,
}: OchanokoIntegrationModalProps) => {
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const { handleError } = useErrorAlert();

  const [isUpdating, setIsUpdating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formState, setFormState] = useState<OchanokoFormData>({
    ochanokoEmail: '',
    ochanokoAccountId: '',
    ochanokoPassword: '',
    ochanokoApiToken: '',
  });

  const clientAPI = createClientAPI();

  const handleInputChange = (field: keyof OchanokoFormData, value: any) => {
    setFormState((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  };

  // 「連携」ボタン押下時のハンドラ
  const handleSubmit = async () => {
    // 入力チェック
    const {
      ochanokoEmail,
      ochanokoAccountId,
      ochanokoPassword,
      ochanokoApiToken,
    } = formState;
    if (
      !ochanokoEmail.trim() ||
      !ochanokoAccountId.trim() ||
      !ochanokoPassword.trim() ||
      !ochanokoApiToken.trim()
    ) {
      setAlertState({
        message: 'すべての項目を入力してください。',
        severity: 'error',
      });
      return;
    }

    setIsUpdating(true);
    try {
      const res = await clientAPI.store.updateOchanokoEcSetting({
        storeId: store.id,
        ochanokoEcEnabled: true,
        EcSetting: formState,
      });

      if (res instanceof CustomError) throw res;

      setAlertState({
        message: `おちゃのこネットアカウントを連携しました。`,
        severity: 'success',
      });

      // 連携に成功した場合は、モーダルを閉じ、表示データを更新
      onClose();
      onSuccess();
    } catch (error) {
      handleError(error);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (open) {
      setFormState({
        ochanokoEmail: '',
        ochanokoAccountId: '',
        ochanokoPassword: '',
        ochanokoApiToken: '',
      });
    }
  }, [open]);

  return (
    <CustomModalWithIcon
      open={open}
      onClose={onClose}
      title="おちゃのこネットアカウント連携"
      width="50%"
      height="50%"
      actionButtonText="連携"
      cancelButtonText="キャンセル"
      onActionButtonClick={handleSubmit}
      loading={isUpdating}
    >
      <Box sx={{ p: 1 }}>
        {/*  おちゃのこネットアカウントID */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: 2,
          }}
        >
          <Box sx={{ width: '100%', mb: 2 }}>
            <Typography sx={{ fontSize: '14px' }}>
              おちゃのこネットアカウントID
            </Typography>
            <TextField
              fullWidth
              value={formState?.ochanokoAccountId}
              onChange={(e) =>
                handleInputChange('ochanokoAccountId', e.target.value)
              }
              size="small"
              sx={{ backgroundColor: '#fff' }}
            />
          </Box>
        </Box>

        {/*  おちゃのこネット登録済みメールアドレス */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: 2,
          }}
        >
          <Box sx={{ width: '100%', mb: 2 }}>
            <Typography sx={{ fontSize: '14px' }}>
              おちゃのこネット登録済みメールアドレス
            </Typography>
            <TextField
              fullWidth
              value={formState?.ochanokoEmail}
              onChange={(e) =>
                handleInputChange('ochanokoEmail', e.target.value)
              }
              size="small"
              sx={{ backgroundColor: '#fff' }}
            />
          </Box>
        </Box>

        {/*  APIキー */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: 2,
          }}
        >
          <Box sx={{ width: '100%', mb: 2 }}>
            <Typography sx={{ fontSize: '14px' }}>APIキー</Typography>
            <TextField
              fullWidth
              value={formState?.ochanokoApiToken}
              onChange={(e) =>
                handleInputChange('ochanokoApiToken', e.target.value)
              }
              size="small"
              sx={{ backgroundColor: '#fff' }}
            />
          </Box>
        </Box>

        {/*  おちゃのこネットログインパスワード */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: 2,
          }}
        >
          <Box sx={{ width: '100%', mb: 2 }}>
            <Typography sx={{ fontSize: '14px' }}>
              おちゃのこネットログインパスワード
            </Typography>
            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              value={formState?.ochanokoPassword}
              onChange={(e) =>
                handleInputChange('ochanokoPassword', e.target.value)
              }
              size="small"
              sx={{ backgroundColor: '#fff' }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>
      </Box>
    </CustomModalWithIcon>
  );
};
