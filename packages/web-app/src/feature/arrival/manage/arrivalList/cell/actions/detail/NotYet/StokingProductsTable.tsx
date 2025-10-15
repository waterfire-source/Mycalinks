import { Box, Stack, Typography } from '@mui/material';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { BackendStockingAPI } from '@/app/api/store/[store_id]/stocking/api';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { useLabelPrinterHistory } from '@/contexts/LabelPrinterContext';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ColumnDef, CustomTable } from '@/components/tables/CustomTable';
import { ItemText } from '@/feature/item/components/ItemText';
import { StockingStatus } from '@prisma/client';
import { ConditionChip } from '@/feature/products/components/ConditionChip';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { useRouter } from 'next/navigation';
import { PATH } from '@/constants/paths';
import { useFetchProducts } from '@/feature/arrival/hooks/useFetchProducts';
import { useUpdateProduct } from '@/feature/products/hooks/useUpdateProduct';
import { EditManagementNumberField } from '@/components/inputFields/EditManagementNumberField';
import { CustomArrivalProductSearchType } from '@/app/auth/(dashboard)/arrival/register/page';
interface Props {
  isFromStoreShipment: boolean;
  editStocking: BackendStockingAPI[5]['response']['200'][0];
  setEditStocking: Dispatch<
    SetStateAction<BackendStockingAPI[5]['response']['200'][0]>
  >;
}

export const StockingProductsTable = ({
  isFromStoreShipment,
  editStocking,
  setEditStocking,
}: Props) => {
  const { fetchProducts, isLoading } = useFetchProducts();
  const { updateProduct, isLoadingUpdateProduct } = useUpdateProduct();
  const { pushQueue } = useLabelPrinterHistory();
  const { push } = useRouter();
  const handleEdit = (
    id: number,
    key: 'unit_price' | 'planned_item_count',
    value: number,
  ) => {
    setEditStocking((prev) => {
      const updatedProducts = prev.stocking_products.map((product) =>
        product.id === id ? { ...product, [key]: value } : product,
      );
      return { ...prev, stocking_products: updatedProducts };
    });
  };

  // 仕入れ商品
  const stockingProducts = editStocking.stocking_products;

  const [products, setProducts] = useState<CustomArrivalProductSearchType[]>(
    [],
  );
  const fetch = async () => {
    const productsData = await fetchProducts(editStocking);
    if (!productsData) return;
    setProducts(productsData.products);
  };
  useEffect(() => {
    fetch();
  }, [editStocking]);

  const handleEditStocking = () => {
    if (stockingProducts.length === 0) return;
    const isTaxIncluded = stockingProducts[0].unit_price;
    if (isTaxIncluded !== null && isTaxIncluded !== undefined) {
      push(`${PATH.ARRIVAL.register}?tax=include&id=${editStocking.id}`);
      return;
    }
    push(`${PATH.ARRIVAL.register}?tax=exclude&id=${editStocking.id}`);
  };

  // 仕入れの状態が未納品かどうか
  const isNotYet = editStocking.status === StockingStatus.NOT_YET;

  const columns: ColumnDef<
    BackendStockingAPI[5]['response']['200'][0]['stocking_products'][0]
  >[] = [
    {
      header: '商品画像',
      render: (product) => <ItemImage imageUrl={product.image_url} fill />,
    },
    {
      header: '商品名',
      key: 'product_name',
      render: (product) => {
        const targetProduct = products.find((p) => p.id === product.product_id);
        if (!targetProduct) return null;
        return (
          <Stack>
            <ItemText text={targetProduct.displayNameWithMeta} wrap />
            <ConditionChip
              condition={product.product__condition_option__display_name}
            />
          </Stack>
        );
      },
    },
    {
      header: '仕入れ値',
      key: 'unit_price',
      render: (product) => {
        const unitPrice = product.unit_price ?? product.unit_price_without_tax;
        return (
          <Stack
            sx={{
              width: '100%',
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <NumericTextField
              value={unitPrice === null ? undefined : unitPrice}
              onChange={(value) => handleEdit(product.id, 'unit_price', value)}
              noSpin
              disabled={!isNotYet || isFromStoreShipment}
              InputProps={{
                endAdornment: <Typography>円</Typography>,
              }}
              sx={{ width: '100px' }}
            />
          </Stack>
        );
      },
    },
    {
      header: isNotYet ? '入荷予定数量/管理番号' : '入荷数量/管理番号',
      key: isNotYet ? 'planned_item_count' : 'actual_item_count',
      render: (product) => {
        const targetProduct = products.find((p) => p.id === product.product_id);
        if (!targetProduct || !targetProduct.id) return null;
        if (targetProduct.management_number !== null) {
          return (
            <EditManagementNumberField
              initValue={targetProduct.management_number || ''}
              productId={targetProduct.id}
              updateProduct={updateProduct}
              loading={isLoadingUpdateProduct}
            />
          );
        } else {
          return (
            <Stack
              sx={{
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <NumericTextField
                value={
                  isNotYet
                    ? product.planned_item_count === null
                      ? undefined
                      : product.planned_item_count
                    : product.actual_item_count === null
                    ? undefined
                    : product.actual_item_count
                }
                disabled={!isNotYet || isFromStoreShipment}
                onChange={(value) =>
                  handleEdit(product.id, 'planned_item_count', value)
                }
                InputProps={{
                  endAdornment: <Typography>点</Typography>,
                }}
                sx={{ width: '100px' }}
              />
            </Stack>
          );
        }
      },
    },
  ];

  return (
    <Stack flex={1} gap={2}>
      <CustomTable<
        BackendStockingAPI[5]['response']['200'][0]['stocking_products'][0]
      >
        columns={columns}
        rows={stockingProducts}
        rowKey={(row) => row.id}
        isLoading={isLoading}
      />
      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="stretch"
        gap={2}
      >
        {isNotYet && !isFromStoreShipment && (
          <SecondaryButtonWithIcon onClick={() => handleEditStocking()}>
            発注内容編集
          </SecondaryButtonWithIcon>
        )}
        <PrimaryButton
          onClick={async () => {
            const printData = stockingProducts.map((product) => ({
              id: product.product_id,
              count: product.planned_item_count,
            }));

            // 最後の商品の最後のラベルを特定するために、合計ラベル数を計算
            const totalLabels = printData.reduce(
              (sum, product) => sum + product.count,
              0,
            );
            let currentLabelCount = 0;

            printData.forEach((product) => {
              const productId = product.id;
              const printCount = product.count ?? 1;
              const stockNumber = product.count ?? 0;

              let isFirstStock = stockNumber <= printCount;

              for (let i = 0; i < printCount; i++) {
                currentLabelCount++;
                const isLastLabel = currentLabelCount === totalLabels;

                pushQueue({
                  template: 'product',
                  data: productId,
                  meta: {
                    isFirstStock,
                    transactionId: editStocking.id, // 発注IDを取引IDとして使用
                    isLastItem: isLastLabel, // 最後のラベルかどうか
                    isManual: true,
                  },
                });
                isFirstStock = false; //2枚目以降はfalseで
              }
            });
          }}
        >
          ラベル印刷
        </PrimaryButton>
      </Box>
    </Stack>
  );
};
