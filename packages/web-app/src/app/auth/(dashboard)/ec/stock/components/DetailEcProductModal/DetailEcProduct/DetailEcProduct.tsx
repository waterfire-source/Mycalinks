import { TextField } from '@mui/material';
import { toHalfWidth } from '@/utils/convertToHalfWidth';
import { useStore } from '@/contexts/StoreContext';
import { ShopIcon } from '@/feature/ec/components/ShopIcon';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ProductSearchState } from '@/feature/products/hooks/useNewProductSearch';
import { ecShopCommonConstants } from '@/constants/ecShops';
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import HelpSharpIcon from '@mui/icons-material/HelpSharp';
import { ItemText } from '@/feature/item/components/ItemText';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { useUpdateProduct } from '@/feature/products/hooks/useUpdateProduct';
import { useAlert } from '@/contexts/AlertContext';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { useUnifyPricing } from '@/feature/ec/stock/hooks/useUnifyPricing';
import { PriceUnificationConfirmModal } from '@/feature/ec/stock/components/PriceUnificationConfirmModal';
import { HelpIcon } from '@/components/common/HelpIcon';

interface Props {
  productId: number;
  actualEcSellPrice: number | undefined;
  setActualEcSellPrice: React.Dispatch<
    React.SetStateAction<number | undefined>
  >;
  posReservedStockNumber: number | null | undefined;
  setPosReservedStockNumber: React.Dispatch<
    React.SetStateAction<number | null | undefined>
  >;
  canDisableEcAutoStocking: boolean;
  setCanDisableEcAutoStocking: React.Dispatch<React.SetStateAction<boolean>>;
  refetchProducts: () => Promise<void>;
  searchState: ProductSearchState;
}

export const DetailEcProduct = ({
  productId,
  actualEcSellPrice,
  setActualEcSellPrice,
  posReservedStockNumber,
  setPosReservedStockNumber,
  canDisableEcAutoStocking,
  setCanDisableEcAutoStocking,
  refetchProducts,
  searchState,
}: Props) => {
  const { store } = useStore();
  const { updateProduct, isLoadingUpdateProduct } = useUpdateProduct();
  const { setAlertState } = useAlert();

  const [open, setOpen] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [isEdit, setIsEdit] = useState<{ [key: string]: boolean }>({
    actualEcSellPrice: false,
    posReservedStockNumber: false,
  });

  // 価格統一確認モーダルの状態
  const [showPriceUnificationModal, setShowPriceUnificationModal] =
    useState(false);
  const [pendingPriceAction, setPendingPriceAction] = useState<{
    type: 'confirm' | 'reset';
    price: number;
  } | null>(null);

  // 選択された商品 (ローディング中ごとにリセット
  const selectedProduct = useMemo(() => {
    return searchState.searchResults.find((result) => result.id === productId);
  }, [searchState.searchResults, productId, searchState.isLoading, open]);

  // 価格統一機能
  const unifyPricing = useUnifyPricing({
    baseProducts: selectedProduct ? [selectedProduct] : [],
    storeId: store.id,
    enabled: true,
  });
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    // クリックで開けた状態を維持したい場合は hover を無視
    if (!hovering) setOpen(false);
  };

  // 検索結果が取得できたら各種初期値を設定
  useEffect(() => {
    if (searchState.searchResults.length > 0) {
      // リセット後は最新のデータでactualEcSellPriceも更新
      // →specificEcSellPriceにnullを入れてからサーバー側で数を合わせているから時差が生まれるのでは
      setActualEcSellPrice(selectedProduct?.actual_ec_sell_price ?? undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchState.searchResults]);

  // 価格統一機能を有効化
  useEffect(() => {
    if (selectedProduct) {
      unifyPricing.setEnableUnifyPricing(true);
    }
  }, [selectedProduct, unifyPricing]);

  // 価格統一処理を実行する共通関数
  const executeUnifyPricing = async (price: number) => {
    try {
      if (unifyPricing.unifyTargetCount > 1) {
        await unifyPricing.executeUnifyPricing(price);
        setAlertState({
          message: `同じカードの${
            unifyPricing.unifyTargetCount
          }個の商品の価格も${price.toLocaleString()}円に統一されました。`,
          severity: 'success',
        });
      }
    } catch (error) {
      console.error('価格統一処理でエラーが発生しました:', error);
      setAlertState({
        message: '価格統一処理に失敗しました。',
        severity: 'error',
      });
    }
  };

  // 価格統一確認モーダルの確認処理
  const handlePriceUnificationConfirm = async (unifyPricesByCard: {
    [cardId: string]: number;
  }) => {
    setShowPriceUnificationModal(false);

    if (pendingPriceAction) {
      // 統一価格を取得（最初の価格を使用）
      const unifyPrice =
        Object.values(unifyPricesByCard)[0] || pendingPriceAction.price;

      if (pendingPriceAction.type === 'confirm') {
        // 商品の価格を更新
        await updateProductState();
        // 価格統一処理を実行
        await executeUnifyPricing(unifyPrice);
      } else if (pendingPriceAction.type === 'reset') {
        // リセット処理を実行
        await updateProduct(store.id, productId, {
          specificEcSellPrice: null,
        });
        // stateもリセット
        setActualEcSellPrice(pendingPriceAction.price);
        // 価格統一処理を実行
        await executeUnifyPricing(unifyPrice);
      }

      setPendingPriceAction(null);
      await refetchProducts();
    }
  };

  // 出品価格と店頭用在庫数を更新する関数
  const updateProductState = async () => {
    try {
      await updateProduct(store.id, productId, {
        specificEcSellPrice: actualEcSellPrice,
        posReservedStockNumber,
      });
    } catch (error) {
      setAlertState({
        message: '更新に失敗しました。',
        severity: 'error',
      });
    }
  };

  // 出品価格を商品マスタの価格にリセットする関数
  const resetEcSellPrice = async () => {
    const resetPrice = selectedProduct?.ec_sell_price;

    if (resetPrice === undefined || resetPrice === 0) {
      setAlertState({
        message: '出品価格を0に設定することはできません。',
        severity: 'error',
      });
      return;
    }

    // 統一対象商品がある場合はモーダルを表示
    if (unifyPricing.unifyTargetCount > 1) {
      setPendingPriceAction({
        type: 'reset',
        price: resetPrice ?? 0,
      });
      setShowPriceUnificationModal(true);
      return;
    }

    // 統一対象商品がない場合は通常のリセット処理
    try {
      await updateProduct(store.id, productId, {
        specificEcSellPrice: null,
      });

      setActualEcSellPrice(resetPrice ?? undefined);
      await refetchProducts();
    } catch (error) {
      setAlertState({
        message: '更新に失敗しました。',
        severity: 'error',
      });
    }
  };

  // 出品価格を更新する関数
  const handleConfirmActualEcSellPrice = async () => {
    setIsEdit((prev) => ({
      ...prev,
      actualEcSellPrice: !prev.actualEcSellPrice,
    }));
    if (!isEdit.actualEcSellPrice || actualEcSellPrice === undefined) return;
    if (actualEcSellPrice <= 0) {
      setAlertState({
        message: '出品価格を0に設定することはできません。',
        severity: 'error',
      });
      return;
    }

    // 統一対象商品がある場合はモーダルを表示
    if (unifyPricing.unifyTargetCount > 1) {
      setPendingPriceAction({
        type: 'confirm',
        price: actualEcSellPrice,
      });
      setShowPriceUnificationModal(true);
      return;
    }

    // 統一対象商品がない場合は通常の更新処理
    await updateProductState();
    await refetchProducts();
  };

  // 店頭用在庫数を更新する関数
  const handleConfirmPosReservedStockNumber = async () => {
    const currentEditState = isEdit.posReservedStockNumber;

    setIsEdit((prev) => ({
      ...prev,
      posReservedStockNumber: !prev.posReservedStockNumber,
    }));

    if (!currentEditState) return; // 編集開始の場合は何もしない

    if (
      posReservedStockNumber !== null &&
      posReservedStockNumber !== undefined &&
      posReservedStockNumber < 0
    ) {
      setAlertState({
        message: '店頭用在庫数を0に設定することはできません。',
        severity: 'error',
      });
      return;
    }
    await updateProductState();
    await refetchProducts();
  };

  return (
    <>
      <Stack alignItems="center" gap={1.5}>
        <Stack>
          <ItemImage imageUrl={selectedProduct?.image_url ?? ''} height={250} />
        </Stack>
        {/* 1行目 */}
        <Stack direction="row" justifyContent="space-between" width="70%">
          <ItemText text={selectedProduct?.displayNameWithMeta ?? ''} />
          <Box></Box>
        </Stack>
        {/* 2行目 */}
        <Stack direction="row" justifyContent="space-between" width="70%">
          <Typography>
            {selectedProduct?.condition_option_display_name}
          </Typography>
          <Box></Box>
        </Stack>
        {/* 3行目 */}
        <Stack direction="row" justifyContent="space-between" width="70%">
          <Typography>店頭販売価格</Typography>
          <Typography>
            {selectedProduct?.actual_sell_price?.toLocaleString()}円
          </Typography>
        </Stack>
        {/* 4行目 */}
        <Stack
          direction="row"
          justifyContent="space-between"
          width="70%"
          alignItems="center"
        >
          <Typography>出品価格</Typography>
          <Stack direction="row" alignItems="center">
            <TextField
              type="number"
              value={
                actualEcSellPrice ??
                selectedProduct?.actual_ec_sell_price ??
                null
              }
              onChange={(event) => {
                const value = event.target.value;
                const halfWidthValue = toHalfWidth(value);
                if (halfWidthValue === '' || halfWidthValue === null) {
                  setActualEcSellPrice(undefined);
                } else {
                  const numericValue = Number(halfWidthValue);
                  if (!isNaN(numericValue)) {
                    setActualEcSellPrice(numericValue);
                  }
                }
              }}
              sx={{ width: '100px' }}
              InputProps={{
                sx: { height: 30 },
              }}
              disabled={!isEdit.actualEcSellPrice}
              size="small"
            />
            <PrimaryButton
              onClick={handleConfirmActualEcSellPrice}
              sx={{ ml: 2 }}
              loading={isLoadingUpdateProduct || searchState.isLoading}
            >
              {isEdit.actualEcSellPrice ? '確定' : '編集'}
            </PrimaryButton>
            <HelpIcon helpArchivesNumber={2563} />
          </Stack>
        </Stack>
        {/* 5行目 */}
        <Stack direction="row" justifyContent="space-between" width="70%">
          <Typography>（自動出品価格）</Typography>
          <Typography>
            （{selectedProduct?.ec_sell_price?.toLocaleString() ?? '-'}
            円）
          </Typography>
          <SecondaryButton
            onClick={resetEcSellPrice}
            loading={isLoadingUpdateProduct || searchState.isLoading}
          >
            リセット
          </SecondaryButton>
        </Stack>
        {/* 6行目 */}
        <Stack direction="row" justifyContent="space-between" width="70%">
          <Typography>出品数</Typography>
          <Typography>
            {selectedProduct?.ec_stock_number.toString() ?? '-'}
          </Typography>
        </Stack>
        {/* 6行目 */}
        <Stack direction="row" justifyContent="space-between" width="70%">
          <Typography>（在庫数）</Typography>
          <Typography>
            （{selectedProduct?.stock_number.toString() ?? '-'}）
          </Typography>
        </Stack>
        {/* 7行目 */}
        <Stack direction="row" justifyContent="space-between" width="70%">
          <Stack direction="row" alignItems="center">
            <Typography>店頭用在庫数</Typography>
            <Tooltip
              open={open}
              onClose={() => setOpen(false)}
              title={
                <Typography>
                  店頭用に確保し、ECに出品しない在庫数です。全体の設定よりも個別の設定が優先されます。
                </Typography>
              }
              placement="right"
              arrow
              componentsProps={{
                tooltip: {
                  sx: {
                    backgroundColor: 'white',
                    color: 'black',
                    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.2)',
                    border: '1px solid #ccc',
                  },
                },
                arrow: {
                  sx: {
                    color: 'white',
                  },
                },
              }}
            >
              <IconButton
                size="small"
                onClick={() => setOpen((prev) => !prev)}
                onMouseEnter={() => {
                  setHovering(true);
                  handleOpen();
                }}
                onMouseLeave={() => {
                  setHovering(false);
                  handleClose();
                }}
              >
                <HelpSharpIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
          <Stack direction="column" alignItems="flex-start" mt={2}>
            <Stack direction="row" alignItems="center">
              <TextField
                type="number"
                value={
                  posReservedStockNumber ??
                  selectedProduct?.pos_reserved_stock_number ??
                  ''
                }
                onChange={(event) => {
                  const value = event.target.value;
                  const halfWidthValue = toHalfWidth(value);
                  if (halfWidthValue === '' || halfWidthValue === null) {
                    setPosReservedStockNumber(null);
                  } else {
                    const numericValue = Number(halfWidthValue);
                    if (!isNaN(numericValue) && numericValue >= 0) {
                      setPosReservedStockNumber(numericValue);
                    }
                  }
                }}
                sx={{ width: '100px' }}
                InputProps={{
                  sx: { height: 30 },
                  inputProps: { min: 0 },
                }}
                disabled={!isEdit.posReservedStockNumber}
                size="small"
              />
              <PrimaryButton
                onClick={handleConfirmPosReservedStockNumber}
                sx={{ ml: 2 }}
                loading={isLoadingUpdateProduct || searchState.isLoading}
              >
                {isEdit.posReservedStockNumber ? '確定' : '編集'}
              </PrimaryButton>
              <HelpIcon helpArchivesNumber={2629} />
            </Stack>
          </Stack>
        </Stack>
        {/* 8行目 */}
        <Stack direction="row" justifyContent="space-between" width="70%">
          <Typography></Typography>
          <SecondaryButton
            sx={{ width: '100px' }}
            loading={isLoadingUpdateProduct || searchState.isLoading}
            onClick={async () => {
              setPosReservedStockNumber(null);
              setIsEdit((prev) => ({ ...prev, posReservedStockNumber: false }));
              await updateProduct(store.id, productId, {
                posReservedStockNumber: 0,
              });
              await refetchProducts();
            }}
          >
            リセット
          </SecondaryButton>
        </Stack>
        {/* 9行目 */}
        <Stack
          direction="row"
          justifyContent="space-between"
          width="70%"
          mt={2}
        >
          <Typography>出品中のプラットフォーム</Typography>
          <ShopIcon
            shopInfo={ecShopCommonConstants.shopInfo.map((shop) => ({
              key: shop.key,
              displayName: shop.shopName,
              icon: shop.shopIconInfo,
              ImageUrl: shop.shopImageUrl,
            }))}
            width={20}
            height={20}
            productData={{
              mycalinks_ec_enabled:
                selectedProduct?.mycalinks_ec_enabled ?? false,
              ochanoko_ec_enabled:
                selectedProduct?.ochanoko_ec_enabled ?? false,
              shopify_ec_enabled: selectedProduct?.shopify_ec_enabled ?? false,
            }}
          />
        </Stack>
      </Stack>

      {/* 価格統一確認モーダル */}
      <PriceUnificationConfirmModal
        open={showPriceUnificationModal}
        onClose={() => {
          setShowPriceUnificationModal(false);
          setPendingPriceAction(null);
        }}
        baseProducts={unifyPricing.baseProducts}
        onConfirm={handlePriceUnificationConfirm}
        loading={isLoadingUpdateProduct || searchState.isLoading}
        unifyTargetProducts={unifyPricing.unifyTargetProducts}
        defaultPrices={
          pendingPriceAction && selectedProduct
            ? {
                [String(selectedProduct.item_myca_item_id || '不明')]:
                  pendingPriceAction.price,
              }
            : {}
        }
      />
    </>
  );
};
