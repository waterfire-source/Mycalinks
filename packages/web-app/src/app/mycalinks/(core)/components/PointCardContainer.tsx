import React, { useState } from 'react';
import { Box, Typography, Button, IconButton, Stack } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Barcode, BarcodeFormat } from '@/components/barcode/Barcode';
import { PosCustomerInfo } from '@/app/mycalinks/(core)/types/customer';
import { PointModal } from '@/app/mycalinks/(core)/components/modals/PointModal';
import { useErrorAlert } from '@/hooks/useErrorAlert';

interface Props {
  barcodeValue: string;
  posCustomerInfo: PosCustomerInfo[];
  selectedStore: PosCustomerInfo | null;
  getBarcodeToken: () => void;
}

export const PointCardContainer = ({
  barcodeValue,
  posCustomerInfo,
  selectedStore,
  getBarcodeToken,
}: Props) => {
  const { handleError } = useErrorAlert();

  const [openPointModal, setOpenPointModal] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const storeCount = posCustomerInfo.length;

  const handleRefreshBarcode = async () => {
    setIsRefreshing(true);
    try {
      await getBarcodeToken();
    } catch (error) {
      handleError(error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleViewPointDetails = () => {
    setOpenPointModal(true);
  };

  return (
    <>
      {/* ポイント確認モーダル */}
      <PointModal
        open={openPointModal}
        onClose={() => setOpenPointModal(false)}
        posCustomerInfo={posCustomerInfo}
      />

      {/* ポイントカード */}
      <Stack
        sx={{ mt: 2, mb: 2, py: 3, alignItems: 'center', position: 'relative' }}
        spacing={2}
      >
        <Box
          sx={{
            width: '90%',
            bgcolor: '#fff',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            zIndex: 2,
          }}
        >
          {/* POINTヘッダー  */}
          <Stack
            direction="row"
            sx={{
              bgcolor: 'primary.main',
              color: '#fff',
              justifyContent: 'center',
              alignItems: 'center',
              px: 2,
              py: 1,
              position: 'relative',
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              POINT
            </Typography>
            <IconButton
              color="inherit"
              size="small"
              onClick={handleRefreshBarcode}
              sx={{
                color: '#fff',
                position: 'absolute',
                right: 16,
              }}
              disabled={isRefreshing}
            >
              <RefreshIcon />
            </IconButton>
          </Stack>

          {/* ポイント情報 */}
          <Stack sx={{ px: 2, py: 1, alignItems: 'center' }} spacing={2}>
            {selectedStore ? (
              <Typography
                sx={{ fontSize: '32px!important', fontWeight: 'bold' }}
              >
                {selectedStore?.owned_point?.toLocaleString()}
                <Box
                  component="span"
                  sx={{
                    fontSize: '20px!important',
                    fontWeight: 'bold',
                    ml: 0.5,
                  }}
                >
                  PT
                </Box>
              </Typography>
            ) : (
              <>
                <Typography variant="subtitle1" align="center">
                  ポイント所有店舗数
                  <span style={{ fontSize: '1.4em' }}> {storeCount}店舗</span>
                </Typography>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: '#9E9E9E',
                    color: '#fff',
                    fontSize: '14px',
                    borderRadius: '16px',
                    boxShadow: 'none',
                    py: 0.5,
                    px: 5,
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      bgcolor: '#8E8E8E',
                      boxShadow: 'none',
                    },
                  }}
                  onClick={handleViewPointDetails}
                >
                  ポイント内訳を確認
                </Button>
              </>
            )}
          </Stack>

          {/* バーコード部分 */}
          <Stack
            sx={{
              px: 3,
              py: 1,
              borderBottom: '1px solid #EEEEEE',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Barcode
              charCount={24}
              value={barcodeValue}
              options={{
                format: BarcodeFormat.CODE128,
                height: 60,
                width: 2.2,
              }}
            />
          </Stack>
        </Box>
        {/* 赤色 */}
        <Box
          sx={{
            width: '100%',
            height: '110px',
            bgcolor: 'primary.main',
            position: 'absolute',
            top: '60%',
            zIndex: '0',
          }}
        />
      </Stack>
    </>
  );
};
