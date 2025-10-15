import { StorePointSettingUpdateState } from '@/feature/store/hooks/useUpdateStorePointInfo';
import { Box, Typography } from '@mui/material';
import { RadioForPoint } from '@/app/auth/(dashboard)/settings/point-setting/components/RadioForPoint';

interface Props {
  pointEnabled?: boolean;
  setPointSettings: React.Dispatch<
    React.SetStateAction<StorePointSettingUpdateState>
  >;
}

export const PointFunction = ({ pointEnabled, setPointSettings }: Props) => {
  return (
    <Box>
      <Typography variant="h3">ポイント機能使用</Typography>
      <Box
        sx={{
          bgcolor: 'white',
          mt: 2,
          p: 0.2,
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.2)',
          borderRadius: '4px',
        }}
      >
        <Box sx={{ m: 2 }}>
          <Typography variant="body1">ポイント機能</Typography>
          <RadioForPoint
            canEnable={pointEnabled}
            trueLabel={'使用する'}
            falseLabel={'使用しない'}
            settingKey={'pointEnabled'}
            setPointSettings={setPointSettings}
          />

          {pointEnabled && (
            <Box
              sx={{
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}
            >
              <Typography
                variant="body1"
                component="label"
                htmlFor="point-to-yen"
              >
                1ポイント = 1円
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};
