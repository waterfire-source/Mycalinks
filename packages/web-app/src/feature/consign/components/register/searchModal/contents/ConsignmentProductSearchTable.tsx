import { Stack } from '@mui/material';
import { ConsignmentProductsResult } from '@/feature/consign/components/register/searchModal/contents/result/ConsignmentProductsResult';
import { ConsignmentProductSearchType } from '@/feature/consign/components/register/searchModal/type';
import {
  ItemSearchLayout,
  ReturnProductInfo,
} from '@/feature/item/components/search/ItemSearchLayout';
import { ColumnVisibility } from '@/feature/item/components/search/ItemDataTable';
import { FilterOptions } from '@/feature/item/components/search/ItemFilterComponent';
import { v4 } from 'uuid';
interface Props {
  width?: string | number;
  height?: string | number;
  setProducts: React.Dispatch<
    React.SetStateAction<ConsignmentProductSearchType[]>
  >;
  products: ConsignmentProductSearchType[];
  unregisteredProductButton?: React.ReactNode;
  isRefetchItem: boolean;
}

export const ConsignmentProductSearchTable = ({
  setProducts,
  products,
  unregisteredProductButton,
  isRefetchItem,
}: Props) => {
  const addProduct = (returnInfo: ReturnProductInfo[]) => {
    setProducts((prev) => {
      const converted: ConsignmentProductSearchType[] = returnInfo.map(
        (info) => {
          const product = info.product;
          return {
            customId: v4(),
            id: product.id!,
            item_id: product.item_id,
            display_name: product.display_name,
            displayNameWithMeta: product.displayNameWithMeta,
            retail_price: product.retail_price ?? 0,
            sell_price: product.actual_sell_price ?? 0,
            buy_price: product.actual_buy_price ?? 0,
            stock_number: product.stock_number ?? 0,
            is_active: product.is_active,
            is_buy_only: product.is_buy_only,
            image_url: product.image_url,
            product_code: String(product.product_code),
            description: product.description ?? '',
            created_at: product.created_at.toString(),
            updated_at: product.updated_at.toString(),
            specialty_id: product.specialty_id,
            management_number: product.management_number,
            condition_option_id: product.condition_option_id,
            condition_option_display_name:
              product.condition_option_display_name,
            item_infinite_stock: product.item_infinite_stock,
            consignmentCount: info.count,
            consignmentPrice: info.customFieldValues['consignPrice'],
          };
        },
      );

      return [...prev, ...converted];
    });
  };

  const filterOptions: FilterOptions = {
    showManagementCheckBox: true,
    showSpecialtyFilter: true,
  };
  const columnVisibility: ColumnVisibility = {
    showTotalStockNumber: false,
    showSellPrice: false,
    showBuyPrice: false,
    inputFields: [
      {
        headerName: '委託価格',
        columnName: 'consignPrice',
        suffix: '円',
        minWidth: 120,
      },
    ],
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
      <Stack flex={7} minWidth={0}>
        <ItemSearchLayout
          filterOptions={filterOptions}
          columnVisibility={columnVisibility}
          onClickActionButton={addProduct}
        />
      </Stack>
      <Stack flex={3} minWidth={0} gap={1}>
        {unregisteredProductButton}
        <ConsignmentProductsResult
          products={products}
          setProducts={setProducts}
        />
      </Stack>
    </Stack>
  );
};
