import { PurchaseDetail } from '@/app/auth/(dashboard)/stock/components/detailModal/contents/PurchaseDetail';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { Product_Wholesale_Price_History } from '@prisma/client';

interface PurchaseDetailTabProps {
  detailData: BackendProductAPI[0]['response']['200']['products'][0][];
  originalWholesalePrices?: Product_Wholesale_Price_History[];
  onCancelSpecialPrice?: () => Promise<void>;
  loading?: boolean;
  fetchProducts: () => Promise<void>;
  fetchAllProducts?: () => Promise<void>;
}

export const PurchaseDetailTab = ({
  detailData,
  originalWholesalePrices,
  onCancelSpecialPrice,
  loading,
  fetchProducts,
  fetchAllProducts,
}: PurchaseDetailTabProps) => {
  return (
    <PurchaseDetail
      detailData={detailData}
      originalWholesalePrices={originalWholesalePrices}
      onCancelSpecialPrice={onCancelSpecialPrice}
      loading={loading}
      fetchProducts={fetchProducts}
      fetchAllProducts={fetchAllProducts}
    />
  );
};
