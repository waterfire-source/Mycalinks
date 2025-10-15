import { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { Stack } from '@mui/material';

import { useStore } from '@/contexts/StoreContext';
import { createClientAPI } from '@/api/implement';
import { ArrivalItemsTable } from '@/feature/arrival/register/searchModal/contents/table/ItemsTable';
import { ArrivalProductsResult } from '@/feature/arrival/register/searchModal/contents/result/ArrivalProductsResult';
import {
  ArrivalItemType,
  ArrivalProductSearchType,
} from '@/feature/arrival/register/searchModal/type';
import {
  ItemSearchState,
  useItemSearch,
} from '@/feature/item/hooks/useItemSearch';
import { ProductCountSearchLayout } from '@/feature/products/components/searchTable/ProductCountSearchLayout';
import { useAlert } from '@/contexts/AlertContext';
import { CustomArrivalProductSearchType } from '@/app/auth/(dashboard)/arrival/register/page';
import { isOriginalProductCategory } from '@/feature/item/utils';
import { useGetSpecialty } from '@/feature/specialty/hooks/useGetSpecialty';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  width?: string | number;
  height?: string | number;
  setProducts: React.Dispatch<
    React.SetStateAction<CustomArrivalProductSearchType[]>
  >;
  products: CustomArrivalProductSearchType[];
}

export const ArrivalProductSearchTable = ({ setProducts, products }: Props) => {
  const { store } = useStore();

  // 検索状態を管理
  const { searchState, setSearchState, performSearch } = useItemSearch(
    store.id,
    {
      isActive: undefined,
      infinite_stock: false,
    },
  );

  const [allSearchResults, setAllSearchResults] = useState<ArrivalItemType[]>(
    [],
  );
  const { setAlertState } = useAlert();

  const clientAPI = createClientAPI();
  const { specialties, fetchSpecialty } = useGetSpecialty();
  useEffect(() => {
    fetchSpecialty();
  }, [fetchSpecialty]);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<
    number | undefined
  >(undefined);
  const [enableManagementNumber, setEnableManagementNumber] = useState(false);

  // 検索結果を更新するコールバック
  const addSearchResult = (searchState: ItemSearchState) => {
    // オリパや福袋などは表示しない
    const filteredResults = searchState.searchResultArray
      .filter((result) => !isOriginalProductCategory(result.category_handle))
      // 特価在庫、委託商品、管理番号がある商品は除外
      .map((result) => {
        return {
          ...result,
          products: result.products.filter(
            (product) =>
              !product.is_special_price_product &&
              product.management_number === null &&
              product.consignment_client_id === null,
          ),
        };
      });
    setAllSearchResults(filteredResults);
  };

  // 検索条件が変更されたときに検索結果をリセット
  const resetItems = () => {
    setAllSearchResults([]);
  };

  // 商品を追加する処理
  const handleAdd = async (
    product: ArrivalProductSearchType,
    arrivalCount: number,
    arrivalPrice: number,
  ): Promise<void> => {
    // 発注数が0以下の場合は追加しない
    if (arrivalCount <= 0) {
      setAlertState({
        message: `発注数が０以下です`,
        severity: 'error',
      });
      return;
    }

    const productsResponse = await clientAPI.product.listProducts({
      storeID: store.id,
      id: product.id || undefined,
    });

    if ('products' in productsResponse) {
      const filteredProducts = productsResponse.products.filter(
        // 特価在庫は削除
        (product) => !product.is_special_price_product,
      );

      //管理番号がある場合、無条件で追加(個数だけ)
      if (enableManagementNumber) {
        for (let i = 0; i < arrivalCount; i++) {
          const mappedProducts = filteredProducts.map(
            (product): CustomArrivalProductSearchType => ({
              customId: uuidv4(),
              //管理番号がある場合はnullで登録
              id: null,
              display_name: product.displayNameWithMeta,
              displayNameWithMeta: product.displayNameWithMeta,
              retail_price: product.retail_price,
              sell_price: product.actual_sell_price,
              buy_price: product.actual_buy_price,
              stock_number: product.stock_number,
              is_active: product.is_active,
              is_buy_only: product.is_buy_only,
              image_url: product.image_url,
              item_id: product.item_id,
              product_code: product.product_code,
              description: product.description,
              created_at: product.created_at,
              updated_at: product.updated_at,
              specialty_id: selectedSpecialtyId ?? null, // ここは選択肢た特殊状態があればその特殊状態で登録する
              management_number: product.management_number || '',
              condition_option_id: product.condition_option_id,
              condition_option_display_name:
                product.condition_option_display_name,
              item_infinite_stock: product.item_infinite_stock,
              arrivalCount: 1,
              arrivalPrice,
            }),
          );
          setProducts((prev) => {
            return [...prev, ...mappedProducts];
          });
        }
        return;
      }
      //ない場合、productIdが同じかつbuy_priceが同じかつ特殊状態が同じものは追加する(個数だけ)
      const existingIndex = products.findIndex((p) => {
        return (
          product.id === p.id &&
          arrivalPrice === p.arrivalPrice &&
          product.specialty_id === p.specialty_id &&
          product.management_number === p.management_number
        );
      });

      const mappedProducts = filteredProducts.map(
        (product): CustomArrivalProductSearchType => ({
          customId: uuidv4(),
          id: product.id,
          display_name: product.displayNameWithMeta,
          displayNameWithMeta: product.displayNameWithMeta,
          retail_price: product.retail_price,
          sell_price: product.actual_sell_price,
          buy_price: product.actual_buy_price,
          stock_number: product.stock_number,
          is_active: product.is_active,
          is_buy_only: product.is_buy_only,
          image_url: product.image_url,
          item_id: product.item_id,
          product_code: product.product_code,
          description: product.description,
          created_at: product.created_at,
          updated_at: product.updated_at,
          specialty_id: selectedSpecialtyId ?? null, // ここは選択肢た特殊状態があればその特殊状態で登録する
          management_number: product.management_number,
          condition_option_id: product.condition_option_id,
          condition_option_display_name: product.condition_option_display_name,
          item_infinite_stock: product.item_infinite_stock,
          arrivalCount,
          arrivalPrice,
        }),
      );

      //見つかれば個数を追加
      if (existingIndex !== -1) {
        setProducts((prev) => {
          const newProducts = [...prev];
          const prevArrivalCount =
            newProducts[existingIndex]?.arrivalCount || 0;
          const currentArrivalCount = mappedProducts[0]?.arrivalCount || 0;

          newProducts[existingIndex] = {
            ...newProducts[existingIndex],
            arrivalCount: prevArrivalCount + currentArrivalCount,
          };

          return newProducts;
        });
      } else {
        //見つからない場合新規追加
        setProducts((prev) => {
          return [...prev, ...mappedProducts];
        });
      }
    }
  };

  return (
    <Stack
      sx={{
        width: '100%',
        height: '100%',
      }}
      gap="12px"
      px="12px"
      direction="row"
    >
      {/* 商品検索テーブル */}
      <ProductCountSearchLayout
        width="100%"
        height="100%"
        searchState={searchState}
        setSearchState={setSearchState}
        onSearch={performSearch}
        leftWidth="65%"
        rightWidth="35%"
        contentsHeight="calc(100vh - 310px)"
        addSearchResult={addSearchResult}
        resetItems={resetItems}
        showSpecialtySelect={true}
        showManagementNumberCheck={true}
        specialties={specialties}
        selectedSpecialtyId={selectedSpecialtyId}
        setSelectedSpecialtyId={setSelectedSpecialtyId}
        enableManagementNumber={enableManagementNumber}
        setEnableManagementNumber={setEnableManagementNumber}
        tableComponent={(
          searchState: ItemSearchState,
          setSearchState: Dispatch<SetStateAction<ItemSearchState>>,
        ) => (
          <ArrivalItemsTable
            searchState={searchState}
            setSearchState={setSearchState}
            allSearchResults={allSearchResults}
            handleAdd={handleAdd}
            hasMore={searchState.searchResults.length > 0}
            enableManagementNumber={enableManagementNumber}
            selectedSpecialtyId={selectedSpecialtyId}
          />
        )}
        resultComponent={
          <ArrivalProductsResult
            products={products}
            setProducts={setProducts}
            specialties={specialties}
          />
        }
      />
    </Stack>
  );
};
