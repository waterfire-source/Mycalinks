import { MycaItemType } from '@/feature/booking';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { CustomTab, TabDef } from '@/components/tabs/CustomTab';
import { CustomTable, ColumnDef } from '@/components/tables/CustomTable';

interface Props {
  mycaItemsWithGenreName: MycaItemType[];
  isLoading: boolean;
  hasMore: boolean;
  loadMoreItems: () => void;
  handleOpenCreateOrEditReservationModal: (
    posItemId?: number,
    mycaItemId?: number,
  ) => Promise<void>;
  isLoadingCreateItem: boolean;
}

export const SelectOrCreateMycaItemsModalTable = ({
  mycaItemsWithGenreName,
  isLoading,
  hasMore,
  loadMoreItems,
  handleOpenCreateOrEditReservationModal,
  isLoadingCreateItem,
}: Props) => {
  // ------------------- カラム定義 -------------------
  const columns: ColumnDef<MycaItemType>[] = [
    {
      header: '商品画像',
      render: (item) => (
        <ItemImage imageUrl={item.full_image_url} height={30} />
      ),
      sx: { width: '100px' },
    },
    {
      header: '商品',
      render: (item) => (
        <ItemText sx={{ maxWidth: 530 }} text={item.displayNameWithMeta} />
      ),
      sx: { width: '300px' },
    },
    {
      header: 'ジャンル',
      render: (item) => item.genre_name,
    },
    {
      header: '商品カテゴリ',
      render: (item) =>
        item.displaytype1?.includes('カード') ? 'カード' : 'ボックス',
    },
    {
      header: '',
      render: (item) => (
        <PrimaryButtonWithIcon
          onClick={() =>
            handleOpenCreateOrEditReservationModal(item.pos_item_id, item.id)
          }
          disabled={isLoadingCreateItem}
        >
          選択して予約を作成
        </PrimaryButtonWithIcon>
      ),
      sx: { width: '200px' },
    },
  ];

  // ------------------- タブ定義 -------------------
  const tabs: TabDef[] = [
    { key: 'connected_Mycalinks', value: `Mycalinks連携済み` },
  ];

  return (
    <CustomTab
      tabs={tabs}
      containerSx={{
        borderBottomRightRadius: '8px',
        borderBottomLeftRadius: '8px',
      }}
      content={
        <CustomTable<MycaItemType>
          columns={columns}
          rows={mycaItemsWithGenreName}
          rowKey={(row, index) => `${row.id}-${index}`}
          onScrollToBottom={hasMore && !isLoading ? loadMoreItems : undefined}
          isLoading={isLoading}
        />
      }
    />
  );
};
