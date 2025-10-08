import { DetailViewType } from '@/app/auth/(dashboard)/inventory-count/page';
import {
  ColumnDef,
  CustomTabTable,
  TabDef,
} from '@/components/tabs/CustomTabTable';
import InfoTooltip from '@/components/tooltips/InfoTooltip';
import { InventoryCountData } from '@/feature/inventory-count/hook/useInventoryCount';
import { Stack, Typography } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';

export interface InventoryCountTableContentProps {
  isLoading: boolean;
  rows: InventoryCountData[];
  genreIds: number[];
  genreNames: string[];
  categoryIds: number[];
  categoryNames: string[];
  handleOpenDetailModal: (data: InventoryCountData) => void;
  setDetailViewType: Dispatch<SetStateAction<DetailViewType>>;
  // サーバーサイドページネーション用
  currentPage: number;
  rowPerPage: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onRowPerPageChange: (rowPerPage: number) => void;
  // サーバーサイドフィルタ用
  onTabChange: (status: string) => void;
  onGenreFilterChange: (genreId: number | null) => void;
  onCategoryFilterChange: (categoryId: number | null) => void;
}

export const InventoryCountTableContent = ({
  isLoading,
  rows,
  genreIds,
  genreNames,
  categoryIds,
  categoryNames,
  handleOpenDetailModal,
  setDetailViewType,
  currentPage,
  rowPerPage,
  totalCount,
  onPageChange,
  onRowPerPageChange,
  onTabChange,
  onGenreFilterChange,
  onCategoryFilterChange,
}: InventoryCountTableContentProps) => {
  const columns: ColumnDef<InventoryCountData>[] = [
    {
      header: 'タイトル',
      key: 'title',
      render: (row) => row.title,
    },
    {
      header: '状態',
      key: 'status',
      render: (row) => row.status,
      isSortable: true,
    },
    {
      header: '最終更新日時',
      key: 'updatedAt',
      render: (row) => row.updatedAt,
      isSortable: true,
    },
    {
      header: 'ジャンル',
      key: 'genre',
      render: (row) => (
        <Stack direction="column" alignItems="center">
          <Typography>
            {genreNames[genreIds.indexOf(row.genreIds[0])]}
          </Typography>
          {row.genreIds.length > 1 && (
            <Stack direction="row" alignItems="center">
              <Typography sx={{ fontSize: '0.75rem' }}>
                他{row.genreIds.length - 1}ジャンル
              </Typography>
              <InfoTooltip
                message={row.genreIds
                  .slice(1)
                  .map((id) => {
                    return genreNames[genreIds.indexOf(id)];
                  })
                  .join(', ')}
                stopPropagation={true}
              />
            </Stack>
          )}
        </Stack>
      ),
      filterConditions: genreNames,
      onFilterConditionChange: (genreName) => {
        const genreId = genreIds.find(
          (_, index) => genreNames[index] === genreName,
        );
        onGenreFilterChange(genreId || null);
      },
      isSortable: true,
    },
    {
      header: 'カテゴリ',
      key: 'category',
      render: (row) => (
        <Stack direction="column" alignItems="center">
          <Typography>
            {categoryNames[categoryIds.indexOf(row.categoryIds[0])]}
          </Typography>
          {row.categoryIds.length > 1 && (
            <Stack direction="row" alignItems="center">
              <Typography sx={{ fontSize: '0.75rem' }}>
                他{row.categoryIds.length - 1}カテゴリ
              </Typography>
              <InfoTooltip
                message={row.categoryIds
                  .slice(1)
                  .map((id) => {
                    return categoryNames[categoryIds.indexOf(id)];
                  })
                  .join(', ')}
                stopPropagation={true}
              />
            </Stack>
          )}
        </Stack>
      ),
      filterConditions: categoryNames,
      onFilterConditionChange: (categoryName) => {
        const categoryId = categoryIds.find(
          (_, index) => categoryNames[index] === categoryName,
        );
        onCategoryFilterChange(categoryId || null);
      },
      isSortable: true,
    },
    {
      header: '進捗',
      key: 'progress',
      render: (row) => row.progress + '%',
      isSortable: true,
    },
    {
      header: '過不足点数（仕入れ額）',
      key: 'difference',
      render: (row) =>
        `${row.discrepancy.toLocaleString()}点（${row.difference.toLocaleString()}円）`,
      isSortable: true,
    },
  ];

  const tabs: TabDef<InventoryCountData>[] = [
    {
      label: 'すべて',
      value: 'all',
    },
    {
      label: '中断中',
      value: 'paused',
    },
    {
      label: '完了',
      value: 'completed',
    },
  ];

  const handlePrevPagination = () => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPagination = () => {
    if ((currentPage + 1) * rowPerPage < totalCount) {
      onPageChange(currentPage + 1);
    }
  };

  const handleRowPerPageChange = (newRowPerPage: number) => {
    onRowPerPageChange(newRowPerPage);
    onPageChange(0); // ページサイズ変更時は1ページ目に戻る
  };

  return (
    <CustomTabTable<InventoryCountData>
      tabs={tabs}
      data={rows}
      columns={columns}
      rowKey={(row) => row.id}
      isLoading={isLoading}
      onRowClick={(d) => {
        if (d.status === '完了') setDetailViewType('complete');
        else setDetailViewType('edit');
        handleOpenDetailModal(d);
      }}
      onTabChange={onTabChange}
      isSingleSortMode={true}
      isShowFooterArea={true}
      currentPage={currentPage}
      rowPerPage={rowPerPage}
      totalRow={totalCount}
      handlePrevPagination={handlePrevPagination}
      handleNextPagination={handleNextPagination}
      handleRowPerPageChange={handleRowPerPageChange}
      tabTableWrapperSx={{ 
        flex: 1, 
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
      tableWrapperSx={{
        flex: 1,
        minHeight: 0,
        overflow: 'auto'
      }}
    />
  );
};
