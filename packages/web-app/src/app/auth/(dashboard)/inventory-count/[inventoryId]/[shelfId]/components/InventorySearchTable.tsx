import { CartItem } from '@/app/auth/(dashboard)/inventory-count/[inventoryId]/[shelfId]/components/InventoryAddModal';
import { InventorySearchResultTableContent } from '@/app/auth/(dashboard)/inventory-count/[inventoryId]/[shelfId]/components/InventorySearchResultTableContent';
import { useAlert } from '@/contexts/AlertContext';
import { useCategory } from '@/feature/category/hooks/useCategory';
import { ProductSearchState } from '@/feature/products/hooks/useNewProductSearch';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

type Props = {
  searchState: ProductSearchState;
  setSearchState: Dispatch<SetStateAction<ProductSearchState>>;
  setAddCart: Dispatch<SetStateAction<CartItem[]>>;
};

export type Row = {
  rowId: number;
  productId: number;
  productImage: string | null;
  productName: string;
  status: string;
  sellPrice: number;
  quantity: number;
  stock: number;
};

export const InventorySearchResultTable = ({
  searchState,
  setSearchState,
  setAddCart,
}: Props) => {
  const { setAlertState } = useAlert();
  const { cardConditionOptions, fetchCategoryList } = useCategory();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    fetchCategoryList();
  }, []);
  // ページ変更時
  const handlePageChange = (newPage: number) => {
    setSearchState((prev) => ({
      ...prev,
      currentPage: newPage,
    }));
  };

  // 件数変更時
  const handlePageSizeChange = (newSize: number) => {
    setSearchState((prev) => ({
      ...prev,
      itemsPerPage: newSize,
      currentPage: 0, // ページサイズ変更時は1ページ目に戻す
    }));
  };

  // rows生成（ソート付き）
  useEffect(() => {
    const sortedResults = [...searchState.searchResults].sort((a, b) => {
      if (a.displayNameWithMeta === b.displayNameWithMeta) {
        const aOrderNumber =
          cardConditionOptions?.find((c) => c.id === a.condition_option_id)
            ?.order_number || 0;
        const bOrderNumber =
          cardConditionOptions?.find((c) => c.id === b.condition_option_id)
            ?.order_number || 0;

        return aOrderNumber - bOrderNumber; // 昇順ソート
      }

      return 0;
    });

    const updatedRows: Row[] = sortedResults.map((product, index) => ({
      rowId: index,
      productId: product.id,
      productImage: product.image_url,
      productName: product.displayNameWithMeta,
      status: product.condition_option_display_name,
      sellPrice: product.sell_price || 0,
      quantity: 1,
      stock: product.stock_number,
    }));
    setRows(updatedRows);
  }, [searchState.searchResults, cardConditionOptions]);

  const handleClickAddButton = (rowId: number) => {
    const matchingRow = rows.find((row) => row.rowId === rowId);
    if (!matchingRow)
      return setAlertState({
        message: 'rowが見つかりません',
        severity: 'error',
      });

    const targetProduct = searchState.searchResults.find(
      (result) => matchingRow.productId === result.id,
    );
    if (!targetProduct)
      return setAlertState({
        message: '指定されたプロダクトが見つかりません',
        severity: 'error',
      });

    setAddCart((prev) => {
      const cartId = uuidv4();
      return [
        ...prev,
        {
          ...targetProduct,
          cart_item_id: cartId,
          count: matchingRow.quantity,
        },
      ];
    });
  };

  const handleChangeQuantity = (rowId: number, count: number) => {
    setRows((prev) =>
      prev.map((row) =>
        row.rowId === rowId ? { ...row, quantity: count } : row,
      ),
    );
  };

  return (
    <InventorySearchResultTableContent
      searchState={searchState}
      setSearchState={setSearchState}
      rows={rows}
      setRows={setRows}
      handleChangeQuantity={handleChangeQuantity}
      handleClickAddButton={handleClickAddButton}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
    />
  );
};
