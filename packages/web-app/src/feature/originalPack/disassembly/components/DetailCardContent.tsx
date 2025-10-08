import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import {
  OriginalPackItemType,
  OriginalPackProduct,
} from '@/app/auth/(dashboard)/original-pack/page';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { useConfirmationModal } from '@/contexts/ConfirmationModalContext';

interface DetailCardContentProps {
  originalPack: OriginalPackItemType | null;
  originalPackProducts: OriginalPackProduct[];
  numberOfDisassemblyItems: number;
  setNumberOfDisassemblyItems: (value: number) => void;
}
export const DetailCardContent: React.FC<DetailCardContentProps> = ({
  originalPack,
  originalPackProducts,
  numberOfDisassemblyItems,
  setNumberOfDisassemblyItems,
}: DetailCardContentProps) => {
  // 画面遷移確認モーダル表示の制御
  const { setModalVisible } = useConfirmationModal();
  // 解体後の合計商品数
  const numberOfIncludedItems = useMemo(() => {
    const uniqueItemIds = new Set(
      originalPack?.original_pack_products?.map(
        (product) => product.product_id,
      ) ?? [],
    );
    return uniqueItemIds.size;
  }, [originalPack]);

  // 解体後の合計在庫数
  const numberOfIncludedProducts = useMemo(() => {
    return originalPackProducts.reduce(
      (acc, product) => acc + product.item_count,
      0,
    );
  }, [originalPackProducts]);

  // 解体商品の作成時仕入れ値合計
  const totalWholesalePrice = useMemo(() => {
    return originalPackProducts.reduce(
      (acc, product) => acc + product.mean_wholesale_price * product.item_count,
      0,
    );
  }, [originalPackProducts]);

  // 解体前の販売額合計
  const totalSellPriceBeforeDisassemble = useMemo(() => {
    if (!originalPack) return 0;
    return originalPack.sell_price * numberOfDisassemblyItems;
  }, [originalPack, numberOfDisassemblyItems]);

  // 解体後商品の販売額合計
  const totalSellPriceAfterDisassemble = useMemo(() => {
    return originalPackProducts.reduce(
      (acc, product) => acc + (product.sell_price ?? 0) * product.item_count,
      0,
    );
  }, [originalPackProducts]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        pt: 2,
        px: 2,
        pb: 1,
        overflow: 'auto',
        width: '100%',
        gap: 3,
      }}
    >
      {/* 解体数 */}
      {Number(originalPack?.products_stock_number) > 0 && (
        <Box sx={{ width: '100%' }}>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
              <Typography variant="body1">解体数</Typography>
              <Typography
                variant="caption"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'grey.300',
                  color: 'black',
                  borderRadius: '2px',
                  px: '4px',
                  py: '2px',
                }}
              >
                必須
              </Typography>
            </Box>
            <Box sx={{ width: '100%' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  gap: 1,
                }}
              >
                <Box sx={{ width: '30%' }}>
                  <Box sx={{ mx: 2 }}>
                    <NumericTextField
                      value={numberOfDisassemblyItems}
                      max={originalPack?.products_stock_number ?? 0}
                      onChange={(e) => {
                        setNumberOfDisassemblyItems(e);
                        setModalVisible(true);
                      }}
                      size="small"
                    />
                  </Box>
                </Box>
                <Box sx={{ width: '70%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'start' }}>
                    <Typography variant="caption">
                      （{originalPack?.products_stock_number} →{' '}
                      {(originalPack?.products_stock_number ?? 0) -
                        numberOfDisassemblyItems}
                      ）
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* 解体後の合計商品数 */}
      <Box sx={{ width: '100%' }}>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Typography variant="body1">解体後の合計商品数</Typography>
          <Box sx={{ mx: 2 }}>
            <Typography variant="body1">
              {numberOfIncludedItems.toLocaleString()}商品{' '}
              {numberOfIncludedProducts.toLocaleString()}点
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* 解体商品の作成時仕入れ値合計 */}
      <Box sx={{ width: '100%' }}>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Typography variant="body1">解体商品の作成時仕入れ値合計</Typography>
          <Box sx={{ mx: 2 }}>
            <Typography variant="body1">
              {totalWholesalePrice.toLocaleString()}円
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* 解体前の販売額合計 */}
      <Box sx={{ width: '100%' }}>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Typography variant="body1">解体前の販売額合計</Typography>
          <Box sx={{ mx: 2 }}>
            <Typography variant="body1">
              {totalSellPriceBeforeDisassemble.toLocaleString()}円
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* 解体後商品の販売額合計 */}
      <Box sx={{ width: '100%' }}>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Typography variant="body1">解体後商品の販売額合計</Typography>
          <Box sx={{ mx: 2 }}>
            <Typography variant="body1">
              {totalSellPriceAfterDisassemble.toLocaleString()}円
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
