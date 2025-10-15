import { StorePointSettingUpdateState } from '@/feature/store/hooks/useUpdateStorePointInfo';
import { Box, Typography } from '@mui/material';
import { PointOpportunity } from '@prisma/client';
import { RadioForPoint } from '@/app/auth/(dashboard)/settings/point-setting/components/RadioForPoint';
import { SelectForPoint } from '@/app/auth/(dashboard)/settings/point-setting/components/SelectForPoint';
import { TextFieldForPoint } from '@/app/auth/(dashboard)/settings/point-setting/components/TextFieldForPoint';

interface Props {
  canEnablePointSpendLimit?: boolean;
  pointSpendLimitPer?: PointOpportunity;
  pointSpendLimitAmount?: number;
  canEnablePointExpire?: boolean;
  pointExpireDay?: number;
  setPointSettings: React.Dispatch<
    React.SetStateAction<StorePointSettingUpdateState>
  >;
}

export const PointUsage = ({
  canEnablePointSpendLimit,
  pointSpendLimitPer,
  pointSpendLimitAmount,
  canEnablePointExpire,
  pointExpireDay,
  setPointSettings,
}: Props) => {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h3">ポイント利用設定</Typography>

      <Box
        sx={{
          bgcolor: 'white',
          mt: 2,
          mb: 2,
          p: 0.2,
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.2)',
          borderRadius: '4px',
        }}
      >
        <Box sx={{ m: 2 }}>
          <Box>
            <Typography variant="body1">ポイント利用制限</Typography>
            <RadioForPoint
              canEnable={canEnablePointSpendLimit}
              trueLabel={'設定する'}
              falseLabel={'設定しない'}
              settingKey={'pointSpendLimitEnabled'}
              setPointSettings={setPointSettings}
            />

            {canEnablePointSpendLimit && (
              <Box
                sx={{
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 0.5,
                  alignItems: 'center',
                }}
              >
                <SelectForPoint
                  value={pointSpendLimitPer}
                  settingKey={'pointSpendLimitPer'}
                  setPointSettings={setPointSettings}
                />
                <Typography variant="body1">につき</Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 0.5,
                    alignItems: 'center',
                  }}
                >
                  <TextFieldForPoint
                    value={pointSpendLimitAmount}
                    settingKey={'pointSpendLimitAmount'}
                    setPointSettings={setPointSettings}
                  />
                  <Typography variant="body1">ポイントまで</Typography>
                </Box>
              </Box>
            )}
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1">ポイント有効期限</Typography>
            <RadioForPoint
              canEnable={canEnablePointExpire}
              trueLabel={'設定する'}
              falseLabel={'設定しない'}
              settingKey={'pointExpireEnabled'}
              setPointSettings={setPointSettings}
            />
            {canEnablePointExpire && (
              <Box
                sx={{
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 0.5,
                  alignItems: 'center',
                }}
              >
                <Typography variant="body1">最終ポイント付与日から</Typography>
                <TextFieldForPoint
                  value={pointExpireDay}
                  settingKey={'pointExpireDay'}
                  setPointSettings={setPointSettings}
                />
                <Typography variant="body1">日</Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
