import { createClientAPI, CustomError } from '@/api/implement';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import {
  ConversionSourceInfo,
  ConversionTargetInfo,
  ProductType,
} from '@/app/auth/(dashboard)/stock/hooks/useCheckBoxInfo';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { useLocalStorageBoxCategory } from '@/feature/products/hooks/useLocalStorageBoxCategory';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import { Box, Typography } from '@mui/material';
import { MycaPosApiClient } from 'api-generator/client';
import { useEffect, useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  sourceInfo: ConversionSourceInfo;
  targetInfo: ConversionTargetInfo;
  detailData: BackendProductAPI[0]['response']['200']['products'][0];
  onSuccess: () => void;
  productType: ProductType;
};

export const BoxToCartonDialog = ({
  open,
  onClose,
  sourceInfo,
  targetInfo,
  detailData,
  onSuccess,
  productType,
}: Props) => {
  const { store } = useStore();
  const { handleError } = useErrorAlert();
  const { setAlertState } = useAlert();
  const { getBoxCategoryConvert, saveBoxCategoryConvert } =
    useLocalStorageBoxCategory();

  const apiClient = createClientAPI();
  const mycaPosApiClient = new MycaPosApiClient({
    BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
  });

  const [loading, setLoading] = useState(false);
  const [boxCountPerCarton, setBoxCountPerCarton] = useState<number>(1);
  const [createCount, setCreateCount] = useState<number>(1);
  const [sourceProduct, setSourceProduct] = useState<any>(null);
  const [targetProduct, setTargetProduct] = useState<any>(null);

  const cartonData = targetInfo.cartonItem;

  const handleCreateCarton = async () => {
    try {
      setLoading(true);
      if (!cartonData) return;

      // stateから商品データを取得
      if (!sourceProduct || !targetProduct) {
        setAlertState({
          message: '商品データが見つかりません',
          severity: 'error',
        });
        return;
      }

      const res = await mycaPosApiClient.product.restockCartonProduct({
        storeId: store.id,
        productId: targetProduct.id,
        requestBody: {
          item_count: createCount,
          from_product: {
            product_id: sourceProduct.id,
            item_count: boxCountPerCarton * createCount,
          },
        },
      });

      if (res instanceof CustomError) throw res;

      // 変換履歴を保存
      if (sourceProduct && targetProduct) {
        saveBoxCategoryConvert({
          sourceProductId: String(sourceProduct.id),
          targetProductId: String(targetProduct.id),
          type: 'BOX_TO_CARTON',
          sourceQuantity: boxCountPerCarton * createCount,
          targetQuantity: createCount,
        });
      }

      setAlertState({ message: 'カートンを補充しました', severity: 'success' });
      onSuccess();
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  // sourceProductとtargetProductを設定（ダイアログが開かれた時）
  useEffect(() => {
    const fetchProducts = async () => {
      if (!open || !cartonData) return;

      // targetProductを設定
      if (productType === 'CARTON') {
        setTargetProduct(detailData);
      } else {
        try {
          const itemRes = await apiClient.item.getAll({
            storeID: store.id,
            id: [cartonData.pos_item_id || cartonData.id],
            includesProducts: true,
          });

          if (itemRes instanceof CustomError) throw itemRes;

          const targetItem = itemRes.items[0];
          const targetProductData = targetItem?.products.find(
            (p: any) =>
              p.condition_option_id === detailData.condition_option_id &&
              !p.is_special_price_product &&
              !p.consignment_client_id &&
              p.management_number === null &&
              !p.specialty_id,
          );

          setTargetProduct(targetProductData);
        } catch (err) {
          handleError(err);
          setTargetProduct(null);
        }
      }

      //sourceProduct設定
      if (productType === 'CARTON') {
        try {
          const itemRes = await apiClient.item.getAll({
            storeID: store.id,
            id: [sourceInfo.currentItem.pos_item_id!],
            includesProducts: true,
          });

          if (itemRes instanceof CustomError) throw itemRes;

          const sourceItem = itemRes.items[0];
          const sourceProductData = sourceItem?.products.find(
            (p: any) =>
              p.condition_option_id === detailData.condition_option_id &&
              !p.is_special_price_product &&
              !p.consignment_client_id &&
              p.management_number === null &&
              !p.specialty_id,
          );

          setSourceProduct(sourceProductData);
        } catch (err) {
          handleError(err);
          setSourceProduct(null);
        }
      } else {
        setSourceProduct(detailData);
      }
    };

    fetchProducts();
  }, [
    open,
    cartonData,
    productType,
    detailData,
    sourceInfo.currentItem.pos_item_id,
    store.id,
  ]);

  // 過去の履歴から1カートンあたりのボックス数を取得
  useEffect(() => {
    if (open && sourceProduct) {
      const historyData = getBoxCategoryConvert(
        String(sourceProduct.id),
        'BOX_TO_CARTON',
      );
      if (historyData) {
        const historicalBoxCount = Math.floor(
          historyData.sourceQuantity / historyData.targetQuantity,
        );
        if (historicalBoxCount > 0) {
          setBoxCountPerCarton(historicalBoxCount);
        }
      }
    }
  }, [open, sourceProduct]);

  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      title="ボックスをカートンにまとめる"
      confirmButtonText="まとめる"
      onConfirm={handleCreateCarton}
      confirmButtonLoading={loading}
      content={
        <Box
          sx={{
            width: '100%',
            justifyContent: 'left',
            alignItems: 'start',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography sx={{ fontWeight: 'bold' }}>
            以下の内容でカートンにまとめます
            <br />
            誤りがある場合訂正して下さい
          </Typography>
          <NumericTextField
            value={boxCountPerCarton}
            onChange={(e) => setBoxCountPerCarton(e)}
            min={1}
            sx={{ mb: '20px' }}
            suffixSx={{
              whiteSpace: 'nowrap',
              mr: '5px',
              fontWeight: 'bold',
            }}
            startSuffix="1カートンあたりのボックス数"
          />
          <NumericTextField
            value={createCount}
            onChange={(e) => setCreateCount(e)}
            min={1}
            suffixSx={{
              whiteSpace: 'nowrap',
              mr: '5px',
              fontWeight: 'bold',
            }}
            startSuffix="作成するカートン数"
            endSuffix={`${createCount * boxCountPerCarton}ボックス消費`}
          />

          <Typography sx={{ fontWeight: 'bold', mt: '20px' }}>
            変換元のボックス
          </Typography>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              border: '1px solid #ccc',
              borderRadius: '4px',
              p: 2,
              mb: 2,
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f5f5f5',
            }}
          >
            <Box sx={{ width: '60px', height: '60px', mr: 2 }}>
              <ItemImage imageUrl={sourceInfo.currentItem.image_url || ''} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography>
                {sourceInfo.currentItem.displayNameWithMeta}
              </Typography>
            </Box>
          </Box>

          <Typography sx={{ fontWeight: 'bold' }}>変換先のカートン</Typography>

          <Box
            sx={{
              width: '100%',
              display: 'flex',
              border: '1px solid #ccc',
              borderRadius: '4px',
              p: 2,
              mb: 1,
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: '20px',
            }}
          >
            <Box sx={{ width: '60px', height: '60px', mr: 2 }}>
              <ItemImage imageUrl={cartonData?.image_url || ''} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography>{cartonData?.displayNameWithMeta}</Typography>
            </Box>
          </Box>
        </Box>
      }
    ></ConfirmationDialog>
  );
};
