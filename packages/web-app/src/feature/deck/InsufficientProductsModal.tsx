'use client';
import { cardCondition } from '@/app/ec/(core)/constants/condition';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { InsufficientProduct } from '@/feature/deck/useDeckPurchaseOptionForm';
import { Modal, Stack, Typography, Box, Paper } from '@mui/material';
import Image from 'next/image';
import { RiCloseFill } from 'react-icons/ri';

interface Props {
  insufficientProducts: InsufficientProduct[];
  open: boolean;
  onClose: () => void;
}

export const InsufficientProductsModal = ({
  insufficientProducts,
  open,
  onClose,
}: Props) => {
  // item.idでグループ化し、insufficient_countを合計する
  const groupedProducts = insufficientProducts.reduce(
    (acc, product) => {
      const itemId = product.item?.id;
      if (!itemId) return acc;

      if (acc[itemId]) {
        // 既存のアイテムが存在する場合、insufficient_countを合計
        acc[itemId].insufficient_count += product.insufficient_count;
      } else {
        // 新しいアイテムの場合、そのまま追加
        acc[itemId] = { ...product };
      }

      return acc;
    },
    {} as Record<string, InsufficientProduct>,
  );

  // オブジェクトを配列に変換
  const mergedProducts = Object.values(groupedProducts);

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="unavailable-products-modal-title"
      aria-describedby="unavailable-products-modal-description"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        sx={{
          maxWidth: 600,
          maxHeight: '90vh',
          width: '90%',
          overflow: 'auto',
          outline: 'none',
          borderRadius: 4,
        }}
      >
        <Stack
          padding={2}
          direction="row"
          sx={{
            backgroundColor: 'primary.main',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ width: '24px' }} />
          <Typography
            color="white"
            variant="h4"
            textAlign="center"
            fontWeight="bold"
            id="unavailable-products-modal-title"
          >
            在庫が不足している商品がありました
          </Typography>
          <RiCloseFill
            color="white"
            onClick={() => {
              onClose();
            }}
            size={24}
            style={{ cursor: 'pointer' }}
          />
        </Stack>
        <Stack padding={3}>
          <Typography
            id="unavailable-products-modal-description"
            sx={{ mb: 3, fontWeight: 'bold' }}
          >
            以下のカードは、条件に合う在庫がありませんでした。
          </Typography>

          <Stack
            spacing={4}
            sx={{ mb: 3, maxHeight: '50vh', overflow: 'auto' }}
          >
            {mergedProducts.map((product, index) => (
              <Stack key={index} direction="row" spacing={2}>
                <Box sx={{ width: 80, height: 112, position: 'relative' }}>
                  <Image
                    src={product?.item?.full_image_url || ''}
                    alt={product?.item?.cardname || 'Card image'}
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                </Box>
                <Stack
                  spacing={0.5}
                  sx={{
                    flex: 1,
                    height: 112, // Match image height
                    justifyContent: 'space-between', // Distribute content evenly
                  }}
                >
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      {product?.item?.cardname || 'Unknown Card'}
                    </Typography>
                    <Typography variant="body1" color="gray" fontWeight="bold">
                      {product?.item?.expansion || ''}{' '}
                      {product?.item?.cardnumber || ''}
                    </Typography>
                    <Typography variant="body1" color="gray" fontWeight="bold">
                      {product?.item?.rarity || ''}
                    </Typography>
                  </Box>

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ marginTop: 'auto' }}
                  >
                    <Stack
                      border="1px solid black"
                      borderRadius={1}
                      padding={0.5}
                    >
                      <Typography variant="body1" fontWeight="bold">
                        {
                          cardCondition.find(
                            (condition) =>
                              condition.value ===
                              product?.condition_option?.handle,
                          )?.label
                        }
                      </Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight="bold">
                      不足数：{product?.insufficient_count || 0}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            ))}
          </Stack>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <PrimaryButton onClick={onClose} sx={{ width: '100%' }}>
              カートへ戻る
            </PrimaryButton>
          </Box>
        </Stack>
      </Paper>
    </Modal>
  );
};
