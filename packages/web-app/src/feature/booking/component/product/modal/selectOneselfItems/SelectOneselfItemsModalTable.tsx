import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { CustomTab, TabDef } from '@/components/tabs/CustomTab';
import { CustomTable, ColumnDef } from '@/components/tables/CustomTable';
import { BackendItemAPI } from '@/app/api/store/[store_id]/item/api';

interface Props {
  oneselfItems: BackendItemAPI[0]['response']['200']['items'][0][];
  isLoading: boolean;
  handleOpenCreateOrEditReservationModal: (
    posItemId?: number,
    mycaItemId?: number,
  ) => Promise<void>;
  isLoadingCreateItem: boolean;
}

export const SelectOneselfItemsModalTable = ({
  oneselfItems,
  isLoading,
  handleOpenCreateOrEditReservationModal,
  isLoadingCreateItem,
}: Props) => {
  // ------------------- カラム定義 -------------------
  const columns: ColumnDef<BackendItemAPI[0]['response']['200']['items'][0]>[] =
    [
      {
        header: '商品画像',
        render: (item) => <ItemImage imageUrl={item.image_url} height={50} />,
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
        render: (item) => item.genre_display_name,
      },
      {
        header: '商品カテゴリ',
        render: (item) => item.category_display_name,
      },
      {
        header: '',
        render: (item) => (
          <PrimaryButtonWithIcon
            onClick={() => handleOpenCreateOrEditReservationModal(item.id)}
            disabled={isLoadingCreateItem}
          >
            選択して予約を作成
          </PrimaryButtonWithIcon>
        ),
        sx: { width: '200px' },
      },
    ];

  // ------------------- タブ定義 -------------------
  const tabs: TabDef[] = [{ key: 'connected_Mycalinks', value: `独自商品` }];

  return (
    <CustomTab
      tabs={tabs}
      containerSx={{
        borderBottomRightRadius: '8px',
        borderBottomLeftRadius: '8px',
      }}
      content={
        <CustomTable<BackendItemAPI[0]['response']['200']['items'][0]>
          columns={columns}
          rows={oneselfItems}
          rowKey={(row, index) => `${row.id}-${index}`}
          isLoading={isLoading}
        />
      }
    />
  );
};
