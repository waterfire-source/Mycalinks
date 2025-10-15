import { StorePointSettingUpdateState } from '@/feature/store/hooks/useUpdateStorePointInfo';
import { Box, Typography } from '@mui/material';
import { RadioForPoint } from '@/app/auth/(dashboard)/settings/point-setting/components/RadioForPoint';
import { TextFieldForPoint } from '@/app/auth/(dashboard)/settings/point-setting/components/TextFieldForPoint';

interface Props {
  canEnableSellPoint?: boolean;
  sellPointPer?: number;
  canEnableBuyPoint?: boolean;
  buyPointPer?: number;
  setPointSettings: React.Dispatch<
    React.SetStateAction<StorePointSettingUpdateState>
  >;
}

export const PointSetupGrant = ({
  canEnableSellPoint,
  sellPointPer,
  canEnableBuyPoint,
  buyPointPer,
  setPointSettings,
}: Props) => {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h3">ポイント付与設定</Typography>
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
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1">販売ポイント</Typography>
            <RadioForPoint
              canEnable={canEnableSellPoint}
              trueLabel={'付与する'}
              falseLabel={'付与しない'}
              settingKey={'sellPointEnabled'}
              setPointSettings={setPointSettings}
            />
            {canEnableSellPoint && (
              <Box
                sx={{
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 0,
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 0.5,
                    alignItems: 'center',
                  }}
                >
                  <TextFieldForPoint
                    value={sellPointPer}
                    settingKey={'sellPointPer'}
                    setPointSettings={setPointSettings}
                  />
                  <Typography variant="body1">円につき1ポイント</Typography>
                </Box>
              </Box>
            )}
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1">買取ポイント</Typography>
            <RadioForPoint
              canEnable={canEnableBuyPoint}
              trueLabel={'付与する'}
              falseLabel={'付与しない'}
              settingKey={'buyPointEnabled'}
              setPointSettings={setPointSettings}
            />
            {canEnableBuyPoint && (
              <Box
                sx={{
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 0,
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 0.5,
                    alignItems: 'center',
                  }}
                >
                  <TextFieldForPoint
                    value={buyPointPer}
                    settingKey={'buyPointPer'}
                    setPointSettings={setPointSettings}
                  />
                  <Typography variant="body1">円につき1ポイント</Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
