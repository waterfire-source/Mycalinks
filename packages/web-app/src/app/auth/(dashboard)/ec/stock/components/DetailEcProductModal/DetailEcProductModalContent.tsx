import { DetailEcProduct } from '@/app/auth/(dashboard)/ec/stock/components/DetailEcProductModal/DetailEcProduct/DetailEcProduct';
import { ProductEcOrderHistory } from '@/app/auth/(dashboard)/ec/stock/components/DetailEcProductModal/ProductEcOrderHistory/ProductEcOrderHistory';
import { ProductSearchState } from '@/feature/products/hooks/useNewProductSearch';
import { Grid } from '@mui/material';

interface Props {
  productId: number;
  actualEcSellPrice: number | undefined;
  setActualEcSellPrice: React.Dispatch<
    React.SetStateAction<number | undefined>
  >;
  posReservedStockNumber: number | undefined;
  setPosReservedStockNumber: React.Dispatch<
    React.SetStateAction<number | undefined>
  >;
  publishStoreInfos: {
    displayName: string;
    icon: string;
    ImageUrl?: string;
  }[];
  fetchProducts: () => void;
  searchState: ProductSearchState;
  canDisableEcAutoStocking: boolean;
  setCanDisableEcAutoStocking: React.Dispatch<React.SetStateAction<boolean>>;
}

export const DetailEcProductModalContent = ({
  productId,
  actualEcSellPrice,
  setActualEcSellPrice,
  posReservedStockNumber,
  setPosReservedStockNumber,
  publishStoreInfos,
  fetchProducts,
  searchState,
  canDisableEcAutoStocking,
  setCanDisableEcAutoStocking,
}: Props) => {
  return (
    <Grid container columnSpacing={1} mt={2}>
      {/* // 左側 */}
      <Grid item xs={4} height="100%">
        <DetailEcProduct
          productId={productId}
          actualEcSellPrice={actualEcSellPrice}
          setActualEcSellPrice={setActualEcSellPrice}
          posReservedStockNumber={posReservedStockNumber}
          setPosReservedStockNumber={setPosReservedStockNumber}
          publishStoreInfos={publishStoreInfos}
          fetchProducts={fetchProducts}
          searchState={searchState}
          canDisableEcAutoStocking={canDisableEcAutoStocking}
          setCanDisableEcAutoStocking={setCanDisableEcAutoStocking}
        />
      </Grid>

      {/* // 右側 */}
      <Grid item xs={8} height="100%">
        <ProductEcOrderHistory productId={productId} />
      </Grid>
    </Grid>
  );
};
