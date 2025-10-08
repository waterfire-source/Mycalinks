import { createClientAPI, CustomError } from '@/api/implement';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import {
  ConversionSourceInfo,
  ConversionTargetInfo,
  ConversionItemInfo,
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

type BoxItem = (ConversionItemInfo & { count: number }) | undefined;

type Props = {
  open: boolean;
  onClose: () => void;
  sourceInfo: ConversionSourceInfo;
  targetInfo: ConversionTargetInfo;
  detailData: BackendProductAPI[0]['response']['200']['products'][0];
  onSuccess: () => void;
  productType: ProductType;
};

export const CartonToBoxDialog = ({
  open,
  onClose,
  sourceInfo,
  targetInfo,
  detailData,
  onSuccess,
  productType,
}: Props) => {
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const { handleError } = useErrorAlert();
  const { getBoxCategoryConvert, saveBoxCategoryConvert } =
    useLocalStorageBoxCategory();

  const [loading, setLoading] = useState(false);
  const [openCount, setOpenCount] = useState<number>(1);
  const [boxInfo, setBoxInfo] = useState<BoxItem>(undefined);
  const [sourceProduct, setSourceProduct] = useState<any>(null);
  const [targetProduct, setTargetProduct] = useState<any>(null);

  const apiClient = createClientAPI();
  const mycaPosApiClient = new MycaPosApiClient({
    BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
  });

  const boxData = targetInfo.boxItem;

  const handleOpenCarton = async () => {
    try {
      setLoading(true);
      if (!boxInfo) return;

      // stateから商品データを取得
      if (!sourceProduct || !targetProduct) {
        setAlertState({
          message: '商品データが見つかりません',
          severity: 'error',
        });
        return;
      }

      const res = await mycaPosApiClient.product.openCarton({
        storeId: store.id,
        productId: sourceProduct.id,
        requestBody: {
          item_count: openCount,
          to_product: {
            product_id: targetProduct.id,
            item_count: boxInfo.count * openCount,
          },
        },
      });

      if (res instanceof CustomError) throw res;

      // 変換履歴を保存
      if (sourceProduct && targetProduct && boxInfo) {
        saveBoxCategoryConvert({
          sourceProductId: String(sourceProduct.id),
          targetProductId: String(targetProduct.id),
          type: 'CARTON_TO_BOX',
          sourceQuantity: openCount,
          targetQuantity: boxInfo.count * openCount,
        });
      }

      setAlertState({
        message: 'カートンをボックスに分割しました',
        severity: 'success',
      });
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
      if (!open || !boxData) return;

      // targetProductを設定
      if (productType === 'CARTON') {
        try {
          const itemRes = await apiClient.item.getAll({
            storeID: store.id,
            id: [boxData.pos_item_id || boxData.id],
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
      } else {
        setTargetProduct(detailData);
      }

      // sourceProduct設定
      if (productType === 'CARTON') {
        setSourceProduct(detailData);
      } else {
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
      }
    };

    fetchProducts();
  }, [
    open,
    boxData,
    productType,
    detailData,
    sourceInfo.currentItem.pos_item_id,
    store.id,
  ]);

  useEffect(() => {
    if (boxData) {
      // 過去の履歴から1カートンあたりのボックス数を取得
      const historyData = sourceProduct
        ? getBoxCategoryConvert(String(sourceProduct.id), 'CARTON_TO_BOX')
        : null;
      const historicalBoxCount = historyData
        ? Math.floor(historyData.targetQuantity / historyData.sourceQuantity)
        : 0;

      setBoxInfo({
        ...boxData,
        count: historicalBoxCount || sourceInfo.boxCountPerCarton || 0,
      });
    }
  }, [boxData, sourceProduct, sourceInfo.boxCountPerCarton]);

  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      title="カートンをボックスに分割する"
      confirmButtonLoading={loading}
      confirmButtonText="分割する"
      onConfirm={handleOpenCarton}
      content={
        <Box
          sx={{
            justifyContent: 'left',
            alignItems: 'start',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography sx={{ fontWeight: 'bold', mb: '20px' }}>
            以下の内容で分割します
            <br />
            誤りがある場合訂正して下さい
          </Typography>
          <NumericTextField
            value={openCount}
            onChange={(e) => setOpenCount(e)}
            min={1}
            max={detailData.stock_number || 0}
            suffixSx={{
              whiteSpace: 'nowrap',
              mr: '5px',
              fontWeight: 'bold',
            }}
            startSuffix="分割するカートン数"
          />

          <Typography sx={{ fontWeight: 'bold', mt: '20px' }}>
            変換元のカートン
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

          <Typography sx={{ fontWeight: 'bold' }}>変換先のボックス</Typography>
          <Box sx={{ mt: '20px' }}>
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
              }}
            >
              <Box sx={{ width: '60px', height: '60px' }}>
                <ItemImage imageUrl={boxInfo?.image_url || ''} />
              </Box>
              <Box sx={{ flex: 1, mx: 2 }}>
                <Typography>{boxInfo?.displayNameWithMeta}</Typography>
              </Box>
              <NumericTextField
                value={boxInfo?.count}
                onChange={(e) =>
                  setBoxInfo((prev) =>
                    prev ? { ...prev, count: e } : undefined,
                  )
                }
                sx={{ width: '80px' }}
                min={0}
              />
            </Box>
          </Box>
        </Box>
      }
    ></ConfirmationDialog>
  );
};
