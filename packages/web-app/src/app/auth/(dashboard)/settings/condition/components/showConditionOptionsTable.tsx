import { CardConditionOption } from '@/app/auth/(dashboard)/settings/condition/page';
import { CustomDndTable } from '@/components/tables/CustomDndTable';
import { ColumnDef } from '@/components/tables/CustomTable';
import { MycaPosApiClient } from 'api-generator/client';
import { useStore } from '@/contexts/StoreContext';
import { useAlert } from '@/contexts/AlertContext';
interface ShowConditionOptionsTableProps {
  conditionOptions: CardConditionOption[];
  cardCategoryId: number;
}

export const ShowConditionOptionsTable = ({
  conditionOptions,
  cardCategoryId,
}: ShowConditionOptionsTableProps) => {
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const columns: ColumnDef<CardConditionOption>[] = [
    {
      header: '状態名',
      key: 'displayName',
      render: (row) => row.displayName,
    },
    {
      header: '販売%',
      key: 'sellPercent',
      render: (row) => row.rateVariants[0].autoSellPriceAdjustment,
    },
    {
      header: '仕入%',
      key: 'buyPercent',
      render: (row) => row.rateVariants[0].autoBuyPriceAdjustment,
    },
  ];
  const client = new MycaPosApiClient({
    BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
  });

  return (
    <CustomDndTable<CardConditionOption>
      rows={conditionOptions}
      columns={columns}
      rowKey={(row) => row.id}
      onRowOrderChange={(newRows) => {
        try {
          newRows.forEach(async (row, index) => {
            await client.item.createOrUpdateConditionOption({
              storeId: store.id,
              itemCategoryId: cardCategoryId,
              requestBody: {
                id: row.id,
                order_number: index + 1,
              },
            });
          });
          setAlertState({
            message: '状態設定を並び替えました',
            severity: 'success',
          });
        } catch (error) {
          console.error('エラーが発生しました: ', error);
          setAlertState({
            message: 'エラーが発生しました',
            severity: 'error',
          });
        }
      }}
    />
  );
};
