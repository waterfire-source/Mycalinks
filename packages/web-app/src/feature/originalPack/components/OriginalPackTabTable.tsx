import { useState } from 'react';
import dayjs from 'dayjs';
import {
  CustomTabTable,
  ColumnDef,
  TabDef,
} from '@/components/tabs/CustomTabTable';
import {
  OriginalPackItemType,
  OriginalPackProduct,
} from '@/app/auth/(dashboard)/original-pack/page';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { OriginalPackDetailModal } from '@/feature/originalPack/components/OriginalPackDetailModal';
import { Item_Genre, Item_Category, ItemType } from '@prisma/client';
import { Box } from '@mui/material';
import { ItemText } from '@/feature/item/components/ItemText';

interface OriginalPackTabTableProps {
  originalPacks: OriginalPackItemType[];
  onTabChange: (value: string) => void;
  onGenreFilter: (genreName: string) => void;
  onCategoryFilter: (categoryName: string) => void;
  onSortByCreatedAt: (direction: 'asc' | 'desc') => void;
  itemGenres: Item_Genre[];
  itemCategories: Item_Category[];
  isLoading: boolean;
  selectedOriginalPack: OriginalPackItemType | null;
  setSelectedOriginalPack: (item: OriginalPackItemType | null) => void;
  setOriginalPackProducts: (products: OriginalPackProduct[]) => void;
  originalPackProducts: OriginalPackProduct[];
  handleDisassemble: () => void;
  fetchTypeItems: (
    storeID: number,
    take?: number,
    type?: ItemType,
  ) => Promise<void>;
}

export const OriginalPackTabTable: React.FC<OriginalPackTabTableProps> = ({
  originalPacks,
  onTabChange: handleTabClick,
  onGenreFilter: handleGenreFilter,
  onCategoryFilter: handleCategoryFilter,
  onSortByCreatedAt: handleSortByCreatedAt,
  itemGenres,
  itemCategories,
  isLoading,
  selectedOriginalPack,
  setSelectedOriginalPack,
  originalPackProducts,
  setOriginalPackProducts,
  handleDisassemble,
  fetchTypeItems,
}: OriginalPackTabTableProps) => {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // CustomTabTable 用のカラム定義
  const columns: ColumnDef<OriginalPackItemType>[] = [
    {
      header: '商品画像',
      render: (item) => (
        <Box width="100%" justifyContent="center" display="flex">
          <Box
            sx={{
              width: 60,
              height: 80,
              alignSelf: 'center',
              alignItems: 'center',
            }}
          >
            <ItemImage imageUrl={item.image_url} height={80} />
          </Box>
        </Box>
      ),
    },
    {
      header: '商品名',
      key: 'display_name',
      render: (item) => {
        return <ItemText text={item.displayNameWithMeta || '-'} />;
      },
    },
    {
      header: 'ジャンル',
      key: 'genre_display_name',
      filterConditions: itemGenres?.map((genre) => genre.display_name),
      filterDefaultValue: 'すべて',
      onFilterConditionChange: (condition) => {
        handleGenreFilter(condition);
      },
      render: (item) => item.genre_display_name || '-',
    },
    {
      header: 'カテゴリ',
      key: 'category_display_name',
      filterConditions: itemCategories?.map(
        (category) => category.display_name,
      ),
      filterDefaultValue: 'すべて',
      onFilterConditionChange: (condition) => {
        handleCategoryFilter(condition);
      },
      render: (item) => item.category_display_name || '-',
    },
    {
      header: '作成日',
      key: 'created_at',
      isSortable: true,
      onSortChange: (direction) => {
        handleSortByCreatedAt(direction);
      },
      render: (item) =>
        item.created_at ? dayjs(item.created_at).format('YYYY/MM/DD') : '-',
    },
    {
      header: '単価',
      key: 'sell_price',
      render: (item) =>
        item.sell_price ? `¥${item.sell_price.toLocaleString()}` : '￥0',
    },
    {
      header: '販売数',
      key: 'init_stock_number',
      render: (item) =>
        (item.init_stock_number || 0) - (item.products_stock_number || 0),
    },
    {
      header: '在庫数',
      key: 'products_stock_number',
      render: (item) => item.products_stock_number ?? '-',
    },
  ];

  // タブ定義（今回は全件表示のため単一タブ）
  const tabs: TabDef<OriginalPackItemType>[] = [
    {
      label: '在庫あり',
      value: 'STOCK',
    },
    {
      label: '在庫なし',
      value: 'NO_STOCK',
    },
    {
      label: '一時保存',
      value: 'DRAFT',
    },
    {
      label: 'すべて',
      value: 'ALL',
    },
  ];

  return (
    <>
      <CustomTabTable<OriginalPackItemType>
        data={originalPacks || []}
        columns={columns}
        tabs={tabs}
        rowKey={(item) => item.id}
        onTabChange={handleTabClick}
        isLoading={isLoading}
        isShowFooterArea={true}
        onRowClick={(item) => {
          setSelectedOriginalPack(item);
          setIsDetailModalOpen(true);
        }}
        tableWrapperSx={{ height: 'calc(100% - 160px)' }}
        tabTableWrapperSx={{ flex: 1 }}
      />

      <OriginalPackDetailModal
        open={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setOriginalPackProducts([]);
          setSelectedOriginalPack(null);
        }}
        handleSubmit={() => {
          handleDisassemble();
          setIsDetailModalOpen(false);
        }}
        selectedItem={selectedOriginalPack}
        originalPackProducts={originalPackProducts}
        setOriginalPackProducts={setOriginalPackProducts}
        isLoading={isLoading}
        fetchTypeItems={fetchTypeItems}
      />
    </>
  );
};
