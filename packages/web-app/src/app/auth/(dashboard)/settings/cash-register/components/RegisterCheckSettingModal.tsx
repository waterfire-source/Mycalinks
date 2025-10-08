'use client';

import {
  Box,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { RegisterCheckTiming } from '@prisma/client';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { useRegister } from '@/contexts/RegisterContext';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { useStoreInfoNormal } from '@/feature/store/hooks/useStoreInfoNormal';
import { useUpdateStoreInfo } from '@/feature/store/hooks/useUpdateStoreInfo';

// レジ点検設定更新データ型
interface FormData {
  registerCashManageBySeparately: boolean; // レジ点検方法（true: 個別、false: 一括）
  registerCheckTiming: RegisterCheckTiming; // レジ金点検タイミング
  cashResetEnabled: boolean; // レジ金のリセット（true: 有効、false: 無効）
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export const RegisterCheckSettingModal = ({ open, onClose }: Props) => {
  const { store, resetStore } = useStore();
  const { resetRegister } = useRegister();
  const { updateStoreInfo } = useUpdateStoreInfo();
  const { setAlertState } = useAlert();
  const [formState, setFormState] = useState<FormData>();

  // レジ金設定の取得
  const { storeInfoNormal, fetchStoreInfoNormal } = useStoreInfoNormal();
  useEffect(() => {
    const loadStoreInfo = async () => {
      await fetchStoreInfoNormal(store.id);
    };
    loadStoreInfo();
  }, [store.id, fetchStoreInfoNormal]);

  // モーダルが開かれたら初期値をセット
  useEffect(() => {
    if (open && storeInfoNormal && storeInfoNormal[0]) {
      setFormState({
        registerCashManageBySeparately:
          storeInfoNormal[0].register_cash_manage_by_separately,
        cashResetEnabled: storeInfoNormal[0].register_cash_reset_enabled,
        registerCheckTiming: storeInfoNormal[0].register_cash_check_timing,
      });
    }
  }, [open, storeInfoNormal]);

  // 入力値が変更された場合のハンドラ
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormState((prev) => {
      if (!prev) return prev; // 安全対策
      return { ...prev, [field]: value };
    });
  };

  // レジ金のリセットは、レジ金点検が「閉店時」と「しない」の時のみ選択可能
  const isCashResetEnabled =
    formState?.registerCheckTiming === RegisterCheckTiming.BEFORE_CLOSE ||
    formState?.registerCheckTiming === RegisterCheckTiming.MANUAL;

  // 変更の破棄
  const handleReset = () => {
    if (!storeInfoNormal) return;
    setFormState({
      registerCashManageBySeparately:
        storeInfoNormal?.[0]?.register_cash_manage_by_separately,
      cashResetEnabled: storeInfoNormal?.[0]?.register_cash_reset_enabled,
      registerCheckTiming: storeInfoNormal?.[0]?.register_cash_check_timing,
    });
  };

  // レジ金設定の更新
  const handleUpdate = async () => {
    if (!formState) return;

    const res = await updateStoreInfo({
      registerCashManageBySeparately: formState.registerCashManageBySeparately,
      registerCashCheckTiming: formState.registerCheckTiming,
      registerCashResetEnabled: formState.cashResetEnabled,
    });

    if (!res) return;

    setAlertState({
      message: 'レジ点検設定を保存しました。',
      severity: 'success',
    });

    // store、register情報を更新
    resetStore();
    resetRegister();

    onClose();
  };

  return (
    <CustomModalWithIcon
      open={open}
      onClose={onClose}
      title="レジ点検設定"
      width="70%"
      height="50%"
      onActionButtonClick={handleUpdate}
      onCancelClick={handleReset}
      actionButtonText="変更を保存"
      cancelButtonText="変更を破棄"
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ p: 4 }}>
            <Typography>変更内容は次回の開店時から適用されます。</Typography>

            <Box sx={{ p: 2 }}>
              {/* レジ点検方法 */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" sx={{ minWidth: 170 }}>
                  レジ点検方法
                </Typography>
                <RadioGroup
                  row
                  sx={{ ml: 1 }}
                  value={
                    formState?.registerCashManageBySeparately
                      ? 'separate'
                      : 'bulk'
                  }
                  onChange={(e) =>
                    handleInputChange(
                      'registerCashManageBySeparately',
                      e.target.value === 'separate',
                    )
                  }
                >
                  <FormControlLabel
                    value="separate"
                    control={<Radio />}
                    label="レジごと"
                  />
                  <FormControlLabel
                    value="bulk"
                    control={<Radio />}
                    label="一括"
                  />
                </RadioGroup>
              </Box>

              {/* レジ点検タイミング */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" sx={{ minWidth: 170 }}>
                  レジ金点検タイミング
                </Typography>
                <RadioGroup
                  row
                  sx={{ ml: 1 }}
                  value={formState?.registerCheckTiming ?? ''}
                  onChange={(e) =>
                    handleInputChange(
                      'registerCheckTiming',
                      e.target.value as RegisterCheckTiming,
                    )
                  }
                >
                  <FormControlLabel
                    value={RegisterCheckTiming.BOTH}
                    control={<Radio />}
                    label="開店時と閉店時"
                  />
                  <FormControlLabel
                    value={RegisterCheckTiming.BEFORE_OPEN}
                    control={<Radio />}
                    label="開店時"
                  />
                  <FormControlLabel
                    value={RegisterCheckTiming.BEFORE_CLOSE}
                    control={<Radio />}
                    label="閉店時"
                  />

                  <FormControlLabel
                    value={RegisterCheckTiming.MANUAL}
                    control={<Radio />}
                    label="不定期（手動）"
                  />
                </RadioGroup>
              </Box>

              {/* レジ金のリセット */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Typography variant="body1" sx={{ minWidth: 170 }}>
                  レジ金のリセット
                </Typography>
                <RadioGroup
                  row
                  sx={{ ml: 1 }}
                  value={
                    formState?.cashResetEnabled !== undefined
                      ? formState?.cashResetEnabled
                        ? '有効'
                        : '無効'
                      : ''
                  }
                  onChange={(e) =>
                    handleInputChange(
                      'cashResetEnabled',
                      e.target.value === '有効',
                    )
                  }
                >
                  <FormControlLabel
                    value="有効"
                    control={<Radio />}
                    label="有効"
                    disabled={!isCashResetEnabled}
                  />
                  <FormControlLabel
                    value="無効"
                    control={<Radio />}
                    label="無効"
                    disabled={!isCashResetEnabled}
                  />
                </RadioGroup>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </CustomModalWithIcon>
  );
};
