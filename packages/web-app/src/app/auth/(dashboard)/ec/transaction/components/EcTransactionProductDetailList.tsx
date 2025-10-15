import { EcTransactionProductDetail } from '@/app/auth/(dashboard)/ec/transaction/components/EcTransactionProductDetail';
import { EcOrderByStoreInfoType } from '@/app/auth/(dashboard)/ec/transaction/type';
import { useStore } from '@/contexts/StoreContext';
import { useProducts } from '@/feature/products/hooks/useProducts';
import { Box, CircularProgress } from '@mui/material';
import { useEffect } from 'react';

interface Props {
  transactionProducts: EcOrderByStoreInfoType['products'];
}

//取引した商品の詳細情報をカード形式で表示
export const EcTransactionProductDetailList = ({
  transactionProducts,
}: Props) => {
  const { store } = useStore();
  const {
    products: productDetails,
    listProductsByProductIDs,
    isLoadingGetProducts,
    handelResetProducts,
  } = useProducts();

  useEffect(() => {
    handelResetProducts();
    const productIDs = transactionProducts.map((product) => product.product.id);
    listProductsByProductIDs(store.id, productIDs);
  }, [transactionProducts, listProductsByProductIDs, store.id]);

  return (
    <>
      {isLoadingGetProducts ? (
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            py: 2,
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          {transactionProducts.map((product) => {
            const matchedDetail = productDetails?.find(
              (detail) => detail.id === product.product.id,
            );
            return (
              <EcTransactionProductDetail
                key={product.id}
                transactionProduct={product}
                productDetail={matchedDetail}
              />
            );
          })}
        </>
      )}
    </>
  );
};
