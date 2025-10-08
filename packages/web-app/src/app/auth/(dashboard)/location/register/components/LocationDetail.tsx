import { LocationProduct } from '@/app/auth/(dashboard)/location/register/page';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { DetailCard } from '@/components/cards/DetailCard';
import { PATH } from '@/constants/paths';
import { useAlert } from '@/contexts/AlertContext';
import {
  createLocationRequest,
  useLocation,
} from '@/feature/location/hooks/useLocation';
import { Box, Stack, TextField, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

import { useState } from 'react';

type Props = { locationProducts: LocationProduct[] };

export const LocationDetail = ({ locationProducts }: Props) => {
  const { loading, createLocation } = useLocation();
  const { setAlertState } = useAlert();
  const { push } = useRouter();

  const [locationName, setLocationName] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const onClickCreateButton = async () => {
    const requestProducts: createLocationRequest['products'] =
      locationProducts.map((p) => ({
        product_id: p.id,
        item_count: p.itemCount,
      }));

    const ok = await createLocation({
      products: requestProducts,
      description,
      display_name: locationName,
    });

    if (ok) {
      setAlertState({
        message: 'ロケーションを作成しました',
        severity: 'success',
      });

      push(PATH.LOCATION.root);
    }
  };

  return (
    <DetailCard
      title="ロケーション詳細"
      content={
        <Stack sx={{ width: '100%', height: '100%' }} spacing={2}>
          <Box sx={{ width: '100%' }}>
            <Typography>ロケーション名：</Typography>
            <TextField
              size="small"
              sx={{ width: '100%' }}
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
            ></TextField>
          </Box>
          <Box sx={{ width: '100%' }}>
            <Typography>備考：</Typography>
            <TextField
              size="small"
              sx={{ width: '100%' }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></TextField>
          </Box>
        </Stack>
      }
      bottomContent={
        <Stack
          direction="row"
          sx={{
            width: '100%',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <SecondaryButton onClick={() => push(PATH.LOCATION.root)}>
              作成をやめる
            </SecondaryButton>
          </Box>
          <Box>
            <PrimaryButton onClick={onClickCreateButton} loading={loading}>
              ロケーション作成
            </PrimaryButton>
          </Box>
        </Stack>
      }
    />
  );
};
