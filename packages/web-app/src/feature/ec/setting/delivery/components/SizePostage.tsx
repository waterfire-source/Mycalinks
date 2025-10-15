import { StoreAPI } from '@/api/frontend/store/api';
import SecondaryButton from '@/components/buttons/SecondaryButton';

import { SizePostageSettingUpdateModal } from '@/feature/ec/setting/delivery/components/SizePostageSettingUpdateModal';
import { Grid, Typography } from '@mui/material';
import { Dispatch, useState } from 'react';

interface Props {
  deliveryMethod:
    | StoreAPI['createShippingMethod']['request']['body']
    | StoreAPI['updateShippingMethod']['request']['body'];

  setDeliveryMethod:
    | Dispatch<StoreAPI['createShippingMethod']['request']['body']>
    | Dispatch<StoreAPI['updateShippingMethod']['request']['body']>;
}

export const SizePostage = ({ deliveryMethod, setDeliveryMethod }: Props) => {
  const [isSizePostageSettingModalOpen, setIsSizePostageSettingModalOpen] =
    useState<boolean>(false);
  const [currentWeightIndex, setCurrentWeightIndex] = useState<number | null>(
    null,
  );
  return (
    <>
      {deliveryMethod.weights?.map((weight, index) => (
        <>
          {weight.displayName && (
            <>
              <Grid item xs={4} sx={{ alignSelf: 'center' }}>
                {/* 送料 */}
                <Typography>{weight.displayName}</Typography>
              </Grid>
              <Grid item xs={6}>
                {weight.regions[0].regionHandle === '全国一律' ? (
                  <Typography sx={{ justifySelf: 'end', alignSelf: 'center' }}>
                    全国一律{weight.regions[0].fee}円
                  </Typography>
                ) : (
                  <Typography sx={{ justifySelf: 'end', alignSelf: 'center' }}>
                    地域別
                  </Typography>
                )}
              </Grid>
              <Grid item xs={2}>
                <SecondaryButton
                  onClick={() => {
                    setCurrentWeightIndex(index);
                    setIsSizePostageSettingModalOpen(true);
                  }}
                  sx={{ width: 'auto', minWidth: 'auto', whiteSpace: 'nowrap' }}
                >
                  編集
                </SecondaryButton>
              </Grid>
            </>
          )}
        </>
      ))}
      <Grid item xs={12}>
        <SecondaryButton
          fullWidth
          onClick={() => {
            setCurrentWeightIndex(null);
            setIsSizePostageSettingModalOpen(true);
          }}
        >
          サイズを追加
        </SecondaryButton>
      </Grid>

      <SizePostageSettingUpdateModal
        open={isSizePostageSettingModalOpen}
        onClose={() => setIsSizePostageSettingModalOpen(false)}
        deliveryMethod={deliveryMethod}
        currentWeightIndex={currentWeightIndex}
        setDeliveryMethod={setDeliveryMethod}
      />
    </>
  );
};
