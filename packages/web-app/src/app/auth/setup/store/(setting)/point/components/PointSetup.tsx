import { Box } from '@mui/material';
import { PointFunction } from '@/app/auth/(dashboard)/settings/point-setting/components/PointFunction';
import { PointSetupGrant } from '@/app/auth/setup/store/(setting)/point/components/PointSetupGrant';
import { StorePointSettingUpdateState } from '@/feature/store/hooks/useUpdateStorePointInfo';
import { Dispatch, SetStateAction } from 'react';

type Props = {
  pointSettings: StorePointSettingUpdateState;
  setPointSettings: Dispatch<SetStateAction<StorePointSettingUpdateState>>;
};

export const PointSetup = ({ pointSettings, setPointSettings }: Props) => {
  return (
    <Box sx={{ mr: 5 }}>
      <PointFunction
        pointEnabled={pointSettings.pointEnabled}
        setPointSettings={setPointSettings}
      />
      <PointSetupGrant
        canEnableSellPoint={pointSettings.sellPointEnabled}
        sellPointPer={pointSettings.sellPointPer}
        canEnableBuyPoint={pointSettings.buyPointEnabled}
        buyPointPer={pointSettings.buyPointPer}
        setPointSettings={setPointSettings}
      />
    </Box>
  );
};
