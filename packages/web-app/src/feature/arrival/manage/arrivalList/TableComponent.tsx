import { useState, useCallback, useEffect } from 'react';
import { GridPaginationModel } from '@mui/x-data-grid';
import { useListStocking } from '@/feature/arrival/hooks/useListStocking';
import { TableComponentContent } from '@/feature/arrival/manage/arrivalList/TableComponentContent';
import { useSearchParams } from 'next/navigation';
import { Stocking } from '@prisma/client';

export const TableComponent = () => {
  const { listStocking, stockings, isLoading, totalCount } = useListStocking();
  const searchParams = useSearchParams();

  // URL パラメータから検索条件を取得
  const status = searchParams.get('status') as Stocking['status'];
  const productName = searchParams.get('name');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  // ページネーション状態
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 30,
  });

  // データ取得関数
  const fetchStockings = useCallback(
    async (page = 0, pageSize = 30) => {
      await listStocking({
        status,
        productName,
        startDate,
        endDate,
        pageNum: page,
        pageSizeParam: pageSize,
      });
    },
    [listStocking, status, productName, startDate, endDate],
  );

  // ページネーション変更時の処理
  const handlePaginationModelChange = useCallback(
    (newModel: GridPaginationModel) => {
      setPaginationModel(newModel);
      fetchStockings(newModel.page, newModel.pageSize);
    },
    [fetchStockings],
  );

  // 初期データ取得と検索条件変更時の再取得
  useEffect(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 })); // ページを0にリセット
    fetchStockings(0, paginationModel.pageSize);
  }, [status, productName, startDate, endDate]);

  // リフレッシュ用の関数（モーダルから呼ばれる）
  const refreshData = useCallback(async () => {
    await fetchStockings(paginationModel.page, paginationModel.pageSize);
  }, [fetchStockings, paginationModel.page, paginationModel.pageSize]);

  return (
    <TableComponentContent
      stockings={stockings}
      isLoading={isLoading}
      fetchStockings={refreshData}
      totalCount={totalCount}
      paginationModel={paginationModel}
      onPaginationModelChange={handlePaginationModelChange}
    />
  );
};
