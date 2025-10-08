'use client';

import { Box, Typography } from '@mui/material';
import { Chip } from '@/components/chips/Chip';
import { z } from 'zod';
import { getAppraisalApi } from '@api-defs/appraisal/def';
import { CustomTable, ColumnDef } from '@/components/tables/CustomTable';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { useProducts } from '@/feature/products/hooks/useProducts';
import { useEffect, useState } from 'react';
import { useStore } from '@/contexts/StoreContext';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';

// 型定義
type AppraisalResponse = z.infer<typeof getAppraisalApi.response>;
type AppraisalItem = AppraisalResponse['appraisals'][number];
type ProductItem = AppraisalItem['products'][number];

// グループ化された商品の型
type GroupedProductItem = ProductItem & {
  quantity: number;
};

interface AppraisalDetailProductTableProps {
  selectedAppraisal: AppraisalItem | undefined;
  viewMode: 'fromProduct' | 'toProduct';
}

export const AppraisalDetailProductTable = ({
  selectedAppraisal,
  viewMode,
}: AppraisalDetailProductTableProps) => {
  const { store } = useStore();
  const { listProductsByProductIDs } = useProducts();

  const [toProductInfo, setToProductInfo] = useState<
    Map<number, BackendProductAPI[0]['response']['200']['products'][number]>
  >(new Map());

  // selectedAppraisalの中でproducts.productは元の在庫情報
  // それ以外は変換先の在庫情報
  const products = selectedAppraisal?.products || [];

  // 同じproduct_idとappraisal_feeを持つ商品をグループ化
  const groupedProducts = products.reduce(
    (acc: GroupedProductItem[], product, index) => {
      const existingGroup =
        viewMode === 'fromProduct'
          ? acc.find(
              (group) =>
                group.product_id === product.product_id &&
                group.appraisal_fee / group.quantity === product.appraisal_fee,
            )
          : acc.find(
              (group) =>
                group.to_product_id === product.to_product_id &&
                group.appraisal_fee / group.quantity === product.appraisal_fee,
            );

      if (existingGroup) {
        existingGroup.quantity += 1;
        existingGroup.appraisal_fee += product.appraisal_fee;
      } else {
        acc.push({
          ...product,
          quantity: 1,
        });
      }

      return acc;
    },
    [],
  );

  const columns: ColumnDef<GroupedProductItem>[] = [
    {
      header: '商品画像',
      key: 'image',
      sx: { width: '15%', minWidth: 80 },
      render: (product) => (
        <ItemImage imageUrl={product.product.image_url}></ItemImage>
      ),
    },
    {
      header: '商品名',
      key: 'productName',
      sx: { width: '35%', minWidth: 200 },
      render: (product) => {
        const targetProduct = toProductInfo.get(product.to_product_id || -1);

        const name =
          viewMode === 'fromProduct'
            ? product.product.displayNameWithMeta
            : targetProduct?.displayNameWithMeta;

        const conditionName =
          viewMode === 'fromProduct'
            ? product.product.condition_option_display_name || ''
            : targetProduct?.condition_option_display_name || '';
        return (
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'start',
            }}
          >
            <Typography sx={{ textAlign: 'left' }}>{name}</Typography>

            <Box sx={{ mt: 0.5 }}>
              <Chip variant="primary" text={conditionName} />
            </Box>
          </Box>
        );
      },
    },
    {
      header: '提出数',
      key: 'quantity',
      sx: { width: '15%', minWidth: 80 },
      render: (product) => <Typography>{product.quantity}</Typography>,
    },
    {
      header: viewMode === 'fromProduct' ? '鑑定料' : '鑑定料(+諸手数料)',
      key: 'appraisalFee',
      sx: { width: '35%', minWidth: 120 },
      render: (product) => (
        <Typography>¥{product.appraisal_fee.toLocaleString()}</Typography>
      ),
    },
  ];

  useEffect(() => {
    const fetchProductInfo = async () => {
      const ids = selectedAppraisal?.products
        .map((p) => p.to_product_id ?? null)
        .filter((id): id is number => id !== null);
      if (ids?.length === 0) return;
      if (!ids) return;

      const info = await listProductsByProductIDs(store.id, ids);
      if (!info) return;

      const map = new Map(info.map((i) => [i.id, i]));
      setToProductInfo(map);
    };

    fetchProductInfo();
  }, [selectedAppraisal?.products, store.id]);

  return (
    <CustomTable<GroupedProductItem>
      columns={columns}
      rows={groupedProducts}
      isLoading={false}
      rowKey={(item) => item.id}
    />
  );
};
