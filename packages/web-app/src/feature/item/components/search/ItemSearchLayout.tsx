import { useEffect, FC, useState } from 'react';
import { Box, Stack } from '@mui/material';
import { GenreTabComponent } from '@/components/tabs/GenreTabComponent';
import { useStore } from '@/contexts/StoreContext';
import {
  ItemSearchState,
  useItemSearch,
} from '@/feature/item/hooks/useItemSearch';
import {
  ItemDataTable,
  ColumnVisibility,
} from '@/feature/item/components/search/ItemDataTable';
import { ItemFilterComponent } from '@/feature/item/components/search/ItemFilterComponent';
import { ItemSearchComponent } from '@/feature/item/components/search/ItemSearchComponent';
import { BackendItemAPI } from '@/app/api/store/[store_id]/item/api';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { useCreateProduct } from '@/feature/products/hooks/useCreateProduct';
import { useAlert } from '@/contexts/AlertContext';
import { useProduct } from '@/app/auth/(dashboard)/ec/list/hooks/useProduct';
import { FilterOptions } from '@/feature/products/components/filters/FlexibleNarrowDownComponent';

export type ReturnProductInfo = {
  product: Omit<
    BackendProductAPI[0]['response']['200']['products'][0],
    'id'
  > & {
    id: number | undefined;
  };

  count: number;
  customFieldValues: Record<string, number>;
};

export type TableRow = BackendItemAPI[0]['response']['200']['items'][0] & {
  selectedSpecialtyId?: number;
  selectedConditionId?: number;
};

interface Props {
  filterOptions?: FilterOptions;
  columnVisibility?: ColumnVisibility;
  searchStateOption?: Partial<ItemSearchState>;
  actionButtonText?: string;
  onClickActionButton?: (items: ReturnProductInfo[]) => void;
  isAllStockRegister?: boolean;
}

export const ItemSearchLayout: FC<Props> = ({
  filterOptions,
  columnVisibility,
  onClickActionButton,
  actionButtonText,
  searchStateOption,
  isAllStockRegister,
}) => {
  const { store } = useStore();
  const { createProduct } = useCreateProduct();
  const { setAlertState } = useAlert();
  const { fetchProductById } = useProduct();

  const {
    searchState,
    setSearchState,
    performSearch,
    selectedFindOption,
    handleChangeFindOption,
  } = useItemSearch(store.id, {
    itemPerPage: 30,
    currentPage: 0,
    ...searchStateOption,
  });

  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [hasManagementNumber, setHasManagementNumber] = useState(false);

  //初期化
  useEffect(() => {
    //帰ってくるプロダクトのうち、純粋なプロダクトを基準にtableDataを作成
    const newData: TableRow[] = searchState.searchResults.map((result) => {
      const filter = result.products.filter(
        (p) =>
          !p.is_special_price_product &&
          !p.specialty_id &&
          p.management_number === null &&
          !p.consignment_client_id &&
          p.condition_option_id,
      );
      return {
        ...result,
        selectedConditionId: filter[0]?.condition_option_id ?? undefined, //純粋なプロダクトの中で最初の状態
        selectedSpecialtyId: tableData[0]?.selectedSpecialtyId, //特殊状態はページが変わっても引き継ぐ
      };
    });
    setTableData(newData);
  }, [searchState.searchResults]);

  useEffect(() => {
    if (searchState.selectedGenreId !== null) {
      performSearch(true);
    }
  }, [
    searchState.selectedGenreId,
    searchState.selectedCategoryId,
    searchState.searchName,
    searchState.rarity,
    searchState.expansion,
    searchState.cardnumber,
    searchState.tag,
    searchState.isActive,
    searchState.category,
    searchState.orderBy,
    searchState.isBuyOnly,
    selectedFindOption,
    store.id,
  ]);

  //アクションボタンがクリックされた時の処理
  //選択された特殊状態がないなら作成して
  //管理番号が入力されているならproductIdを""にしてidを消す
  //上記の処理を通したproductを渡されたonClickActionButtonの引数に渡す
  const handleClickAction = async (
    data: TableRow,
    count: number,
    customFieldValues: Record<string, number>,
  ) => {
    let finalProducts: ReturnProductInfo['product'][] | undefined;

    //特殊状態あるかどうか判別
    const targetProduct = data.products.find(
      (p) =>
        p.condition_option_id === data.selectedConditionId &&
        p.specialty_id === (data.selectedSpecialtyId ?? null) &&
        !p.management_number &&
        !p.consignment_client_id &&
        !p.is_special_price_product,
    );

    //ないなら作る
    if (!targetProduct) {
      if (!store?.id) {
        setAlertState({
          message: '店舗情報が取得できませんでした',
          severity: 'error',
        });
        return;
      }

      try {
        const createdProduct = await createProduct({
          storeId: store.id,
          itemId: data.id,
          requestBody: {
            condition_option_id: data.selectedConditionId ?? -1,
            specialty_id: data.selectedSpecialtyId || undefined,
          },
        });

        const productDetail = await fetchProductById(
          createdProduct?.id || -1,
          store.id,
        );

        if (productDetail) {
          finalProducts = [productDetail];
        }

        setAlertState({
          message: '特殊状態の作成に成功しました',
          severity: 'success',
        });

        performSearch(true);
      } catch (error) {
        setAlertState({
          message: '特殊状態の作成に失敗しました',
          severity: 'error',
        });
        return;
      }
    } else {
      const productDetail = await fetchProductById(targetProduct.id, store.id);
      if (productDetail) finalProducts = [productDetail];
    }

    //管理番号を入力する場合
    //countの数だけ複製し
    //managementNumberを付与
    //idをundefinedへ
    if (hasManagementNumber && finalProducts) {
      finalProducts = Array.from({ length: count }, () => {
        const clone = structuredClone(finalProducts![0]);
        clone.management_number = '';
        clone.id = undefined;
        return clone;
      });
    }

    if (!finalProducts) return;

    if (onClickActionButton) {
      onClickActionButton(
        finalProducts.map((p) => {
          const actualCount = hasManagementNumber
            ? 1
            : isAllStockRegister
            ? p.stock_number
            : count;
          return {
            product: p,
            count: actualCount,
            customFieldValues: customFieldValues,
          };
        }),
      );
    }
  };

  //特定のモードの時にデフォルトのために使用するオプション
  let modeFilterOptions: FilterOptions = {};
  let modeColumnVisibility: ColumnVisibility = {};

  if (filterOptions) {
    modeFilterOptions = { ...modeFilterOptions, ...filterOptions };
  }

  if (columnVisibility) {
    modeColumnVisibility = { ...modeColumnVisibility, ...columnVisibility };
  }

  return (
    <Stack
      sx={{
        flex: 1,
        minHeight: 0,
        gap: 1,
        height: '100%',
      }}
    >
      <ItemSearchComponent setSearchState={setSearchState} />
      <GenreTabComponent setSearchState={setSearchState} />
      <Stack sx={{ backgroundColor: 'white', flex: 1, minHeight: 0 }}>
        <ItemFilterComponent
          setItemSearchState={setSearchState}
          searchState={searchState}
          storeId={store.id}
          setTableData={setTableData}
          selectedFindOption={selectedFindOption}
          handleChangeFindOption={handleChangeFindOption}
          hasManagementNumber={hasManagementNumber}
          setHasManagementNumber={setHasManagementNumber}
          filterOptions={modeFilterOptions}
        />
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <ItemDataTable
            searchState={searchState}
            setSearchState={setSearchState}
            tableData={tableData}
            setTableData={setTableData}
            columnVisibility={modeColumnVisibility}
            onClickAction={handleClickAction}
            actionButtonText={actionButtonText}
          />
        </Box>
      </Stack>
    </Stack>
  );
};
