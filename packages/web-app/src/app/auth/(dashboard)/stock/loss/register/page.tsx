'use client';

import React, { useState } from 'react';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { SelectedProductsList } from '@/app/auth/(dashboard)/stock/loss/register/components/selectedProducts/SelectedProductsList';

import { LossRegisterProductType } from '@/app/auth/(dashboard)/stock/loss/register/components/LossProductType';

import { ReturnProductInfo } from '@/feature/item/components/search/ItemSearchLayout';
import { Box, Stack } from '@mui/material';
import { SearchLayout } from '@/feature/products/components/searchTable/SearchLayout';
import { ColumnVisibility } from '@/feature/products/components/searchTable/ProductDataTable';
import { FilterOptions } from '@/feature/products/components/filters/FlexibleNarrowDownComponent';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { ScanAddProductButton } from '@/feature/products/components/ScanAddProductButton';
import { MultipleProductModal } from '@/feature/products/components/MultipleProductModal';
export interface TableRow {
  id: number;
  productName: string;
  productId: number;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  category: string;
  discount: number;
  stockNumber: number;
}

const LossRegisterPage: React.FC = () => {
  const [lossProducts, setLossProducts] = useState<LossRegisterProductType[]>(
    [],
  );
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

  const addProductToLossList = (
    product: BackendProductAPI[0]['response']['200']['products'][0],
    count: number,
  ) => {
    setLossProducts((prev) => {
      const convertedLossProduct: LossRegisterProductType = {
        id: product.id!,
        displayName: product.display_name,
        displayNameWithMeta: product.displayNameWithMeta,
        imageUrl: product.image_url,
        stockNumber: product.stock_number,
        expansion: product.item_expansion,
        cardnumber: product.item_cardnumber,
        rarity: product.item_rarity,
        buyPrice: product.buy_price,
        specificSellPrice: product.specific_sell_price,
        condition: {
          id: product.condition_option_id,
          displayName: product.condition_option_display_name,
        },
        count: Math.min(count, product.stock_number),
        arrivalPrice: undefined,
      };
      // 既存商品を検索
      const existingProductIndex = prev.findIndex(
        (existingProduct) => existingProduct.id === convertedLossProduct.id,
      );

      if (existingProductIndex !== -1) {
        // 既存の商品が見つかった場合、countを追加
        return prev.map((existingProduct, index) =>
          index === existingProductIndex
            ? {
                ...existingProduct,
                count:
                  (existingProduct.count || 0) +
                  (convertedLossProduct.count || 0),
              }
            : existingProduct,
        );
      } else {
        // 新しい商品の場合、配列に追加
        return [...prev, convertedLossProduct];
      }
    });
  };

  const handleAddLossProductFromScan = async (
    product: BackendProductAPI[0]['response']['200']['products'][0],
  ) => {
    addProductToLossList(product, 1);
  };

  const handleAddLossProductFromSearch = (returnInfo: ReturnProductInfo[]) => {
    if (!returnInfo.length) return;
    const targetProduct = returnInfo[0]['product'];
    addProductToLossList(
      { ...targetProduct, id: targetProduct.id! },
      returnInfo[0].count,
    );
  };

  const columnVisibility: ColumnVisibility = { showSellPrice: false };
  const filterOptions: FilterOptions = { showConditionFilter: true };

  return (
    <>
      <ContainerLayout title="ロス登録" helpArchivesNumber={728}>
        <Stack
          direction="row"
          spacing={2}
          sx={{ width: '100%', height: '100%' }}
        >
          <Box sx={{ flex: 7, minWidth: 0 }}>
            <SearchLayout
              actionButtonText="追加"
              onClickActionButton={handleAddLossProductFromSearch}
              columnVisibility={columnVisibility}
              filterOptions={filterOptions}
            />
          </Box>
          <Box
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
                handleAddProductToResult={handleAddLossProductFromScan}
              />
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <SelectedProductsList
                lossProducts={lossProducts}
                setLossProducts={setLossProducts}
              />
            </Box>
          </Box>
        </Stack>
        <MultipleProductModal
          open={isMultipleProductModalOpen}
          handleAddProductToResult={handleAddLossProductFromScan}
          onClose={() => setIsMultipleProductModalOpen(false)}
          multipleProducts={multipleProducts}
        />
      </ContainerLayout>
    </>
  );
};

export default LossRegisterPage;
