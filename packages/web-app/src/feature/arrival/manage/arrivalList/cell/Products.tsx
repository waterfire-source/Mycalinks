import { BackendStockingAPI } from '@/app/api/store/[store_id]/stocking/api';
import { Chip } from '@/components/chips/Chip';
import { ItemText } from '@/feature/item/components/ItemText';
import { TableCell } from '@mui/material';

interface Props {
  products: BackendStockingAPI[5]['response']['200'][0]['stocking_products'];
  hasMultipleStore: boolean;
}
export const ArrivalProductsCell = ({ products, hasMultipleStore }: Props) => {
  // その他商品の数
  const otherProductsCount = products.length - 1;
  // TODO  一番多い商品
  const mainProduct = products[0];
  return (
    <TableCell sx={{ borderBottom: 'none' }}>
      <ItemText
        text={mainProduct ? mainProduct.product__displayNameWithMeta : ''}
        wrap
      />
      {otherProductsCount >= 1 && (
        <Chip text={`他${otherProductsCount}商品`} variant="secondary" />
      )}
    </TableCell>
  );
};
