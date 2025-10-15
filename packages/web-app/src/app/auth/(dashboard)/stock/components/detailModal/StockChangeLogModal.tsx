import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { ProductSearchState } from '@/feature/products/hooks/useNewProductSearch';
import { SelectedProductStockHistory } from '@/feature/stock/components/StockChangeLog/SelectedProductStockHistory';
import { StockChangeHistoryProductList } from '@/feature/stock/components/StockChangeLog/StockChangeHistoryProductList';
import { Box } from '@mui/material';
import { Product } from '@prisma/client';
import React, { useEffect } from 'react';

interface StockChangeHistoryProps {
  open: boolean;
  onClose: () => void;
  productId: number;
  searchState: ProductSearchState;
  setFormData: React.Dispatch<
    React.SetStateAction<Partial<Product> | undefined>
  >;
}

export const StockChangeLogModal: React.FC<StockChangeHistoryProps> = ({
  open,
  onClose,
  productId,
  searchState,
  setFormData,
}) => {
  useEffect(() => {
    setFormData(searchState.searchResults[0]);
    return () => {
      setFormData(undefined);
    };
  }, [searchState.searchResults]);

  return (
    <CustomModalWithIcon
      open={open}
      onClose={onClose}
      title={'在庫変換ログ'}
      width="90%"
      height="90%"
      cancelButtonText=""
      secondActionButtonText="在庫詳細へ戻る"
      onSecondActionButtonClick={onClose}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          gap: 2,
        }}
      >
        {/* 対象のプロダクトの表示 */}
        <SelectedProductStockHistory
          productId={productId}
          selectedProduct={searchState.searchResults}
          isLoading={searchState.isLoading}
        />
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          {/* 対象のプロダクトに対する在庫変動プロダクトのリスト */}
          <StockChangeHistoryProductList
            productId={productId}
            isComposing={searchState.isLoading}
          />
        </Box>
      </Box>
    </CustomModalWithIcon>
  );
};
