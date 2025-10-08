'use client';

import { useEffect, useMemo, useState } from 'react';
import { Box, Checkbox } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridFooterContainer,
  GridPagination,
} from '@mui/x-data-grid';
import { jaJP } from '@mui/x-data-grid/locales';
import { useStore } from '@/contexts/StoreContext';
import { useAlert } from '@/contexts/AlertContext';
import { useLabelPrinterHistory } from '@/contexts/LabelPrinterContext';
import { useProducts } from '@/feature/products/hooks/useProducts';
import { z } from 'zod';
import { getOpenPackHistoryApi } from '@api-defs/product/def';
import { MycaPosApiClient } from 'api-generator/client';
import {
  DetailModal,
  OpenPackProductInfo,
} from '@/app/auth/(dashboard)/stock/open-pack-history/components/DetailModal';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { ItemImage } from '@/feature/item/components/ItemImage';
import NoImg from '@/components/common/NoImg';
import { ItemType, PackOpenStatus } from '@prisma/client';
// 型定義
type OpenPackHistoryResponse = z.infer<typeof getOpenPackHistoryApi.response>;
type OpenPackHistory = OpenPackHistoryResponse['openPackHistories'][number];

interface OpenPackHistoryTableProps {
  selectedIds: number[];
  setSelectedIds: React.Dispatch<React.SetStateAction<number[]>>;
}

export const OpenPackHistoryTable = ({
  selectedIds,
  setSelectedIds,
}: OpenPackHistoryTableProps) => {
  const { store } = useStore();
  const {
    products,
    listProductsByProductIDsChunked,
    isLoadingGetProducts,
    handelResetProducts,
  } = useProducts();
  const [openPackHistories, setOpenPackHistories] = useState<OpenPackHistory[]>(
    [],
  );
  const { pushQueue } = useLabelPrinterHistory();

  const apiClient = new MycaPosApiClient({
    BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
  });
  const { setAlertState } = useAlert();
  const [isLoadingGetHistories, setIsLoadingGetHistories] = useState(false);
  const isLoading = isLoadingGetHistories || isLoadingGetProducts;

  // モーダルに渡す選択したレコード情報
  const [selectedOpenPackHistory, setSelectedOpenPackHistory] =
    useState<OpenPackHistory | null>(null);
  const [selectedProduct, setSelectedProduct] =
    useState<OpenPackProductInfo | null>(null);

  // パック開封履歴の取得
  const fetchOpenPackHistories = async () => {
    setIsLoadingGetHistories(true);
    try {
      const res = await apiClient.product.getOpenPackHistory({
        storeId: store.id,
        status: PackOpenStatus.FINISHED,
        itemType: ItemType.NORMAL,
      });

      const parsed = res.openPackHistories.map((h) => ({
        ...h,
        created_at: new Date(h.created_at!),
        updated_at: new Date(h.updated_at!),
      }));

      setOpenPackHistories(parsed);
    } catch (e) {
      setAlertState({
        message: 'パック開封履歴の取得に失敗しました。',
        severity: 'error',
      });
    } finally {
      setIsLoadingGetHistories(false);
    }
  };

  // パック開封詳細モーダルの表示
  const [showOpenPackHistoryDetailModal, setShowOpenPackHistoryDetailModal] =
    useState(false);

  useEffect(() => {
    fetchOpenPackHistories();
  }, [store.id]);

  const productIds = useMemo(() => {
    return (
      openPackHistories?.map((h) => h.from_product_id).filter(Boolean) ?? []
    );
  }, [openPackHistories]);

  // パック開封履歴それぞれの product 情報を取得
  useEffect(() => {
    if (productIds.length > 0) {
      // 商品データをリセットしてから新しいデータを取得
      handelResetProducts();
      listProductsByProductIDsChunked(store.id, productIds);
    }
  }, [store.id, productIds]);

  // ラベル印刷
  const handlePrint = () => {
    // チェックされたパック開封履歴に抜粋
    const targets = openPackHistories.filter((h) => selectedIds.includes(h.id));

    // バック開封履歴の開封結果分 product_id を印刷のキューに追加
    targets.forEach((history) => {
      history.to_products.forEach((item) => {
        let isFirstStock = true;
        for (let i = 0; i < item.item_count; i++) {
          pushQueue({
            template: 'product',
            data: item.product_id,
            meta: {
              isFirstStock,
              isManual: true,
            },
          });
          isFirstStock = false;
        }
      });
    });
  };

  // カラム定義
  const columns: GridColDef[] = [
    {
      field: '',
      headerName: '',
      sortable: false,
      width: 60,
      renderHeader: () => {
        const allSelected =
          openPackHistories.length > 0 &&
          openPackHistories.every((row) => selectedIds.includes(row.id));
        const someSelected =
          openPackHistories.some((row) => selectedIds.includes(row.id)) &&
          !allSelected;

        return (
          <Checkbox
            indeterminate={someSelected}
            checked={allSelected}
            onChange={(event) => {
              if (event.target.checked) {
                const allIds = openPackHistories.map((row) => row.id);
                setSelectedIds(allIds);
              } else {
                setSelectedIds([]);
              }
            }}
          />
        );
      },
      renderCell: (params) => (
        <Checkbox
          checked={selectedIds.includes(params.row.id)}
          onChange={(event) => {
            if (event.target.checked) {
              setSelectedIds([...selectedIds, params.row.id]);
            } else {
              setSelectedIds(selectedIds.filter((id) => id !== params.row.id));
            }
          }}
        />
      ),
    },
    {
      field: 'image',
      headerName: '画像',
      width: 80,
      renderCell: (params) => {
        const product = products?.find(
          (p) => p.id === params.row.from_product_id,
        );

        return product?.image_url ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ItemImage imageUrl={product.image_url} fill />
          </Box>
        ) : (
          <NoImg height={60} width={60 * 0.71} />
        );
      },
    },
    {
      field: 'product_name',
      headerName: '開封商品名',
      flex: 1,
      renderCell: (params) => {
        const product = products?.find(
          (p) => p.id === params.row.from_product_id,
        );
        return product?.display_name ?? '-';
      },
    },
    {
      field: 'condition',
      headerName: '状態',
      flex: 1,
      renderCell: (params) => {
        const product = products?.find(
          (p) => p.id === params.row.from_product_id,
        );
        return product?.condition_option_display_name ?? '-';
      },
    },
    {
      field: 'item_count',
      headerName: '開封数',
      flex: 1,
      renderCell: (params) => params.row.item_count ?? '-',
    },
    {
      field: 'created_at',
      headerName: '開封日時',
      flex: 1,
      renderCell: (params) =>
        new Date(params.row.created_at).toLocaleString('ja-JP'),
    },
  ];

  // テーブルのカスタムフッター：ページネーションとボタンの表示
  const CustomFooter = () => {
    return (
      <GridFooterContainer
        sx={{
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center',
          paddingY: 0,
          paddingX: 2,
        }}
      >
        {/* ページネーション部分 */}
        <GridPagination />

        {/* ラベル印刷ボタン */}
        <PrimaryButtonWithIcon
          variant="contained"
          color="primary"
          sx={{ marginLeft: 'auto', marginRight: 2 }}
          onClick={handlePrint}
        >
          選択したラベルを印刷
        </PrimaryButtonWithIcon>
      </GridFooterContainer>
    );
  };

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <DataGrid
        disableColumnMenu
        localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
        rows={isLoading ? [] : openPackHistories}
        columns={columns}
        loading={isLoading}
        disableRowSelectionOnClick
        disableColumnFilter
        rowHeight={80}
        onRowClick={(params, event) => {
          const target = event.target as HTMLElement;

          // チェックボックスのセルをクリックした場合はモーダルを開かない
          if (
            target.closest('.MuiCheckbox-root') ||
            target.tagName === 'INPUT'
          ) {
            return;
          }

          const history = params.row as OpenPackHistory;
          const rawProduct = products?.find(
            (p) => p.id === history.from_product_id,
          );
          const product: OpenPackProductInfo | null = rawProduct
            ? {
                id: rawProduct.id,
                imageUrl: rawProduct.image_url ?? null,
                displayName: rawProduct.display_name ?? '-',
                conditionName: rawProduct.condition_option_display_name ?? '-',
              }
            : null;

          setSelectedOpenPackHistory(history);
          setSelectedProduct(product);
          setShowOpenPackHistoryDetailModal(true);
        }}
        initialState={{
          sorting: {
            sortModel: [
              {
                field: 'created_at',
                sort: 'desc',
              },
            ],
          },
        }}
        slots={{
          footer: CustomFooter,
        }}
        sx={{
          height: '100%',
          width: '100%',
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: 'white',
          },
          '& .MuiDataGrid-cell': {
            alignItems: 'center',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            color: 'grey.700',
          },
          '& .MuiDataGrid-row': {
            backgroundColor: 'white',
          },
        }}
      />

      {showOpenPackHistoryDetailModal && selectedOpenPackHistory && (
        <DetailModal
          open
          onClose={() => setShowOpenPackHistoryDetailModal(false)}
          openPackHistory={selectedOpenPackHistory}
          product={selectedProduct}
          fetchOpenPackHistories={fetchOpenPackHistories}
        />
      )}
    </Box>
  );
};
