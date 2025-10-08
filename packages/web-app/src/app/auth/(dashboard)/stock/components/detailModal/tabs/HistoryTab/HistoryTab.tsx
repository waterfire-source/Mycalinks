import { History } from '@/app/auth/(dashboard)/stock/components/detailModal/contents/History';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { ProductChangeHistory } from '@/feature/stock/changeHistory/useChangeHistory';

interface HistoryTabProps {
  detailData: BackendProductAPI[0]['response']['200']['products'][0][];
  fetchProducts: () => Promise<void>;
  histories: ProductChangeHistory[];
  fetchAllProducts?: () => Promise<void>;
  onCancelSpecialPrice?: () => Promise<void>;
  loading?: boolean;
}

export const HistoryTab = ({
  detailData,
  fetchProducts,
  histories,
  onCancelSpecialPrice,
  loading,
  fetchAllProducts,
}: HistoryTabProps) => {
  return (
    <History
      detailData={detailData}
      fetchProducts={fetchProducts}
      histories={histories}
      onCancelSpecialPrice={onCancelSpecialPrice}
      loading={loading}
      fetchAllProducts={fetchAllProducts}
    />
  );
};
