import { Box, Card, Grid, Typography } from '@mui/material';
import React from 'react';
import Image from 'next/image';
import { format, parseISO, isValid } from 'date-fns';
import { PosCustomerInfo } from '@/app/mycalinks/(core)/types/customer';
import { PurchaseInfosType } from '@/app/mycalinks/(core)/components/PurchaseInfo/PurchaseInfoContainer';

interface Props {
  purchaseInfo: PurchaseInfosType;
  posCustomerStoresInfos?: PosCustomerInfo['store'][];
}
export const PurchaseInfoCard = ({
  purchaseInfo,
  posCustomerStoresInfos,
}: Props) => {
  const formatPublishedAtDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = parseISO(dateString);
    if (isValid(date)) {
      return format(date, 'M/d');
    } else {
      console.error('Invalid date format');
      return '';
    }
  };

  return (
    <>
      {/* 買取情報カード */}
      <Card sx={{ p: 2, borderRadius: 2, boxShadow: 4, mb: 2 }}>
        <Grid container spacing={1}>
          <Grid item xs={3} alignSelf={'flex-end'}>
            <Typography
              variant="body1"
              sx={{ fontWeight: 'bold', textAlign: 'left' }}
            >
              {formatPublishedAtDate(purchaseInfo.published_at)}
            </Typography>
          </Grid>
          <Grid item xs={6} alignSelf={'flex-end'}>
            <Typography
              variant="body1"
              sx={{ fontWeight: 'bold', textAlign: 'center' }}
            >
              {posCustomerStoresInfos?.find(
                (store) => store?.id === purchaseInfo.store_id,
              )?.display_name || `店舗${purchaseInfo.store_id}`}
            </Typography>
          </Grid>
          <Grid item xs={3} alignSelf={'flex-end'}>
            <Typography
              variant="body1"
              sx={{ fontWeight: 'bold', textAlign: 'right' }}
            >
              {/* nullが渡ってくることあったのでチェック */}
              {purchaseInfo.genre_handle === 'null'
                ? ''
                : purchaseInfo.genre_handle ?? ''}
            </Typography>
          </Grid>
        </Grid>
        <Box sx={{ width: '100%' }}>
          {purchaseInfo.allImages.map((image, index) => (
            <Image
              key={`${image.purchase_table_id}-${image.order_number}`}
              src={image.image_url || '/images/ec/noimage.png'}
              alt={`買取表画像${index + 1}`}
              width={400}
              height={300}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                marginBottom:
                  index < purchaseInfo.allImages.length - 1 ? '8px' : '0',
              }}
            />
          ))}
        </Box>
      </Card>
    </>
  );
};
