import React from 'react';
import { CustomTable, ColumnDef } from '@/components/tables/CustomTable';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';
import { Stack, Typography } from '@mui/material';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { palette } from '@/theme/palette';
import { injectedProductRow } from '@/app/auth/(dashboard)/inventory-count/components/modal/InjectWholesaleModal';

type Props = {
  rows: injectedProductRow[];
  setRows: React.Dispatch<React.SetStateAction<injectedProductRow[]>>;
};

export const InventoryInjectWholesaleTable = ({ rows, setRows }: Props) => {
  const handleWholesalePriceChange = (productId: number, price: number) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.product_id === productId
          ? { ...row, injectedWholesalePrice: price || undefined }
          : row,
      ),
    );
  };

  const columns: ColumnDef<injectedProductRow>[] = [
    {
      header: '商品画像',
      key: 'image_url',
      render: (row) => (
        <ItemImage imageUrl={row.product.image_url} height={70} />
      ),
      sx: { width: '120px' },
    },
    {
      header: '商品名',
      key: 'display_name',
      render: (row) => (
        <Stack direction="column" alignItems="left">
          <ItemText text={row.product.displayNameWithMeta ?? '-'} />
        </Stack>
      ),
      sx: { minWidth: '200px', flex: 3 },
    },
    {
      header: '状態',
      key: 'condition',
      render: (row) => (
        <Stack width="100%">
          <Typography>{row.product.condition.display_name}</Typography>
        </Stack>
      ),
      sx: { minWidth: '120px', flex: 1 },
    },
    {
      header: '登録数',
      key: 'stock_number',
      render: (row) => (
        <Stack width="100%">
          <Typography>{row.item_count}</Typography>
        </Stack>
      ),
      sx: { minWidth: '100px', flex: 1 },
    },
    {
      header: '仕入れ値',
      key: 'injected_wholesale_price',
      render: (row) => (
        <Stack width="100%" alignItems="center">
          <NumericTextField
            value={row.injectedWholesalePrice || 0}
            onChange={(value) =>
              handleWholesalePriceChange(row.product_id, value)
            }
            suffix="円"
            sx={{ width: '80%', maxWidth: '300px' }}
          />
        </Stack>
      ),
      sx: { minWidth: '180px', flex: 1.5 },
    },
  ];

  return (
    <CustomTable
      columns={columns}
      rows={rows}
      rowKey={(row) => row.product_id}
      sx={{
        height: '100%',
        overflow: 'auto',
        borderTop: '8px solid',
        borderColor: palette.primary.main,
      }}
    />
  );
};
