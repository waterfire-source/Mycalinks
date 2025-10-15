import React from 'react';
import { Box, Typography } from '@mui/material';
import { CardTable } from '@/feature/stock/bundle/components/SelectedProductsCard/components/CardTable';
import { CountableProductType } from '@/feature/stock/bundle/components/ProductCountSearchTable';

// コンポーネントのプロップス型定義
interface SelectedProductsCardProps {
  products: CountableProductType[];
  showNumOfItems?: boolean; // 商品数を表示するか
  showAmount?: boolean; // 金額を表示するか
  height?: string;
  title?: string;
  onRemoveProduct?: (productId: number) => void;
  handleAddProducts?: (productId: number, newStock: number) => void;
  canEditProducts?: boolean;
}

// SelectedProductsCardコンポーネント
const SelectedProductsCard: React.FC<SelectedProductsCardProps> = ({
  products,
  showNumOfItems = false,
  showAmount = showNumOfItems,
  title,
  height = 'auto',
  onRemoveProduct,
  handleAddProducts,
  canEditProducts = true,
}) => {
  return (
    <Box
      sx={{
        width: '100%',
        height: height,
        maxHeight: height,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* ヘッダー部分 */}
      {title && (
        <Typography
          variant="h6"
          sx={{
            textAlign: 'center',
            bgcolor: 'primary.main',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
          }}
        >
          {title}
        </Typography>
      )}
      {showNumOfItems && products ? (
        <>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid',
              borderColor: 'grey.300',
              paddingX: 2,
              paddingY: 1,
              height: '35px',
            }}
          >
            <Typography variant="body1">
              合計{' '}
              <Typography
                variant="h6"
                component="span"
                sx={{ fontSize: '1rem' }}
              >
                {products.reduce(
                  (total, product) => total + (product.stock_number || 0),
                  0,
                )}
                点（{products.length}商品）
              </Typography>
            </Typography>
            {showAmount && (
              <Typography variant="body1">
                販売価格合計{' '}
                <Typography
                  variant="h6"
                  component="span"
                  sx={{ fontSize: '1rem' }}
                >
                  {products
                    .reduce(
                      (total, product) =>
                        total +
                        (product.specific_sell_price
                          ? product.specific_sell_price
                          : product.sell_price || 0) *
                          product.stock_number,
                      0,
                    )
                    .toLocaleString()}
                  円
                </Typography>
              </Typography>
            )}
          </Box>
        </>
      ) : null}

      {/* 商品リスト部分 */}
      <CardTable
        products={products}
        onRemoveProduct={onRemoveProduct}
        handleAddProducts={handleAddProducts}
        canEditProducts={canEditProducts}
      />
    </Box>
  );
};

export default SelectedProductsCard;
