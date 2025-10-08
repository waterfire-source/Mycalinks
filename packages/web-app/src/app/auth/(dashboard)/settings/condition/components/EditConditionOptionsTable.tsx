import { DisplayNameField } from '@/app/auth/(dashboard)/settings/condition/components/DisplayNameField';
import { CardConditionOption } from '@/app/auth/(dashboard)/settings/condition/page';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { ColumnDef, CustomTable } from '@/components/tables/CustomTable';
import { useStore } from '@/contexts/StoreContext';
import { Delete, Build } from '@mui/icons-material';
import { Stack, Button } from '@mui/material';
import { MycaPosApiClient } from 'api-generator/client';
import { Dispatch, SetStateAction } from 'react';

interface EditConditionOptionsTableProps {
  conditionOptions: CardConditionOption[];
  itemCategoryId: number;
  createdConditionOptions: CardConditionOption[];
  setCreatedConditionOptions: Dispatch<SetStateAction<CardConditionOption[]>>;
  updatedConditionOptions: CardConditionOption[];
  setUpdatedConditionOptions: Dispatch<SetStateAction<CardConditionOption[]>>;
  deletedConditionOptionIds: number[];
  setDeletedConditionOptionIds: Dispatch<SetStateAction<number[]>>;
}

export const EditConditionOptionsTable = ({
  conditionOptions,
  itemCategoryId,
  createdConditionOptions,
  setCreatedConditionOptions,
  updatedConditionOptions,
  setUpdatedConditionOptions,
  deletedConditionOptionIds,
  setDeletedConditionOptionIds,
}: EditConditionOptionsTableProps) => {
  const isConditionOptionUpdated = (
    prevValue: CardConditionOption,
    newValue: CardConditionOption,
  ) => {
    return (
      prevValue.displayName !== newValue.displayName ||
      prevValue.rateVariants[0].autoSellPriceAdjustment !==
        newValue.rateVariants[0].autoSellPriceAdjustment ||
      prevValue.rateVariants[0].autoBuyPriceAdjustment !==
        newValue.rateVariants[0].autoBuyPriceAdjustment
    );
  };

  const { store } = useStore();

  const changeConditionOptions = (
    key: 'displayName' | 'autoSellPriceAdjustment' | 'autoBuyPriceAdjustment',
    value: string,
    row: CardConditionOption,
  ) => {
    if (key === 'displayName' && row.displayName !== value) {
      const updatedRow = {
        ...row,
        displayName: value,
      };

      if (row.id < 0) {
        // 新しく作成された状態を追加(仮でidを負の値として作成している)
        setCreatedConditionOptions(
          [
            ...createdConditionOptions.filter((option) => option.id !== row.id),
            updatedRow,
          ].sort((a, b) => b.id - a.id),
        );
      } else {
        setUpdatedConditionOptions([
          ...updatedConditionOptions.filter((option) => option.id !== row.id),
          ...(isConditionOptionUpdated(
            conditionOptions.find((option) => option.id === row.id)!,
            updatedRow,
          )
            ? [updatedRow]
            : []),
        ]);
      }
    } else if (key !== 'displayName' && row.rateVariants[0][key] !== value) {
      const updatedRateVariants = row.rateVariants.map((variant, index) =>
        index === 0 ? { ...variant, [key]: value } : variant,
      );

      const updatedRow = {
        ...row,
        rateVariants: updatedRateVariants,
      };

      if (row.id < 0) {
        // 新しく作成された状態を追加(仮でidを負の値として作成している)
        setCreatedConditionOptions(
          [
            ...createdConditionOptions.filter((option) => option.id !== row.id),
            updatedRow,
          ].sort((a, b) => b.id - a.id),
        );
      } else {
        setUpdatedConditionOptions([
          ...updatedConditionOptions.filter((option) => option.id !== row.id),
          ...(isConditionOptionUpdated(
            conditionOptions.find((option) => option.id === row.id)!,
            updatedRow,
          )
            ? [updatedRow]
            : []),
        ]);
      }
    }
  };

  const columns: ColumnDef<CardConditionOption>[] = [
    {
      header: '状態名',
      key: 'displayName',
      render: (row) => (
        <DisplayNameField
          value={
            updatedConditionOptions.find((option) => option.id === row.id)
              ?.displayName ?? row.displayName
          }
          onChange={(value) =>
            changeConditionOptions(
              'displayName',
              value,
              updatedConditionOptions.find((option) => option.id === row.id) ??
                row,
            )
          }
        />
      ),
    },
    {
      header: '販売%',
      key: 'sellPercent',
      render: (row) => (
        <Stack
          direction="row"
          gap={1}
          alignItems="center"
          justifyContent="center"
        >
          <NumericTextField
            value={Number(
              updatedConditionOptions
                .find((option) => option.id === row.id)
                ?.rateVariants[0].autoSellPriceAdjustment.replace('%', '') ??
                row.rateVariants[0].autoSellPriceAdjustment.replace('%', ''),
            )}
            onChange={(value) =>
              changeConditionOptions(
                'autoSellPriceAdjustment',
                value + '%',
                updatedConditionOptions.find(
                  (option) => option.id === row.id,
                ) ?? row,
              )
            }
          />
          %
        </Stack>
      ),
    },
    {
      header: '仕入%',
      key: 'buyPercent',
      render: (row) => (
        <Stack
          direction="row"
          gap={1}
          alignItems="center"
          justifyContent="center"
        >
          <NumericTextField
            value={Number(
              updatedConditionOptions
                .find((option) => option.id === row.id)
                ?.rateVariants[0].autoBuyPriceAdjustment.replace('%', '') ??
                row.rateVariants[0].autoBuyPriceAdjustment.replace('%', ''),
            )}
            onChange={(value) =>
              changeConditionOptions(
                'autoBuyPriceAdjustment',
                value + '%',
                updatedConditionOptions.find(
                  (option) => option.id === row.id,
                ) ?? row,
              )
            }
          />
          %
        </Stack>
      ),
    },
    {
      header: '削除',
      key: 'delete',
      render: (row) => (
        <Button
          onClick={() => {
            if (row.id < 0) {
              // 新しく作成された状態の場合(仮でidを負の値として作成している)
              setCreatedConditionOptions(
                createdConditionOptions.filter(
                  (option) => option.id !== row.id,
                ),
              );
            } else {
              setDeletedConditionOptionIds([
                ...deletedConditionOptionIds,
                row.id,
              ]);
            }
          }}
          sx={{
            color: 'grey.700',
            '&:hover': {
              color: 'grey.800',
            },
            '&:disabled': {
              color: 'grey.800',
            },
          }}
        >
          <Delete />
        </Button>
      ),
    },
    {
      header: '在庫不足分作成',
      key: 'delete',
      render: (row) => (
        <Button
          onClick={async () => {
            const client = new MycaPosApiClient({
              BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
            });

            const res = await client.item.regenerateConditionOptionProducts({
              storeId: store.id,
              itemCategoryId: itemCategoryId,
              conditionOptionId: row.id,
            });

            console.log(res);
            alert('在庫不足分作成が完了しました');
          }}
          sx={{
            color: 'grey.700',
            '&:hover': {
              color: 'grey.800',
            },
            '&:disabled': {
              color: 'grey.800',
            },
          }}
        >
          <Build />
        </Button>
      ),
    },
  ];

  return (
    <CustomTable<CardConditionOption>
      rows={[...conditionOptions, ...createdConditionOptions].filter(
        (option) => !deletedConditionOptionIds.includes(option.id),
      )}
      columns={columns}
      rowKey={(row) => row.id}
    />
  );
};
