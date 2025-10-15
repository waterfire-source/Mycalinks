'use client';

import { useEffect, useMemo, useState } from 'react';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { useStore } from '@/contexts/StoreContext';

import { BundleSetting } from '@/feature/stock/bundle/register/BundleSetting/BundleSetting';
import { BundleFormDataType } from '@/feature/stock/bundle/register/BundleSetting/BundleSetting';
import { useBundles } from '@/feature/stock/bundle/hooks/useBundles';

import { ItemAPI } from '@/api/frontend/item/api';
import { CountableProductType } from '@/feature/stock/bundle/components/ProductCountSearchTable';

import { useAlert } from '@/contexts/AlertContext';
import { useGetBundleByParams } from '@/feature/stock/bundle/hooks/useGetBundleByParams';
import { Box, Stack } from '@mui/material';
import { ReturnProductInfo } from '@/feature/item/components/search/ItemSearchLayout';
import { SearchLayout } from '@/feature/products/components/searchTable/SearchLayout';
import { FilterOptions } from '@/feature/products/components/filters/FlexibleNarrowDownComponent';
import { useRouter, useSearchParams } from 'next/navigation';
import { PATH } from '@/constants/paths';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { MultipleProductModal } from '@/feature/products/components/MultipleProductModal';
import { ScanAddProductButton } from '@/feature/products/components/ScanAddProductButton';

const BundleRegisterPage = () => {
  const { store } = useStore();
  const { createBundle, updateBundle } = useBundles();
  const { setAlertState } = useAlert();
  const { push } = useRouter();
  const searchParams = useSearchParams();

  // クエリパラメータから編集モードかどうかを判定
  const bundleId = searchParams.get('id');
  const isEdit = !!bundleId;

  // クエリパラメータからバンドル情報の初期値を取得
  const { bundleItem: defaultBundleItem, products: defaultBundleProducts } =
    useGetBundleByParams();

  const [selectedProducts, setSelectedProducts] = useState<
    CountableProductType[]
  >([]); // 選択された商品とその個数の情報を保持する
  const [isMultipleProductModalOpen, setIsMultipleProductModalOpen] =
    useState(false);
  const [multipleProducts, setMultipleProducts] = useState<
    BackendProductAPI[0]['response']['200']['products']
  >([]);

  // 編集モード用のデフォルト値処理
  const bundleItem = useMemo(() => defaultBundleItem, [defaultBundleItem]);

  const handleAddMultipleProducts = (
    products: BackendProductAPI[0]['response']['200']['products'],
  ) => {
    setMultipleProducts(products);
  };

  // 初期値がある場合(クエリパラメータから取得したバンドル情報)は選択されたプロダクトのデフォルト値を設定
  useEffect(() => {
    if (defaultBundleItem && defaultBundleProducts) {
      const products: CountableProductType[] = defaultBundleProducts.map(
        (p) => {
          const itemBundleProduct =
            defaultBundleItem.bundle_item_products?.find(
              (pb) => pb.product_id === p.id,
            );
          return {
            id: p.id,
            display_name: p.display_name,
            displayNameWithMeta: p.displayNameWithMeta,
            stock_number: itemBundleProduct?.item_count || 0,
            sell_price: p.actual_sell_price,
            specific_sell_price: p.specific_sell_price,
            condition: {
              id: p.condition_option_id,
              displayName: p.condition_option_display_name,
            },
            image_url: p.image_url,
            expansion: p.item_expansion,
            cardnumber: p.item_cardnumber,
            rarity: p.item_rarity,
            isSpecialPriceProduct: p.is_special_price_product,
          };
        },
      );
      setSelectedProducts(products);
    }
  }, [defaultBundleItem, defaultBundleProducts]);

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

  // 商品削除のハンドラー
  const handleRemoveProduct = (productID: number) => {
    setSelectedProducts((prevSelectedProducts) => {
      const updatedSelectedProducts = prevSelectedProducts.filter(
        (product) => product.id !== productID,
      );

      return updatedSelectedProducts;
    });
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

  // 保存ボタンのハンドラー
  const handleSave = async (formData: BundleFormDataType) => {
    if (formData.sellPrice === null) {
      console.error('売価が入力されていません');
      setAlertState({
        message: '売価が入力されていません',
        severity: 'error',
      });
      return;
    } else if (formData.bundleStockNumber === null) {
      console.error('バンドル数が入力されていません');
      setAlertState({
        message: 'バンドル数が入力されていません',
        severity: 'error',
      });
      return;
    } else if (formData.bundleName === null) {
      console.error('バンドル名が入力されていません');
      setAlertState({
        message: 'バンドル名が入力されていません',
        severity: 'error',
      });
      return;
    }

    // 編集モード時の追加バリデーション
    if (isEdit && !bundleItem) {
      console.error('編集対象のバンドル情報が見つかりません');
      setAlertState({
        message: '編集対象のバンドル情報が見つかりません',
        severity: 'error',
      });
      return;
    }

    const baseData = {
      storeID: store.id,
      sellPrice: formData.sellPrice,
      initStockNumber: formData.bundleStockNumber,
      displayName: formData.bundleName,
      startAt: formData.startAt || new Date(),
      expiredAt: formData.expiredAt,
      imageUrl: formData.imageUrl,
      genreID: formData.genreID,
      products: selectedProducts.map((product) => ({
        productID: product.id,
        itemCount: product.stock_number,
      })),
    };

    try {
      if (isEdit) {
        const updateData: ItemAPI['updateBundle']['request'] = {
          ...baseData,
          id: bundleItem!.id,
        };
        await updateBundle(updateData);

        push(PATH.STOCK.bundle.root);
      } else {
        const createData: ItemAPI['createBundle']['request'] = baseData;
        await createBundle(createData);

        push(PATH.STOCK.bundle.root);
      }
    } catch (e) {
      throw new Error('バンドルの作成に失敗しました。');
    }
  };

  const filterOptions: FilterOptions = { showConditionFilter: true };

  // タイトルをモードに応じて変更
  const pageTitle = isEdit ? 'バンドル内容編集' : '新規バンドル作成';

  return (
    <ContainerLayout title={pageTitle} helpArchivesNumber={859}>
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
          <BundleSetting
            selectedProducts={selectedProducts}
            onQuantityChange={handleQuantityChange}
            onRemoveProduct={handleRemoveProduct}
            onSave={handleSave}
            defaultBundleItem={bundleItem}
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

export default BundleRegisterPage;
