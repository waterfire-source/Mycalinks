import { useState, useCallback, useMemo } from 'react';
import { useStore } from '@/contexts/StoreContext';
import { useAlert } from '@/contexts/AlertContext';
import { MycaPosApiClient } from 'api-generator/client';
import { GridPaginationModel } from '@mui/x-data-grid';
// responseを整形した後の型
interface FormattedItem {
  id: string;
  image: string | null;
  productCode: number;
  displayName: string;
  displayNameWithMeta: string;
  conditionOptionDisplayName: string;
  lossGenreId: number | null;
  lossGenreDisplayName: string;
  itemCount: number;
  createdAt: Date;
  datetime: Date;
  staffAccountId: number;
  staffAccountDisplayName: string;
  reason: string | null;
}

export const useLossItems = () => {
  const client = useMemo(
    () =>
      new MycaPosApiClient({
        BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
      }),
    [],
  );
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const [lossItems, setLossItems] = useState<FormattedItem[]>([]);
  const [lossGenreId, setLossGenreId] = useState<number | null>(null);
  const [staffAccountId, setStaffAccountId] = useState<number | null>(null);
  const [reason, setReason] = useState<string>('');
  const [datetimeGte, setDatetimeGte] = useState<Date | null>(null);
  const [datetimeLte, setDatetimeLte] = useState<Date | null>(null);
  const [displayName, setDisplayName] = useState<string>('');

  // 検索用の状態（実際にAPIに送られる値）
  const [searchReason, setSearchReason] = useState<string>('');
  const [searchDisplayName, setSearchDisplayName] = useState<string>('');
  const [orderBy, setOrderBy] = useState<string[]>(['-datetime']);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 30,
  });
  const [totalCount, setTotalCount] = useState<number>(0);

  const fetchLossItems = useCallback(async () => {
    if (!store.id) return;
    try {
      const response = await client.product.getLossProducts({
        storeId: store.id,
        lossGenreId: lossGenreId ?? undefined,
        staffAccountId: staffAccountId ?? undefined,
        reason: searchReason || undefined,
        datetimeGte: datetimeGte?.toString() ?? undefined,
        datetimeLte: datetimeLte?.toString() ?? undefined,
        displayName: searchDisplayName || undefined,
        orderBy: orderBy.join(','),
        skip: paginationModel.page * paginationModel.pageSize,
        take: paginationModel.pageSize,
      });
      const { lossProducts, totalCount } = response;

      setTotalCount(totalCount);

      const formattedItems: FormattedItem[] = lossProducts.map(
        (lossProduct, index) => {
          const res: FormattedItem = {
            id: `${lossProduct.product.id}-${
              lossProduct.product.item_id || 'N/A'
            }-${index}`,
            image: lossProduct.product.image_url,
            productCode: lossProduct.product.item_id,
            displayName: lossProduct.product?.display_name,
            displayNameWithMeta: lossProduct.product?.displayNameWithMeta,
            conditionOptionDisplayName:
              lossProduct.product?.condition_option?.display_name,
            lossGenreId: lossProduct.loss?.loss_genre_id,
            lossGenreDisplayName: lossProduct.loss?.loss_genre?.display_name,
            itemCount: lossProduct.item_count ?? 0,
            createdAt: new Date(lossProduct.product.created_at ?? ''),
            datetime: new Date(lossProduct.loss.datetime ?? ''),
            staffAccountId: lossProduct.loss?.staff_account_id,
            staffAccountDisplayName:
              lossProduct.loss?.staff_account?.display_name,
            reason: lossProduct.loss?.reason,
          };
          return res;
        },
      );

      setLossItems(formattedItems);
    } catch (error) {
      setAlertState({
        message: '商品のデータ取得に失敗しました',
        severity: 'error',
      });
      console.error('商品のデータ取得に失敗しました:', error);
    }
  }, [
    store.id,
    client.product,
    lossGenreId,
    staffAccountId,
    searchReason,
    datetimeGte,
    datetimeLte,
    searchDisplayName,
    orderBy,
    paginationModel.page,
    paginationModel.pageSize,
    setAlertState,
  ]);

  // 並び替えの変更関数
  const updateOrderBy = (key: string, mode: string) => {
    const orderPrefix = mode === 'desc' ? '-' : '';
    setOrderBy([`${orderPrefix}${key}`]);
  };

  // 検索実行関数
  const executeSearch = (searchParams: {
    reason: string;
    displayName: string;
  }) => {
    setSearchReason(searchParams.reason);
    setSearchDisplayName(searchParams.displayName);
  };

  // ページネーション変更時の処理
  const handlePaginationModelChange = useCallback(
    (newModel: GridPaginationModel) => {
      setPaginationModel(newModel);
    },
    [],
  );

  return {
    lossItems,
    fetchLossItems,
    setLossGenreId,
    setStaffAccountId,
    setDatetimeGte,
    setDatetimeLte,
    updateOrderBy,
    executeSearch,
    // 検索フィールド用の値
    reason,
    displayName,
    setReason,
    setDisplayName,
    paginationModel,
    setPaginationModel,
    handlePaginationModelChange,
    totalCount,
  };
};
