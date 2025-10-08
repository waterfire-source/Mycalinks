'use client';

import { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { ColumnDef, CustomTable } from '@/components/tables/CustomTable';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { useProducts } from '@/feature/products/hooks/useProducts';
import { useStore } from '@/contexts/StoreContext';
import { useAlert } from '@/contexts/AlertContext';
import { z } from 'zod';
import { getOpenPackHistoryApi } from '@api-defs/product/def';
import { MycaPosApiClient } from 'api-generator/client';
import { ItemImage } from '@/feature/item/components/ItemImage';
import NoImg from '@/components/common/NoImg';
import { ConfirmationModal } from '@/app/auth/(dashboard)/stock/open-pack-history/components/ConfirmationModal';
import { useErrorAlert } from '@/hooks/useErrorAlert';

// 型定義
type OpenPackHistoryResponse = z.infer<typeof getOpenPackHistoryApi.response>;
export type OpenPackHistory =
  OpenPackHistoryResponse['openPackHistories'][number];
type ProductItem = OpenPackHistory['to_products'][number];

// パック開封履歴で使用する product 情報
export interface OpenPackProductInfo {
  id: number;
  imageUrl: string | null;
  displayName: string;
  conditionName: string;
}

interface DetailModalProps {
  open: boolean;
  onClose: () => void;
  openPackHistory: OpenPackHistory;
  product: OpenPackProductInfo | null;
  fetchOpenPackHistories: () => void;
}

export const DetailModal = ({
  open,
  onClose,
  openPackHistory,
  product,
  fetchOpenPackHistories,
}: DetailModalProps) => {
  const { store } = useStore();
  const { products, listProductsByProductIDsChunked, isLoadingGetProducts } =
    useProducts();

  const apiClient = new MycaPosApiClient({
    BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
  });
  const { setAlertState } = useAlert();
  const [isLoadingRollback, setIsLoadingRollback] = useState(false);
  const { handleError } = useErrorAlert();

  // 商品内訳（to_products）の productId 一覧
  const toProductIds = useMemo(() => {
    if (!openPackHistory) return [];
    return [
      ...openPackHistory.to_products.map((p) => p.product_id).filter(Boolean),
      //未登録商品を手動で追加
      ...[openPackHistory.unregister_product_id].filter((id) => id !== null),
    ];
  }, [openPackHistory]);

  // 開封した商品内訳の product 情報を取得
  useEffect(() => {
    if (toProductIds.length > 0) {
      listProductsByProductIDsChunked(store.id, toProductIds);
    }
  }, [store.id, toProductIds]);

  // 未登録商品を含む商品内訳
  const productInfoWithUnRegisterItem = [
    ...openPackHistory.to_products,
    {
      product_id: openPackHistory.unregister_product_id ?? -1,
      item_count: openPackHistory.unregister_item_count ?? 0,
      wholesale_price: openPackHistory.unregister_product_wholesale_price,
      staff_account_id: openPackHistory.staff_account_id,
      pack_open_history_id: openPackHistory.id,
      staff_account: {
        display_name: null,
      },
    },
  ];

  // パック開封取り消し確認モーダルの表示
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  // パック開封のロールバック
  const rollbackOpenPack = async (
    isDryRun?: boolean,
  ): Promise<{ ok: string } | undefined> => {
    setIsLoadingRollback(true);
    try {
      const res = await apiClient.product.rollbackPackOpening({
        storeId: store.id,
        packOpenHistoryId: openPackHistory.id,
        requestBody: { isDryRun: isDryRun },
      });

      if (!isDryRun) {
        setAlertState({
          message: 'パック開封の取り消しを行いました。',
          severity: 'success',
        });

        fetchOpenPackHistories();
        onClose();
      } else {
        return res;
      }
    } catch (e) {
      handleError(e);
      return;
    } finally {
      setIsLoadingRollback(false);
    }
  };

  // 開封商品カラム
  const columns: ColumnDef<OpenPackHistory>[] = [
    {
      header: '画像',
      render: () =>
        product?.imageUrl ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ItemImage imageUrl={product.imageUrl} height={100} fill />
          </Box>
        ) : (
          <NoImg height={100} width={100 * 0.71} />
        ),
    },
    {
      header: '開封商品名',
      render: () => product?.displayName ?? '-',
    },
    {
      header: '状態',
      render: () => product?.conditionName ?? '-',
    },
    {
      header: '開封数',
      render: (row) => row.item_count ?? '-',
    },
    {
      header: '開封日時',
      render: (row) => new Date(row.created_at).toLocaleString('ja-JP'),
    },
  ];

  // 開封商品の内訳カラム
  const detailsColumns: ColumnDef<ProductItem>[] = [
    {
      header: '画像',
      render: (data) => {
        const product = products?.find((p) => p.id === data.product_id);
        return product?.image_url ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ItemImage imageUrl={product.image_url} height={100} fill />
          </Box>
        ) : (
          <NoImg height={100} width={100 * 0.71} />
        );
      },
    },
    {
      header: '商品名',
      render: (data) => {
        const product = products?.find((p) => p.id === data.product_id);
        return product?.display_name ?? 'ロス';
      },
    },
    {
      header: '状態',
      render: (data) => {
        const product = products?.find((p) => p.id === data.product_id);
        return product?.condition_option_display_name ?? '-';
      },
    },
    {
      header: '登録数',
      render: (data) => data.item_count ?? '-',
    },
    {
      header: '仕入れ値',
      render: (data) =>
        data.wholesale_price != null ? `${data.wholesale_price}円` : '-',
    },
  ];

  return (
    <CustomModalWithIcon
      open={open}
      onClose={onClose}
      title={'パック開封結果'}
      width="90%"
      height="90%"
      // TODO 修正ができるようになったら修正を選択できるようにする
      // secondActionButtonText="開封結果の修正・取り消し"
      // secondaryMenu={renderMenu}
      secondActionButtonText="開封結果の取り消し"
      isSecondActionButtonLoading={isLoadingRollback}
      onSecondActionButtonClick={() => setShowConfirmationModal(true)}
      cancelButtonText="閉じる"
    >
      <Box display="flex" flexDirection="column" gap={4}>
        {/* 開封商品 */}
        <CustomTable<OpenPackHistory>
          columns={columns}
          rows={[openPackHistory]}
          rowKey={(row) => row.id}
          isLoading={false}
          sx={{ borderTop: '8px solid', borderTopColor: 'primary.main' }}
        ></CustomTable>

        {/* 商品内訳 */}
        <CustomTable<ProductItem>
          columns={detailsColumns}
          rows={productInfoWithUnRegisterItem ?? []}
          rowKey={(row) => row.product_id}
          isLoading={isLoadingGetProducts}
          sx={{ borderTop: '8px solid', borderTopColor: 'primary.main' }}
        ></CustomTable>
      </Box>

      {/* 取り消し確認モーダル */}
      {showConfirmationModal && (
        <ConfirmationModal
          onClose={() => setShowConfirmationModal(false)}
          rollback={rollbackOpenPack}
          isLoading={isLoadingRollback}
          openPackHistory={openPackHistory}
        />
      )}
    </CustomModalWithIcon>
  );
};
