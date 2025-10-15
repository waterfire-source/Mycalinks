import { LocationProduct } from '@/app/auth/(dashboard)/location/register/page';
import { ColumnDef, CustomTable } from '@/components/tables/CustomTable';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';
import { palette } from '@/theme/palette';
import { Typography } from '@mui/material';

type Props = { locationProducts: LocationProduct[] };

export const LocationRegisterTableContent = ({ locationProducts }: Props) => {
  const columns: ColumnDef<LocationProduct>[] = [
    {
      header: '商品画像',
      key: 'image_url',
      render: (product) => <ItemImage imageUrl={product.image_url} />,
    },
    {
      header: '商品名',
      key: 'display_name',
      render: (product) => <ItemText text={product.displayNameWithMeta} />,
      sx: {
        maxWidth: '150px',
      },
    },
    {
      header: '仕入れ値',
      key: 'mean_wholesale_price',
      render: (product) => (
        <Typography>
          {product?.average_wholesale_price?.toLocaleString()}円
        </Typography>
      ),
    },
    {
      header: '販売価格',
      key: 'sell_price',
      render: (product) => (
        <Typography>{product.sell_price?.toLocaleString()}円</Typography>
      ),
    },
    {
      header: '在庫数',
      key: 'stock_number',
      render: (product) => <Typography>{product.stock_number}</Typography>,
    },
    {
      header: '封入数',
      key: 'item_count',
      render: (product) => (
        <Typography>{product.itemCount.toLocaleString()}</Typography>
      ),
    },
  ];
  return (
    <CustomTable
      columns={columns}
      rows={locationProducts}
      rowKey={(product) => product.id}
      sx={{ borderTop: '8px solid', borderColor: palette.primary.main }}
    />
  );
};
