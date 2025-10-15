'use client';
import { ViewTypes } from '@/app/mycalinks/(core)/types/MembershipCardContent';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
} from '@mui/material';
import Image from 'next/image';
import { ReservationsType } from '@/app/mycalinks/(core)/components/ReservationView/useReservationView';
import Loader from '@/components/common/Loader';
import { HeaderWithBackButton } from '@/app/mycalinks/(core)/components/StoreMenu/HeaderWithBackButton';
import { PosCustomerInfo } from '@/app/mycalinks/(core)/types/customer';
import dayjs from 'dayjs';
import { FixedMyPageButton } from '@/app/mycalinks/(core)/components/buttons/FixedMyPageButton';
import { useMycaUserBarcode } from '@/feature/mycalinks/hooks/useMycaUserBarcode';

interface Props {
  isLoading?: boolean;
  onBack: () => void;
  onDetailClick: (viewType: ViewTypes, id: number) => void;
  reservations?: ReservationsType[];
  posCustomerStoresInfos?: PosCustomerInfo['store'][];
}

export const ReservationViewList = ({
  isLoading,
  onBack,
  onDetailClick,
  reservations,
  posCustomerStoresInfos,
}: Props) => {
  // バーコード情報
  const {
    isLoading: isLoadingBarcode,
    barcodeInfo,
    getBarcodeToken,
  } = useMycaUserBarcode();

  const formattedDate = (date: string) => {
    return dayjs(date).format('YYYY/MM/DD');
  };

  if (isLoading) {
    return (
      <Loader
        sx={{
          bgcolor: 'transparent',
          height: '80vh',
        }}
      />
    );
  }

  return (
    <>
      {/* header */}
      <HeaderWithBackButton onBack={onBack} title="予約票一覧" />

      {/* contents */}
      <Stack spacing={2}>
        {reservations?.map((reservation) => (
          <Card
            key={reservation.id}
            sx={{
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box sx={{ flex: 1 }}>
                  {/* アイコンと店舗名 */}
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ mr: 1 }}>
                      <Image
                        src={
                          posCustomerStoresInfos?.find(
                            (StoresInfo) =>
                              StoresInfo?.id ===
                              reservation.reservation.store_id,
                          )?.receipt_logo_url || ''
                        }
                        alt={``}
                        width={40}
                        height={40}
                        style={{ borderRadius: '50%' }}
                      />
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {posCustomerStoresInfos?.find(
                        (store) =>
                          store?.id === reservation.reservation.store_id,
                      )?.display_name || '店舗名不明'}
                    </Typography>
                  </Box>
                  {/* 商品名 */}
                  <Typography
                    variant="body1"
                    sx={{
                      mb: 1,
                      mr: 1,
                    }}
                  >
                    {reservation.reservation.product.displayNameWithMeta}
                  </Typography>
                  {/* 発売日 */}
                  <Typography variant="body1">
                    発売日：
                    {formattedDate(
                      reservation.reservation.product.item.release_date || '',
                    )}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  color="inherit"
                  size="small"
                  onClick={() =>
                    onDetailClick(ViewTypes.RESERVATION_DETAIL, reservation.id)
                  }
                  sx={{
                    bgcolor: '#aaaaaa',
                    color: 'white',
                    '&:hover': {
                      bgcolor: '#999999',
                    },
                  }}
                >
                  詳細
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <FixedMyPageButton
        barcodeValue={barcodeInfo.value}
        getBarcodeToken={getBarcodeToken}
        isLoading={isLoadingBarcode}
      />
    </>
  );
};
