import { TransferInfo } from '@/app/auth/(dashboard)/stock/specialPriceStock/component/AddSpecialPriceStockModal/AddSpecialPriceStockModal';
import { SpecialPriceStockDetail } from '@/app/auth/(dashboard)/stock/specialPriceStock/component/AddSpecialPriceStockModal/SpecialPriceStockDetail/SpecialPriceStockDetail';
import { ReturnProductInfo } from '@/feature/item/components/search/ItemSearchLayout';
import { FilterOptions } from '@/feature/products/components/filters/FlexibleNarrowDownComponent';
import { ColumnVisibility } from '@/feature/products/components/searchTable/ProductDataTable';
import { SearchLayout } from '@/feature/products/components/searchTable/SearchLayout';
import { Grid, Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { MultipleProductModal } from '@/feature/products/components/MultipleProductModal';
import { ScanAddProductButton } from '@/feature/products/components/ScanAddProductButton';

interface Props {
  transferInfo: TransferInfo | undefined;
  setTransferInfo: React.Dispatch<
    React.SetStateAction<TransferInfo | undefined>
  >;
  setProductId: React.Dispatch<React.SetStateAction<number | undefined>>;
  isSelectedReset: boolean;
}

export interface SelectedData {
  productId: number; //商品を識別するためのID
  condition?: string; // 選択された状態
  ImageUrl?: string; //商品イメージ
  productName?: string; //商品名
  price?: number | null; // 価格
  count?: number; // 入力された数量
  maxCount?: number;
}

export const AddSpecialPriceStockModalContent = ({
  transferInfo,
  setTransferInfo,
  setProductId,
  isSelectedReset,
}: Props) => {
  const [selectedRows, setSelectedRows] = useState<SelectedData>();
  const [isMultipleProductModalOpen, setIsMultipleProductModalOpen] =
    useState(false);
  const [multipleProducts, setMultipleProducts] = useState<
    BackendProductAPI[0]['response']['200']['products']
  >([]);

  const handleAddMultipleProducts = (
    products: BackendProductAPI[0]['response']['200']['products'],
  ) => {
    setMultipleProducts(products);
  };

  // 実際の商品設定処理
  const setProductFromData = (
    product: BackendProductAPI[0]['response']['200']['products'][0],
  ) => {
    setSelectedRows({
      productId: product.id!,
      condition: product.condition_option_display_name,
      ImageUrl: product.image_url || '',
      productName: product.displayNameWithMeta,
      price: product.specific_sell_price ?? product.sell_price,
      count: 1,
      maxCount: product.stock_number || 0,
    });
    setProductId(product.id);
    setTransferInfo(undefined);
  };

  // サーチテーブルからの商品選択
  const setProduct = (productInfo: ReturnProductInfo[]) => {
    const currentProduct = productInfo[0]['product'];
    setProductFromData({ ...currentProduct, id: currentProduct.id! });
  };

  // スキャンからの商品追加
  const handleAddProductFromScan = async (
    product: BackendProductAPI[0]['response']['200']['products'][0],
  ) => {
    setProductFromData(product);
  };

  useEffect(() => {
    setProductId(selectedRows?.productId);
  }, [selectedRows?.productId, setProductId]);

  useEffect(() => {
    if (isSelectedReset) {
      setSelectedRows(undefined);
    }
  }, [isSelectedReset]);

  const columnVisibility: ColumnVisibility = {
    showCount: false,
  };

  const filterOptions: FilterOptions = { showConditionFilter: true };

  return (
    <>
      <Grid container columnSpacing={2} height="95%" mt={2}>
        {/* 左側 */}
        <Grid item xs={8} height="100%">
          <SearchLayout
            actionButtonText="追加"
            onClickActionButton={setProduct}
            columnVisibility={columnVisibility}
            filterOptions={filterOptions}
          />
        </Grid>

        {/* 右側 */}
        <Grid
          item
          xs={4}
          height="100%"
          sx={{
            flex: 3,
            minWidth: 0,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ mb: '12px' }}>
            <ScanAddProductButton
              handleOpenMultipleProductModal={() =>
                setIsMultipleProductModalOpen(true)
              }
              handleAddMultipleProducts={handleAddMultipleProducts}
              handleAddProductToResult={handleAddProductFromScan}
            />
          </Box>
          <SpecialPriceStockDetail
            selectedRows={selectedRows}
            transferInfo={transferInfo}
            setTransferInfo={setTransferInfo}
          />
        </Grid>
      </Grid>
      <MultipleProductModal
        open={isMultipleProductModalOpen}
        handleAddProductToResult={handleAddProductFromScan}
        onClose={() => setIsMultipleProductModalOpen(false)}
        multipleProducts={multipleProducts}
      />
    </>
  );
};
