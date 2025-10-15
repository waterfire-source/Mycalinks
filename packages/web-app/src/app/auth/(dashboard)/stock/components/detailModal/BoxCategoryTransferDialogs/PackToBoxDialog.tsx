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
import { Box, Typography, Checkbox } from '@mui/material';
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

type BoxItem = (ConversionItemInfo & { isSelect: boolean })[];

export const PackToBoxDialog = ({
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
  const [packCountPerBox, setPackCountPerBox] = useState<number>(1);
  const [createCount, setCreateCount] = useState<number>(1);
  const [boxInfo, setBoxInfo] = useState<BoxItem>([]);
  const [sourceProduct, setSourceProduct] = useState<any>(null);
  const [targetProduct, setTargetProduct] = useState<any>(null);

  const apiClient = createClientAPI();
  const mycaPosApiClient = new MycaPosApiClient({
    BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
  });

  const boxData = targetInfo.boxItems || [];

  const handleCheck = (index: number) => {
    setBoxInfo((prev) =>
      prev.map((b, i) =>
        i === index ? { ...b, isSelect: true } : { ...b, isSelect: false },
      ),
    );
  };

  const handleCreateBox = async () => {
    setLoading(true);
    const targetBox = boxInfo.find((b) => b.isSelect);
    try {
      if (!targetBox || !targetBox.pos_item_id)
        return setAlertState({
          message: '変換先の商品を選択して下さい',
          severity: 'error',
        });

      // stateから商品データを取得
      if (!sourceProduct || !targetProduct) {
        setAlertState({
          message: '商品データが見つかりません',
          severity: 'error',
        });
        return;
      }

      const res = await mycaPosApiClient.product.restockBoxProduct({
        storeId: store.id,
        productId: targetProduct.id,
        requestBody: {
          item_count: createCount,
          from_product: {
            product_id: sourceProduct.id,
            item_count: packCountPerBox * createCount,
          },
        },
      });

      if (res instanceof CustomError) throw res;

      // 変換履歴を保存
      if (sourceProduct && targetProduct) {
        saveBoxCategoryConvert({
          sourceProductId: String(sourceProduct.id),
          targetProductId: String(targetProduct.id),
          type: 'PACK_TO_BOX',
          sourceQuantity: packCountPerBox * createCount,
          targetQuantity: createCount,
        });
      }

      setAlertState({ message: 'ボックスにまとめました', severity: 'success' });
      onSuccess();
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  // sourceProductとtargetProductを設定（ダイアログが開かれた時とボックス選択時）
  useEffect(() => {
    const fetchProducts = async () => {
      if (!open) return;

      const selectedBox = boxInfo.find((b) => b.isSelect);

      // targetProductを設定
      if (productType === 'PACK') {
        if (!selectedBox?.pos_item_id) {
          setTargetProduct(null);
        } else {
          try {
            const itemRes = await apiClient.item.getAll({
              storeID: store.id,
              id: [selectedBox.pos_item_id],
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
      } else {
        setTargetProduct(detailData);
      }

      // sourceProduct設定
      if (productType === 'PACK') {
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
    boxInfo,
    detailData,
    productType,
    sourceInfo.currentItem.pos_item_id,
    store.id,
  ]);

  useEffect(() => {
    if (boxData.length > 0) {
      setBoxInfo(boxData.map((b, index) => ({ ...b, isSelect: index === 0 })));

      // 過去の履歴から1ボックスあたりのパック数を取得
      const historyData = sourceProduct
        ? getBoxCategoryConvert(String(sourceProduct.id), 'PACK_TO_BOX')
        : null;
      if (historyData) {
        const historicalPackCount = Math.floor(
          historyData.sourceQuantity / historyData.targetQuantity,
        );
        if (historicalPackCount > 0) {
          setPackCountPerBox(historicalPackCount);
        }
      }
    } else {
      setBoxInfo([]);
    }
  }, [boxData, sourceProduct]);

  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      title="パックをボックスにまとめる"
      confirmButtonLoading={loading}
      confirmButtonText="まとめる"
      onConfirm={handleCreateBox}
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
            以下の内容でまとめます
            <br />
            誤りがある場合訂正して下さい
          </Typography>
          <NumericTextField
            value={packCountPerBox}
            onChange={(e) => setPackCountPerBox(e)}
            min={1}
            sx={{ mb: '20px' }}
            suffixSx={{
              whiteSpace: 'nowrap',
              mr: '5px',
              fontWeight: 'bold',
            }}
            startSuffix="1ボックスあたりのパック数"
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
            startSuffix="作成するボックス数"
            endSuffix={`${createCount * packCountPerBox}パック消費`}
          />

          <Typography sx={{ fontWeight: 'bold', mt: '20px' }}>
            変換元のパック
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
            <Box>
              {boxInfo.map((b, index) => {
                return (
                  <Box
                    key={index}
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
                    <Checkbox
                      checked={b.isSelect}
                      onChange={() => handleCheck(index)}
                      sx={{ mr: 2 }}
                    />
                    <Box sx={{ width: '60px', height: '60px', mr: 2 }}>
                      <ItemImage imageUrl={b.image_url || ''} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography>{b.displayNameWithMeta}</Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      }
    ></ConfirmationDialog>
  );
};
