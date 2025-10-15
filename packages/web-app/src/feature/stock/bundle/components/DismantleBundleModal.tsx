'use client';

import React from 'react';
import { Modal, Box, Card, Typography, Grid } from '@mui/material';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { useBundles } from '@/feature/stock/bundle/hooks/useBundles';
import { BundleSetProductType } from '@/feature/stock/bundle/components/TabTable';
import { ProductAPI } from '@/api/frontend/product/api';

interface DismantleBundleModalProps {
  open: boolean;
  bundle: BundleSetProductType;
  onClose: (isDismantleSuccess: boolean) => void;
  storeID: number;
  setFetchTableDataTrigger: React.Dispatch<React.SetStateAction<number>>;
}

const DismantleBundleModal: React.FC<DismantleBundleModalProps> = ({
  open,
  bundle,
  onClose: handleClose,
  storeID,
  setFetchTableDataTrigger,
}) => {
  // 解体数
  const [dismantleQuantity, setDismantleQuantity] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const { releaseBundle } = useBundles();

  // 解体数が変更された際のハンドラー
  const handleDismantleQuantityChange = (value: number | undefined) => {
    if (value) {
      setDismantleQuantity(value);
    }
  };

  // バンドル解体ハンドラー
  const handleDismantleBundle = async () => {
    setIsLoading(true);
    if (!bundle.productId) {
      console.error('バンドルの商品IDが取得できませんでした');
      return;
    }

    const dismantleBundleParams: ProductAPI['releaseBundle']['request'] = {
      storeID: storeID,
      productID: bundle.productId,
      itemCount: dismantleQuantity,
    };
    const res = await releaseBundle(dismantleBundleParams);
    if (res) {
      // 解体成功時のみモーダルを閉じる
      handleClose(true);
      setFetchTableDataTrigger((prev) => prev + 1);
    }
    setIsLoading(false);
  };

  return (
    <Modal open={open} onClose={() => handleClose(false)}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          height: '30%',
          minHeight: '270px',
          bgcolor: 'background.paper',
          borderRadius: '4px',
          boxShadow: 24,
        }}
      >
        <Card
          sx={{
            width: '100%',
            height: '100%',
            boxShadow: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflow: 'auto',
          }}
        >
          <Typography
            align="center"
            sx={{
              color: 'text.secondary',
              backgroundColor: 'grey',
              width: '100%',
              height: '60px',
              borderRadius: '4px 4px 0 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            バンドル解体
          </Typography>

          <Box
            sx={{
              width: '70%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                paddingTop: 3,
                paddingBottom: 3,
                width: '100%',
              }}
            >
              <Grid container spacing={2}>
                <Grid container item xs={12} alignItems="center">
                  <Grid item xs={4}>
                    <Typography>残りバンドル数</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography>：{bundle.bundleStockNumber}</Typography>
                  </Grid>
                </Grid>

                <Grid container item xs={12} alignItems="center">
                  <Grid item xs={4}>
                    <Typography>解体数</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                      }}
                    >
                      <Typography>：</Typography>
                      <NumericTextField
                        value={dismantleQuantity ?? 0}
                        onChange={handleDismantleQuantityChange}
                        size="small"
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Box>

            {/* バンドル解体 */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: 2,
                width: '100%',
              }}
            >
              <Box
                sx={{
                  width: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PrimaryButton
                  fullWidth
                  onClick={handleDismantleBundle}
                  disabled={isLoading || dismantleQuantity === 0}
                  loading={isLoading}
                >
                  バンドル解除
                </PrimaryButton>
              </Box>
            </Box>
          </Box>
        </Card>
      </Box>
    </Modal>
  );
};

export default DismantleBundleModal;
