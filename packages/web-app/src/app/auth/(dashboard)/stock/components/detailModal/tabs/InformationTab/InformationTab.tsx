import { Information } from '@/app/auth/(dashboard)/stock/components/detailModal/contents/information';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { ProductImageData } from '@/feature/products/hooks/useUpdateProductImages';
import { Product } from '@prisma/client';

interface InformationTabProps {
  detailData: BackendProductAPI[0]['response']['200']['products'][0][];
  formData?: Partial<Product> & {
    allow_sell_price_auto_adjustment?: boolean;
    allow_buy_price_auto_adjustment?: boolean;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<
      | (Partial<Product> & {
          allow_sell_price_auto_adjustment?: boolean;
          allow_buy_price_auto_adjustment?: boolean;
        })
      | undefined
    >
  >;
  wholesalePrice?: BackendProductAPI[9]['response']['200'];
  isStockSaveModalOpen: boolean;
  setIsStockSaveModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isResetSpecificPrice: boolean;
  setIsResetSpecificPrice: React.Dispatch<React.SetStateAction<boolean>>;
  setIsStockChange: React.Dispatch<React.SetStateAction<boolean>>;
  fetchProducts: () => Promise<void>;
  storeId: number;
  productId: number;
  fetchAllProducts?: () => Promise<void>;
  onCancelSpecialPrice?: () => Promise<void>;
  loading?: boolean;
  productImages: ProductImageData[];
  setProductImages: React.Dispatch<React.SetStateAction<ProductImageData[]>>;
  setIsImagesChanged: React.Dispatch<React.SetStateAction<boolean>>;
}

export const InformationTab = ({
  detailData,
  formData,
  setFormData,
  wholesalePrice,
  isStockSaveModalOpen,
  setIsStockSaveModalOpen,
  isResetSpecificPrice,
  setIsResetSpecificPrice,
  setIsStockChange,
  fetchProducts,
  storeId,
  productId,
  fetchAllProducts,
  onCancelSpecialPrice,
  loading,
  productImages,
  setProductImages,
  setIsImagesChanged,
}: InformationTabProps) => {
  return (
    <Information
      detailData={detailData}
      formData={formData}
      setFormData={setFormData}
      wholesalePrice={wholesalePrice}
      isStockSaveModalOpen={isStockSaveModalOpen}
      setIsStockSaveModalOpen={setIsStockSaveModalOpen}
      isResetSpecificPrice={isResetSpecificPrice}
      setIsResetSpecificPrice={setIsResetSpecificPrice}
      setIsStockChange={setIsStockChange}
      fetchProducts={fetchProducts}
      storeId={storeId}
      productId={productId}
      fetchAllProducts={fetchAllProducts}
      onCancelSpecialPrice={onCancelSpecialPrice}
      loading={loading}
      productImages={productImages}
      setProductImages={setProductImages}
      setIsImagesChanged={setIsImagesChanged}
    />
  );
};
