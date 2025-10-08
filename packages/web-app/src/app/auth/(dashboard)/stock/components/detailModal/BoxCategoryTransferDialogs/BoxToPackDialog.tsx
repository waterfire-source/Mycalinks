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

type Props = {
  open: boolean;
  onClose: () => void;
  sourceInfo: ConversionSourceInfo;
  targetInfo: ConversionTargetInfo;
  detailData: BackendProductAPI[0]['response']['200']['products'][0];
  onSuccess: () => void;
  productType: ProductType;
};

type PackItem = ConversionItemInfo & { openCount: number };

export const BoxToPackDialog = ({
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
  const [openCount, setOpenCount] = useState<number>(1);
  const [packList, setPackList] = useState<PackItem[]>([]);
  const [sourceProduct, setSourceProduct] = useState<any>(null);
  const [targetProducts, setTargetProducts] = useState<Map<string, any>>(
    new Map(),
  );

  const packData = targetInfo.packItems;

  const handleCountChange = (index: number, value: number) => {
    setPackList((prev) =>
      prev.map((p, i) => (i === index ? { ...p, openCount: value } : p)),
    );
  };

  const handleOpenBox = async () => {
    setLoading(true);
    try {
      const validProducts = packList.filter(
        (p) => p.pos_item_id && p.openCount > 0,
      );

      if (validProducts.length === 0) {
        setAlertState({
          message: '分割する商品を選択してください',
          severity: 'error',
        });
        return;
      }

      // stateから商品データを取得
      if (!sourceProduct) {
        setAlertState({
          message: '変換元の商品が見つかりません',
          severity: 'error',
        });
        return;
      }

      const toProducts = validProducts
        .map((validProduct) => {
          const targetProduct = targetProducts.get(
            String(validProduct.pos_item_id!),
          );
          if (!targetProduct) return null;

          return {
            product_id: targetProduct.id,
            item_count: validProduct.openCount,
          };
        })
        .filter(
          (p): p is { product_id: number; item_count: number } => p !== null,
        );

      if (toProducts.length !== validProducts.length) {
        setAlertState({
          message: '選択した商品に対応する在庫が見つかりません',
          severity: 'error',
        });
        return;
      }

      const res = await mycaPosApiClient.product.openBox({
        storeId: store.id,
        productId: sourceProduct.id,
        requestBody: {
          item_count: openCount,
          to_products: toProducts,
        },
      });

      if (res instanceof CustomError) {
        throw res;
      }

      // 変換履歴を保存
      const totalTargetQuantity = validProducts.reduce(
        (sum, p) => sum + p.openCount,
        0,
      );
      if (sourceProduct && totalTargetQuantity > 0) {
        saveBoxCategoryConvert({
          sourceProductId: String(sourceProduct.id),
          targetProductId: String(validProducts[0].pos_item_id!), // 最初のパック商品IDを代表として使用
          type: 'BOX_TO_PACK',
          sourceQuantity: openCount,
          targetQuantity: totalTargetQuantity,
        });
      }

      setAlertState({ message: 'パックへ分割しました', severity: 'success' });
      onSuccess();
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  // sourceProductとtargetProductsを設定（ダイアログが開かれた時）
  useEffect(() => {
    const fetchProducts = async () => {
      if (!open || !packData || packData.length === 0) return;

      // targetProductsを設定
      if (productType === 'BOX') {
        try {
          const itemRes = await apiClient.item.getAll({
            storeID: store.id,
            id: packData.map((p) => p.pos_item_id!),
            includesProducts: true,
          });

          if (itemRes instanceof CustomError) throw itemRes;

          const targetProductsMap = new Map();
          packData.forEach((pack) => {
            const item = itemRes.items.find((i) => i.id === pack.pos_item_id!);
            if (!item) return;

            const targetProduct = item.products.find(
              (p: any) =>
                p.condition_option_id === detailData.condition_option_id &&
                !p.is_special_price_product &&
                !p.consignment_client_id &&
                p.management_number === null &&
                !p.specialty_id,
            );

            if (targetProduct) {
              targetProductsMap.set(String(pack.pos_item_id!), targetProduct);
            }
          });

          setTargetProducts(targetProductsMap);
        } catch (err) {
          handleError(err);
          setTargetProducts(new Map());
        }
      } else {
        // productType !== 'BOX'の場合、detailDataからtargetProductsを設定
        const targetProductsMap = new Map();
        packData.forEach((pack) => {
          if (pack.pos_item_id === detailData.item_id) {
            targetProductsMap.set(String(pack.pos_item_id!), detailData);
          }
        });
        setTargetProducts(targetProductsMap);
      }

      // sourceProduct設定
      if (productType === 'BOX') {
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
    packData,
    productType,
    detailData,
    sourceInfo.currentItem.pos_item_id,
    store.id,
  ]);

  useEffect(() => {
    if (packData && packData.length > 0) {
      setPackList(
        packData.map((p, index) => {
          // 過去の履歴から1ボックスあたりのパック数を取得
          const historyData = sourceProduct
            ? getBoxCategoryConvert(String(sourceProduct.id), 'BOX_TO_PACK')
            : null;
          const historicalPackCount = historyData
            ? Math.floor(
                historyData.targetQuantity / historyData.sourceQuantity,
              )
            : 0;

          return {
            ...p,
            openCount:
              index === 0
                ? historicalPackCount || sourceInfo.packCountPerBox || 0
                : 0,
          };
        }),
      );
    }
  }, [packData, sourceProduct, sourceInfo.packCountPerBox]);

  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      title="ボックスにパックに分割する"
      onConfirm={handleOpenBox}
      confirmButtonText="分割"
      confirmButtonLoading={loading}
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
            suffixSx={{
              whiteSpace: 'nowrap',
              mr: '5px',
              fontWeight: 'bold',
            }}
            startSuffix="分割するボックス数"
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

          <Typography sx={{ fontWeight: 'bold' }}>変換先のパック</Typography>

          <Box sx={{ mt: '20px' }}>
            {packList.map((p, index) => {
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
                  <Box sx={{ width: '60px', height: '60px' }}>
                    <ItemImage imageUrl={p.image_url || ''} />
                  </Box>
                  <Box sx={{ flex: 1, mx: 2 }}>
                    <Typography>{p.displayNameWithMeta}</Typography>
                  </Box>
                  <NumericTextField
                    value={p.openCount}
                    sx={{ width: '80px' }}
                    min={0}
                    onChange={(value) => handleCountChange(index, value)}
                  />
                </Box>
              );
            })}
          </Box>
        </Box>
      }
    ></ConfirmationDialog>
  );
};
