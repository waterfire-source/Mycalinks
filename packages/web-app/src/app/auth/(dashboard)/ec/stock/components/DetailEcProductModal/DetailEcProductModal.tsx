import { ConfirmCancelModal } from '@/app/auth/(dashboard)/ec/stock/components/DetailEcProductModal/ConfirmCancelModal/ConfirmCancelModal';
import { DetailEcProduct } from '@/app/auth/(dashboard)/ec/stock/components/DetailEcProductModal/DetailEcProduct/DetailEcProduct';
import { ProductEcOrderHistory } from '@/app/auth/(dashboard)/ec/stock/components/DetailEcProductModal/ProductEcOrderHistory/ProductEcOrderHistory';
import { SelectPlatForm } from '@/app/auth/(dashboard)/ec/stock/components/DetailEcProductModal/SelectPlatForm';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { useStore } from '@/contexts/StoreContext';
import { ProductSearchState } from '@/feature/products/hooks/useNewProductSearch';
import { useUpdateProduct } from '@/feature/products/hooks/useUpdateProduct';
import { useUpdateProductImages } from '@/feature/products/hooks/useUpdateProductImages';
import { ecShopCommonConstants } from '@/constants/ecShops';
import { Stack, Tabs, Tab, Grid } from '@mui/material';
import { useState, useEffect } from 'react';
import { Box, Typography, TextField } from '@mui/material';
import { MultiImagePicker } from '@/components/cards/MultiImagePicker';
import { ProductImageData } from '@/feature/products/hooks/useUpdateProductImages';
import { useProducts } from '@/feature/products/hooks/useProducts';
import { useAlert } from '@/contexts/AlertContext';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { useUnifyPricing } from '@/feature/ec/stock/hooks/useUnifyPricing';
import { PriceUnificationConfirmModal } from '@/feature/ec/stock/components/PriceUnificationConfirmModal';
import { useCreateShopifyProduct } from '@/feature/ec/stock/hooks/useCreateShopifyProduct';
import { HelpIcon } from '@/components/common/HelpIcon';

interface Props {
  open: boolean;
  onClose: () => void;
  productId: number;
  setIsConfirmCancelModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openConfirmCancelModal: boolean;
  onCloseConfirmCancelModal: () => void;
  refetchProducts: () => void;
  searchState: ProductSearchState;
}

export interface SelectedPlatForm {
  selected: boolean;
  shopName: string;
}

export const DetailEcProductModal = ({
  open,
  onClose,
  productId,
  setIsConfirmCancelModalOpen,
  openConfirmCancelModal,
  onCloseConfirmCancelModal,
  refetchProducts,
  searchState,
}: Props) => {
  const { store } = useStore();
  const { updateProduct } = useUpdateProduct();
  const { updateProductImages } = useUpdateProductImages();
  const { createShopifyProduct, isLoading: isShopifyLoading } =
    useCreateShopifyProduct({ storeId: store.id });
  const [actualEcSellPrice, setActualEcSellPrice] = useState<number>(); // 出品価格
  const [posReservedStockNumber, setPosReservedStockNumber] = useState<
    number | null | undefined
  >(undefined); // 店頭用在庫数
  const [primaryButtonLoading, setPrimaryButtonLoading] =
    useState<boolean>(false);
  const [canDisableEcAutoStocking, setCanDisableEcAutoStocking] =
    useState<boolean>(false);
  const { setAlertState } = useAlert();

  // メモ機能の状態
  const [memo, setMemo] = useState<string>('');

  // 画像管理機能の状態
  const [productImages, setProductImages] = useState<ProductImageData[]>([]);
  const [isImagesChanged, setIsImagesChanged] = useState<boolean>(false);

  // タブ管理
  const [selectedTab, setSelectedTab] = useState<number>(0);

  // 現在の商品データ（価格統一機能用）
  const [currentProduct, setCurrentProduct] = useState<
    ProductSearchState['searchResults'][number] | null
  >(null);

  // プラットフォーム選択機能の状態
  const [canShowPlatformScreen, setCanShowPlatformScreen] = useState(false);
  const [selectedPlatForm, setSelectedPlatForm] = useState<SelectedPlatForm[]>(
    ecShopCommonConstants.shopInfo.map((info) => ({
      selected: false,
      shopName: info.shopName,
    })),
  );

  // 商品詳細データを取得
  const { listProductsByProductIDs } = useProducts();

  // 選択されているPlatForm
  const mycalinksEcEnabled = selectedPlatForm.some(
    (platform) =>
      platform.shopName === ecShopCommonConstants.shopInfo[0].shopName &&
      platform.selected,
  );

  // Ochanokoの出品状態
  const ochanokoEcEnabled = selectedPlatForm.some(
    (platform) =>
      platform.shopName === ecShopCommonConstants.shopInfo[1].shopName &&
      platform.selected,
  );

  // Shopifyの出品状態
  // TODO:Shopify連携
  // const shopifyEcEnabled = selectedPlatForm.some(
  //   (platform) =>
  //     platform.shopName === ecShopCommonConstants.shopInfo[2].shopName &&
  //     platform.selected,
  // );
  const shopifyEcEnabled = false;

  // 現在の商品データ（メモ・画像の変更を反映）
  const currentProductWithChanges = currentProduct
    ? {
        ...currentProduct,
        // メモの変更を反映（空文字の場合はnullとして扱う）
        description:
          memo.trim() !== '' ? memo : currentProduct.description || null,
        // 画像の変更を反映
        images:
          productImages.length > 0
            ? productImages
            : currentProduct.images || [],
      }
    : null;

  // 価格統一機能
  const unifyPricing = useUnifyPricing({
    baseProducts: currentProductWithChanges
      ? [
          currentProductWithChanges as ProductSearchState['searchResults'][number],
        ]
      : [],
    storeId: store.id,
    enabled: canShowPlatformScreen, // プラットフォーム選択時のみ有効
  });

  // 価格統一確認モーダルの状態
  const [showPriceUnificationModal, setShowPriceUnificationModal] =
    useState(false);

  // モーダルが開いた時に商品画像を取得
  useEffect(() => {
    if (open && productId) {
      const fetchProductImages = async () => {
        try {
          const products = await listProductsByProductIDs(
            store.id,
            [productId],
            {
              take: 30,
              skip: 0,
              includesSummary: true,
              includesImages: true,
            },
          );

          if (products && products.length > 0) {
            const product = products[0];

            // 既存のメモと画像データを設定
            setMemo(product.description || '');

            // 画像データがある場合は設定
            if (product.images && product.images.length > 0) {
              const imageData = product.images.map((img: any) => ({
                image_url: img.image_url,
                description: img.description || '',
                order_number: img.order_number || 0,
              }));
              setProductImages(imageData);
            } else {
              setProductImages([]);
            }
            setActualEcSellPrice(product.actual_ec_sell_price ?? undefined);
            setPosReservedStockNumber(
              product.pos_reserved_stock_number ?? undefined,
            );
            setCanDisableEcAutoStocking(
              product.disable_ec_auto_stocking ?? false,
            );

            // 価格統一機能用に商品データを設定
            setCurrentProduct(product);

            // 現在の出品状態を取得して、selectedPlatFormの初期状態を設定
            setSelectedPlatForm(
              ecShopCommonConstants.shopInfo.map((shop) => ({
                selected: product[shop.key as keyof typeof product] === true,
                shopName: shop.shopName,
              })),
            );
          }
        } catch (error) {
          console.error('商品詳細の取得中にエラーが発生しました', error);
        }
      };

      fetchProductImages();
    }
  }, [open, productId, store.id, listProductsByProductIDs]);

  const reset = () => {
    setCanShowPlatformScreen(false);
    setMemo('');
    setProductImages([]);
    setIsImagesChanged(false);
    setActualEcSellPrice(undefined);
    setPosReservedStockNumber(undefined);
    setCanDisableEcAutoStocking(false);
    setSelectedTab(0);
    setCurrentProduct(null);
    // resetでは選択状態をクリアする（商品データ取得時に正しい状態が設定される）
    setSelectedPlatForm(
      ecShopCommonConstants.shopInfo.map((info) => ({
        selected: false,
        shopName: info.shopName,
      })),
    );
  };

  // モーダルが閉じる時にデータをリセット
  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open]);

  // プラットフォーム選択画面になった時に自動で価格統一検索を実行
  useEffect(() => {
    if (canShowPlatformScreen && currentProductWithChanges) {
      // 価格統一機能を有効にして統一対象商品を検索
      unifyPricing.setEnableUnifyPricing(true);
    }
  }, [canShowPlatformScreen, currentProductWithChanges, unifyPricing]);

  const HandleClose = () => {
    reset();
    onClose();
  };

  // 出品処理を実行
  const executeListingProcess = async (unifyPrice?: number) => {
    setPrimaryButtonLoading(true);
    try {
      // 1. 価格統一処理（指定された場合）
      if (unifyPrice) {
        await unifyPricing.executeUnifyPricing(unifyPrice);
      }

      // 2. Shopify在庫連携の場合は専用API呼び出し
      if (shopifyEcEnabled) {
        const shopifyResult = await createShopifyProduct([productId]);
        if (shopifyResult) {
          // Shopify商品作成成功時は、shopifyEcEnabledフラグも更新
          await updateProduct(store.id, productId, {
            shopifyEcEnabled: true,
            mycalinksEcEnabled,
            ochanokoEcEnabled,
            disableEcAutoStocking: canDisableEcAutoStocking,
            specificEcSellPrice: unifyPrice || actualEcSellPrice,
            posReservedStockNumber: posReservedStockNumber,
            description: memo ?? null,
          });
        } else {
          throw new Error('Shopify商品作成に失敗しました');
        }
      } else {
        // 3. 通常の出品処理（MycaLinks EC、Ochanokoの場合）
        await updateProduct(store.id, productId, {
          mycalinksEcEnabled,
          ochanokoEcEnabled,
          disableEcAutoStocking: canDisableEcAutoStocking,
          specificEcSellPrice: unifyPrice || actualEcSellPrice, // 統一価格がある場合はそれを使用
          posReservedStockNumber: posReservedStockNumber,
          description: memo ?? null,
        });
      }

      // 4. 画像の保存（変更がある場合のみ）
      if (isImagesChanged) {
        await updateProductImages(store.id, productId, productImages);
        setIsImagesChanged(false);
      }

      // 5. 成功通知
      const unifyMessage = unifyPrice
        ? `出品完了しました。${unifyPricing.unifyTargetCount}個の商品の価格も統一されました。`
        : '出品完了しました。';

      setAlertState({
        message: unifyMessage,
        severity: 'success',
      });

      // 一覧を更新してからモーダルを閉じる
      await refetchProducts();

      // 価格統一機能の検索結果もリフレッシュ
      if (unifyPrice) {
        unifyPricing.refreshUnifyTargets();
      }

      HandleClose();
    } catch (error) {
      console.error('出品に失敗しました', error);
      setAlertState({
        message: '出品処理に失敗しました。再度お試しください。',
        severity: 'error',
      });
    } finally {
      setPrimaryButtonLoading(false);
    }
  };

  // 価格統一確認モーダルの処理
  const handlePriceUnificationConfirm = async (unifyPricesByCard: {
    [cardId: string]: number;
  }) => {
    setShowPriceUnificationModal(false);

    // 最初の価格を使用（DetailEcProductModalでは単一商品のため）
    const unifyPrice = Object.values(unifyPricesByCard)[0];
    await executeListingProcess(unifyPrice);
  };

  const onPrimaryButtonClick = async () => {
    // 0円チェック
    if (actualEcSellPrice === 0) {
      setAlertState({
        message: '出品価格を0円に設定することはできません。',
        severity: 'error',
      });
      return;
    }

    if (canShowPlatformScreen) {
      // プラットフォーム選択画面での出品処理

      // 統一対象商品がある場合は確認モーダルを表示
      if (unifyPricing.unifyTargetCount > 1) {
        setShowPriceUnificationModal(true);
        return;
      }

      // 統一対象商品がない場合は通常の出品処理
      await executeListingProcess();
    } else {
      // 商品詳細画面での変更保存
      setPrimaryButtonLoading(true);
      try {
        const result = await updateProduct(store.id, productId, {
          posReservedStockNumber: posReservedStockNumber ?? null,
          specificEcSellPrice: actualEcSellPrice ?? null,
          disableEcAutoStocking: canDisableEcAutoStocking,
          description: memo ?? null,
        });

        // 画像の保存（変更がある場合のみ）
        if (isImagesChanged) {
          await updateProductImages(store.id, productId, productImages);
          setIsImagesChanged(false);
        }

        if (result.success) {
          // 一覧側のデータを更新
          refetchProducts();
          setAlertState({
            message: '変更を保存しました',
            severity: 'success',
          });
        }
      } catch (error) {
        console.error('更新中にエラーが発生しました', error);
      } finally {
        setPrimaryButtonLoading(false);
      }
    }
  };

  const onCancelClick = () => {
    if (canShowPlatformScreen) {
      setCanShowPlatformScreen(false);
    } else {
      HandleClose();
    }
  };

  return (
    <>
      <CustomModalWithIcon
        open={open}
        onClose={HandleClose}
        title={
          canShowPlatformScreen ? '出品プラットフォームを選択' : '出品中の商品'
        }
        width="90%"
        height="90%"
        actionButtonText={canShowPlatformScreen ? '新規出品' : '変更を保存'}
        onActionButtonClick={onPrimaryButtonClick}
        loading={primaryButtonLoading || isShopifyLoading}
        cancelButtonText="キャンセル"
        onCancelClick={onCancelClick}
        secondActionButtonText={
          canShowPlatformScreen ? undefined : '出品を取り消す'
        }
        secondActionButtonHelpArchivesNumber={3656}
        onSecondActionButtonClick={() => setIsConfirmCancelModalOpen(true)}
        customActionButton={
          !canShowPlatformScreen ? (
            <PrimaryButtonWithIcon
              onClick={() => {
                // プラットフォーム選択画面に切り替える際、現在の出品状態を反映
                if (currentProduct) {
                  setSelectedPlatForm(
                    ecShopCommonConstants.shopInfo.map((shop) => ({
                      selected:
                        currentProduct[
                          shop.key as keyof typeof currentProduct
                        ] === true,
                      shopName: shop.shopName,
                    })),
                  );
                }
                setCanShowPlatformScreen(true);
              }}
              loading={primaryButtonLoading}
              sx={{
                ml: 2,
              }}
            >
              この商品を出品する
            </PrimaryButtonWithIcon>
          ) : null
        }
      >
        {canShowPlatformScreen ? (
          <Stack spacing={3}>
            <SelectPlatForm
              selectedPlatForm={selectedPlatForm}
              setSelectedPlatForm={setSelectedPlatForm}
            />

            {/* 価格統一セクションは出品プラットフォーム選択時は非表示 */}
          </Stack>
        ) : (
          <Stack sx={{ flex: 1 }}>
            {/* タブヘッダー */}
            <Tabs
              value={selectedTab}
              onChange={(event, newValue) => setSelectedTab(newValue)}
              sx={{ borderBottom: 1, borderColor: 'divider' }}
              TabIndicatorProps={{
                sx: {
                  backgroundColor: 'primary.main',
                },
              }}
            >
              <Tab
                label="出品情報"
                sx={{
                  color: selectedTab === 0 ? 'primary.main' : 'grey.600',
                }}
              />
              <Tab
                label="販売履歴"
                sx={{
                  color: selectedTab === 1 ? 'primary.main' : 'grey.600',
                }}
              />
            </Tabs>

            {/* タブコンテンツ */}
            <Box sx={{ flex: 1, pt: 3 }}>
              {selectedTab === 0 && (
                <Grid container columnSpacing={2} sx={{ height: '100%' }}>
                  {/* 左側 - 商品詳細 */}
                  <Grid item xs={6} height="100%">
                    <DetailEcProduct
                      productId={productId}
                      actualEcSellPrice={actualEcSellPrice}
                      setActualEcSellPrice={setActualEcSellPrice}
                      posReservedStockNumber={posReservedStockNumber}
                      setPosReservedStockNumber={setPosReservedStockNumber}
                      refetchProducts={refetchProducts}
                      searchState={searchState}
                      canDisableEcAutoStocking={canDisableEcAutoStocking}
                      setCanDisableEcAutoStocking={setCanDisableEcAutoStocking}
                    />
                  </Grid>

                  {/* 右側 - メモと画像管理 */}
                  <Grid item xs={6} height="100%">
                    <Stack sx={{ gap: 3, height: '100%' }}>
                      {/* メモ機能 */}
                      <Box>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1}
                          sx={{ mb: 1 }}
                        >
                          <Typography variant="h6">メモ</Typography>
                          <HelpIcon helpArchivesNumber={4504} />
                        </Box>

                        <Typography
                          variant="caption"
                          sx={{ mb: 1, display: 'block' }}
                        >
                          ※Mycalinks MALLでお客様の目に触れる場合があります。
                        </Typography>
                        <TextField
                          fullWidth
                          multiline
                          minRows={4}
                          maxRows={8}
                          value={memo}
                          onChange={(e) => setMemo(e.target.value)}
                          placeholder="メモを入力してください"
                          variant="outlined"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'white',
                            },
                          }}
                        />
                      </Box>

                      {/* 追加画像管理機能 */}
                      <Box sx={{ flex: 1 }}>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1}
                          sx={{ mb: 1 }}
                        >
                          <Typography variant="h6">追加画像</Typography>
                          <HelpIcon helpArchivesNumber={4504} />
                        </Box>
                        <MultiImagePicker
                          images={productImages}
                          onImagesChange={(newImages) => {
                            setProductImages(newImages);
                            setIsImagesChanged(true);
                          }}
                          maxImages={10}
                        />
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              )}

              {selectedTab === 1 && (
                <Box sx={{ height: '100%', overflow: 'auto' }}>
                  <ProductEcOrderHistory productId={productId} />
                </Box>
              )}
            </Box>
          </Stack>
        )}
      </CustomModalWithIcon>

      {/* 出品取り消しモーダル  */}
      <ConfirmCancelModal
        open={openConfirmCancelModal}
        onClose={onCloseConfirmCancelModal}
        productId={productId}
        refetchProducts={refetchProducts}
      />

      {/* 価格統一確認モーダル */}
      <PriceUnificationConfirmModal
        open={showPriceUnificationModal}
        onClose={() => setShowPriceUnificationModal(false)}
        baseProducts={unifyPricing.baseProducts}
        onConfirm={handlePriceUnificationConfirm}
        loading={primaryButtonLoading}
        unifyTargetProducts={unifyPricing.unifyTargetProducts}
      />
    </>
  );
};
