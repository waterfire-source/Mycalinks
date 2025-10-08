'use client';

import { useEffect, useMemo, useState } from 'react';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { useStore } from '@/contexts/StoreContext';
import {
  SetSetting,
  SetFormDataType,
} from '@/feature/stock/set/register/SetSetting/SetSetting';
import {
  useSetDeals,
  UseSetDealParams,
} from '@/feature/stock/set/hooks/useSetDeals';
import { CountableProductType } from '@/feature/stock/bundle/components/ProductCountSearchTable';
import dayjs from 'dayjs';
import { useGetSetByParams } from '@/feature/stock/bundle/hooks/useGetSetDealbyParams';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Stack } from '@mui/material';
import { ReturnProductInfo } from '@/feature/item/components/search/ItemSearchLayout';
import { SearchLayout } from '@/feature/products/components/searchTable/SearchLayout';
import { FilterOptions } from '@/feature/products/components/filters/FlexibleNarrowDownComponent';
import { PATH } from '@/constants/paths';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { MultipleProductModal } from '@/feature/products/components/MultipleProductModal';
import { ScanAddProductButton } from '@/feature/products/components/ScanAddProductButton';

const SetPage = () => {
  const { store } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  // クエリパラメータから編集モードかどうかを判定
  const setDealId = searchParams.get('id');
  const isEdit = !!setDealId;

  const { createSetDeal, updateSetDeal } = useSetDeals();
  const [selectedProducts, setSelectedProducts] = useState<
    CountableProductType[]
  >([]); // 選択された商品とその個数の情報を保持する
  const [isMultipleProductModalOpen, setIsMultipleProductModalOpen] =
    useState(false);
  const [multipleProducts, setMultipleProducts] = useState<
    BackendProductAPI[0]['response']['200']['products']
  >([]);

  // クエリパラメータからバンドル情報の初期値を取得
  const { setItem, products } = useGetSetByParams();

  // 編集モード用のデフォルト値処理
  const defaultBundleItem = useMemo(() => setItem, [setItem]);
  const defaultBundleProducts = useMemo(() => products, [products]);

  const handleAddMultipleProducts = (
    products: BackendProductAPI[0]['response']['200']['products'],
  ) => {
    setMultipleProducts(products);
  };

  // 初期値がある場合(クエリパラメータから取得したバンドル情報)は選択されたプロダクトのデフォルト値を設定
  useEffect(
    () => {
      if (defaultBundleItem && defaultBundleProducts) {
        const mappedProducts: CountableProductType[] =
          defaultBundleProducts.map((p) => {
            const itemBundleProduct = defaultBundleItem.products?.find(
              (pb) => pb.productID === p.id,
            );

            return {
              id: p.id,
              display_name: p.display_name,
              displayNameWithMeta: p.displayNameWithMeta,
              stock_number: itemBundleProduct?.itemCount || 0,
              sell_price: isEdit ? p.sell_price : p.actual_sell_price,
              specific_sell_price: p.specific_sell_price,
              condition: {
                id: p.condition_option_id,
                displayName: p.is_special_price_product
                  ? '特価在庫'
                  : p.condition_option_display_name,
              },
              image_url: p.image_url,
              expansion: p.item_expansion,
              cardnumber: p.item_cardnumber,
              rarity: p.item_rarity,
              isSpecialPriceProduct: p.is_special_price_product,
            };
          });
        setSelectedProducts(mappedProducts);
      }
    },
    isEdit
      ? [defaultBundleProducts]
      : [defaultBundleItem, defaultBundleProducts],
  );

  //実際の追加処理
  const addProductToResult = (
    product: BackendProductAPI[0]['response']['200']['products'][0],
    count: number,
  ) => {
    setSelectedProducts((prevSelectedProducts) => {
      const currentSelectedProducts = prevSelectedProducts || [];
      const existingProductIndex = currentSelectedProducts.findIndex(
        (p) => p.id === product.id,
      );

      let updatedSelectedProducts;
      if (existingProductIndex !== -1) {
        // 既に選択されている商品の場合
        updatedSelectedProducts = [...currentSelectedProducts];
        updatedSelectedProducts[existingProductIndex] = {
          ...updatedSelectedProducts[existingProductIndex],
          stock_number:
            (updatedSelectedProducts[existingProductIndex].stock_number || 0) +
            (count || 0),
        };
      } else {
        // 新規に選択された商品の場合
        const converted: CountableProductType = {
          id: product.id!,
          display_name: product.display_name,
          displayNameWithMeta: product.displayNameWithMeta,
          expansion: product.item_expansion,
          cardnumber: product.item_cardnumber,
          rarity: product.item_rarity,
          stock_number: count,
          real_stock_number: product.stock_number,
          sell_price: product.sell_price,
          specific_sell_price: product.specific_sell_price,
          condition: {
            id: product.condition_option_id,
            displayName: product.condition_option_display_name,
          },
          image_url: product.image_url,
          item_id: product.item_id,
          isSpecialPriceProduct: product.is_special_price_product,
        };

        updatedSelectedProducts = [...currentSelectedProducts, converted];
      }

      return updatedSelectedProducts;
    });
  };

  //サーチテーブルからの追加
  const handleAddProducts = (returnProduct: ReturnProductInfo[]) => {
    const newProduct = returnProduct[0].product;
    addProductToResult(
      { ...newProduct, id: newProduct.id! },
      returnProduct[0].count,
    );
  };

  //スキャンからの追加
  const handleAddProductFromScan = async (
    product: BackendProductAPI[0]['response']['200']['products'][0],
  ) => {
    addProductToResult(product, 1);
  };

  // 数量変更の処理
  const handleQuantityChange = (id: number, newQuantity: number) => {
    setSelectedProducts((prevSelectedProducts) => {
      const updatedSelectedProducts = prevSelectedProducts.map((product) => {
        if (product.id === id) {
          return {
            ...product,
            stock_number: newQuantity,
          };
        }
        return product;
      });

      return updatedSelectedProducts;
    });
  };

  // 商品削除のハンドラー
  const handleRemoveProduct = (productID: number) => {
    setSelectedProducts((prevSelectedProducts) => {
      const updatedSelectedProducts = prevSelectedProducts.filter(
        (product) => product.id !== productID,
      );

      return updatedSelectedProducts;
    });
  };

  // 割引値を計算する
  const calculateDiscount = (
    discount: number,
    discountUnit: string,
  ): string => {
    if (discount === 0) {
      return '0';
    } else if (discountUnit === 'JPY') {
      return `-${discount}`;
    } else {
      // 表記上で10%だった場合はAPIに渡すデータは90%になるので変換
      const absPercent = 100 - discount;
      return `${absPercent}%`;
    }
  };

  // 保存ボタンのハンドラー
  const handleSave = async (formData: SetFormDataType) => {
    if (formData.setName === undefined) {
      console.error('セット名が入力されていません');
      return;
    }

    // 編集モード時の追加バリデーション
    if (isEdit && !defaultBundleItem) {
      console.error('セットが取得できませんでした');
      return;
    }

    const baseSetData = {
      storeID: store.id,
      displayName: formData.setName,
      discountAmount: calculateDiscount(
        formData.discount ?? 0,
        formData.discountUnit,
      ),
      imageUrl: formData.imageUrl ?? '',
      startAt: formData.startAt ?? dayjs().tz().startOf('day').toDate(),
      expiredAt: formData.expiredAt ?? null,
      products: selectedProducts.map((product) => ({
        productID: product.id,
        itemCount: product.stock_number,
      })),
    };

    try {
      if (isEdit) {
        const updateData: UseSetDealParams['updateSetDeal'] = {
          ...baseSetData,
          setDealID: defaultBundleItem!.id,
        };
        await updateSetDeal(updateData);

        router.push(PATH.STOCK.bundle.root);
      } else {
        const createData: UseSetDealParams['createSetDeal'] = baseSetData;
        await createSetDeal(createData);

        router.push(PATH.STOCK.bundle.root);
      }
    } catch (e) {
      throw new Error('セットの保存中にエラーが発生しました');
    }
  };

  const filterOptions: FilterOptions = { showConditionFilter: true };

  // タイトルをモードに応じて変更
  const pageTitle = isEdit ? 'セット内容修正' : '新規セット作成';

  return (
    <ContainerLayout title={pageTitle} helpArchivesNumber={833}>
      <Stack direction="row" spacing={2} sx={{ width: '100%', height: '100%' }}>
        <Box sx={{ flex: 7, minWidth: 0 }}>
          <SearchLayout
            onClickActionButton={handleAddProducts}
            actionButtonText="追加"
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
              handleAddProductToResult={handleAddProductFromScan}
            />
          </Box>
          <SetSetting
            selectedProducts={selectedProducts}
            tableHeight="100%"
            onQuantityChange={handleQuantityChange}
            onRemoveProduct={handleRemoveProduct}
            onSave={handleSave}
            defaultSet={defaultBundleItem}
            isEdit={isEdit}
          />
        </Box>
      </Stack>
      <MultipleProductModal
        open={isMultipleProductModalOpen}
        handleAddProductToResult={handleAddProductFromScan}
        onClose={() => setIsMultipleProductModalOpen(false)}
        multipleProducts={multipleProducts}
      />
    </ContainerLayout>
  );
};

export default SetPage;
