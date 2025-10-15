import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import TertiaryButtonWithIcon from '@/components/buttons/TertiaryButtonWithIcon';
import { useStore } from '@/contexts/StoreContext';
import { useStockSearch } from '@/feature/products/hooks/useNewProductSearch';
import { useUpdateProduct } from '@/feature/products/hooks/useUpdateProduct';
import { Box, Modal, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useUnifyPricing } from '@/feature/ec/stock/hooks/useUnifyPricing';
import { PriceUnificationConfirmModal } from '@/feature/ec/stock/components/PriceUnificationConfirmModal';
import { useAlert } from '@/contexts/AlertContext';
import { hasPriceUnificationNeeded } from '@/feature/ec/stock/utils/unifyPricingUtils';
import { useCreateShopifyProduct } from '@/feature/ec/stock/hooks/useCreateShopifyProduct';

interface Props {
  onClose: () => void;
  selectedIds: number[];
  publishStoreInfos: {
    displayName: string;
    icon: string;
    ImageUrl: string;
  }[];
  isEcListingModalState: {
    open: boolean;
    mode: 'show' | 'cancel' | 'shopify_show' | null;
  };
  refetchProducts: () => Promise<void>;
}

export const EcListingModal = ({
  onClose,
  selectedIds,
  publishStoreInfos,
  isEcListingModalState,
  refetchProducts: parentRefetchProducts,
}: Props) => {
  const { store } = useStore();
  const { searchState, setSearchState, fetchProducts } = useStockSearch(
    store.id,
    {
      isActive: true,
    },
    selectedIds,
  );
  const isShowEcListing = isEcListingModalState.mode === 'show';
  const isShopifyShow = isEcListingModalState.mode === 'shopify_show';

  useEffect(() => {
    if (selectedIds && selectedIds.length > 0) {
      fetchProducts();
    }
  }, [fetchProducts, store.id, selectedIds]);
  const { updateProduct } = useUpdateProduct();
  const { setAlertState } = useAlert();
  const { createShopifyProduct, isLoading: isShopifyLoading } =
    useCreateShopifyProduct({ storeId: store.id });
  const [primaryButtonLoading, setPrimaryButtonLoading] =
    useState<boolean>(false);

  // 価格統一確認モーダルの状態
  const [showPriceUnificationModal, setShowPriceUnificationModal] =
    useState(false);

  // 価格統一機能（出品時のみ）
  const unifyPricing = useUnifyPricing({
    baseProducts: searchState.searchResults,
    storeId: store.id,
    enabled: isShowEcListing || isShopifyShow, // 出品時のみ有効
  });

  // 出品時に自動で価格統一検索を実行（チェックボックスなしで常に有効）
  useEffect(() => {
    if (
      (isShowEcListing || isShopifyShow) &&
      searchState.searchResults.length > 0
    ) {
      unifyPricing.setEnableUnifyPricing(true);
    }
  }, [isShowEcListing, isShopifyShow, searchState.searchResults, unifyPricing]);
  const onPrimaryButtonClick = async () => {
    if (isShowEcListing || !isShopifyShow) {
      // 出品処理の場合、価格統一が必要な商品がある場合は確認モーダルを表示
      const needsPriceUnification = hasPriceUnificationNeeded(
        unifyPricing.baseProducts,
        unifyPricing.unifyTargetProducts,
      );

      if (needsPriceUnification) {
        setShowPriceUnificationModal(true);
        return;
      }
    }

    // 統一対象商品がない場合は通常の処理を実行
    await executeListingProcess();
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
      if (isShopifyShow) {
        const shopifyResult = await createShopifyProduct(selectedIds);
        if (shopifyResult) {
          // Shopify商品作成成功時は、shopifyEcEnabledフラグも更新
          const updateResults = await Promise.all(
            selectedIds.map((selectedId) => {
              const updateData: useUpdateProduct = {
                shopifyEcEnabled: true,
              };
              if (unifyPrice) {
                updateData.specificEcSellPrice = unifyPrice;
              }
              return updateProduct(store.id, selectedId, updateData);
            }),
          );

          const allUpdateSuccess = updateResults.every((res) => res.success);
          if (allUpdateSuccess) {
            onClose();
            await parentRefetchProducts();
            setSearchState((prev) => ({
              ...prev,
              searchResults: [],
            }));
          }
        }
        return;
      }

      // 3. 通常の出品処理（MycaLinks ECまたは取り消し）
      const results = await Promise.all(
        selectedIds.map((selectedId) => {
          const updateData: useUpdateProduct = {};

          if (isShowEcListing) {
            // 出品モードの場合
            updateData.mycalinksEcEnabled = true;
            // 価格設定
            if (unifyPrice) {
              updateData.specificEcSellPrice = unifyPrice;
            }
          } else {
            // 取り消しモードの場合
            updateData.mycalinksEcEnabled = false;
          }

          return updateProduct(store.id, selectedId, updateData);
        }),
      );

      const allSuccess = results.every((res) => res.success);
      if (allSuccess) {
        // 4. 成功通知
        let message = '';
        if (unifyPrice) {
          message = `出品完了しました。${unifyPricing.unifyTargetCount}個の関連商品の価格も統一されました。`;
        } else if (isShowEcListing) {
          message = '出品完了しました。';
        } else {
          message = '出品取り消しが完了しました。';
        }

        setAlertState({
          message: message,
          severity: 'success',
        });

        onClose();
        await parentRefetchProducts();
        setSearchState((prev) => ({
          ...prev,
          searchResults: [],
        }));
      }
    } catch (error) {
      console.error('更新中にエラーが発生しました', error);
      setAlertState({
        message: '処理に失敗しました。再度お試しください。',
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

    // カード別価格統一処理を実装
    await executeListingProcessWithCardPrices(unifyPricesByCard);
  };

  // カード別価格統一を含む出品処理
  const executeListingProcessWithCardPrices = async (unifyPricesByCard: {
    [cardId: string]: number;
  }) => {
    setPrimaryButtonLoading(true);
    try {
      // 1. カード別価格統一処理
      if (Object.keys(unifyPricesByCard).length > 0) {
        // 統一対象商品を取得してカード別に価格統一を実行
        for (const [cardId, price] of Object.entries(unifyPricesByCard)) {
          // 該当カードの統一対象商品の価格を更新
          const targetProducts = unifyPricing.unifyTargetProducts.filter(
            (product) => {
              const productCardId = String(product.item_myca_item_id || '不明');
              return productCardId === cardId;
            },
          );

          if (targetProducts.length > 0) {
            const promises = targetProducts.map((product) =>
              updateProduct(store.id, product.id, {
                specificEcSellPrice: price,
              }),
            );
            await Promise.all(promises);
          }
        }
      }

      // 2. 選択商品の出品処理（カード別価格を適用）
      const results = await Promise.all(
        selectedIds.map((selectedId) => {
          // 選択商品のカードIDを特定して対応する価格を取得
          const selectedProduct = searchState.searchResults.find(
            (p) => p.id === selectedId,
          );
          const selectedCardId = selectedProduct
            ? String(selectedProduct.item_myca_item_id || '不明')
            : '';
          const selectedPrice = unifyPricesByCard[selectedCardId];

          const updateData: any = {};

          if (isShowEcListing) {
            updateData.mycalinksEcEnabled = true;
            if (selectedPrice) {
              updateData.specificEcSellPrice = selectedPrice;
            }
          } else if (isShopifyShow) {
            updateData.shopifyEcEnabled = true;
            if (selectedPrice) {
              updateData.specificEcSellPrice = selectedPrice;
            }
          } else {
            updateData.mycalinksEcEnabled = false;
          }

          return updateProduct(store.id, selectedId, updateData);
        }),
      );

      const allSuccess = results.every((res) => res.success);
      if (allSuccess) {
        // 3. 成功通知
        const unifyMessage =
          Object.keys(unifyPricesByCard).length > 1
            ? `出品完了しました。${unifyPricing.unifyTargetCount}個の関連商品の価格も統一されました。`
            : isShowEcListing
            ? '出品完了しました。'
            : '出品取り消しが完了しました。';

        setAlertState({
          message: unifyMessage,
          severity: 'success',
        });

        onClose();
        await parentRefetchProducts();
        setSearchState((prev) => ({
          ...prev,
          searchResults: [],
        }));
      }
    } catch (error) {
      console.error('更新中にエラーが発生しました', error);
      setAlertState({
        message: '処理に失敗しました。再度お試しください。',
        severity: 'error',
      });
    } finally {
      setPrimaryButtonLoading(false);
    }
  };
  return (
    <>
      <Modal
        open={isEcListingModalState.open}
        onClose={() => {
          onClose();
          setSearchState((prev) => ({
            ...prev,
            searchResults: [],
          }));
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 550,
            bgcolor: 'white',
            borderRadius: 2,
            boxShadow: 24,
            pt: 1,
            pr: 2.5,
            pl: 2.5,
            pb: 2,
          }}
        >
          <FaTimes
            size={20}
            onClick={onClose}
            style={{
              position: 'absolute',
              right: '5px',
              color: 'black',
              backgroundColor: 'white',
              cursor: 'pointer',
              borderRadius: '50%',
              padding: '5px',
            }}
          />

          {/* タイトル */}
          <Typography
            variant="h1"
            fontWeight="bold"
            color="primary.main"
            mt={2}
          >
            {isShowEcListing
              ? '出品する'
              : isShopifyShow
              ? 'Shopify在庫連携'
              : '出品取り消し'}
          </Typography>

          {/* 説明文 */}
          {/*}
          <Typography mt={1.5}>
            {isShowEcListing
              ? '出品するプラットフォームを選択してください'
              : isShopifyShow
              ? '選択した商品をShopifyに在庫連携します'
              : isShopifyCancel
              ? '選択した商品のShopify在庫連携を解除します'
              : '出品を取り消すプラットフォームを選択してください'}
          </Typography>
          */}
          {/* 取り消すプラットフォーム */}
          {/*
          {publishStoreInfos.map((store) => (
            <Stack
              key={store.displayName}
              direction="row"
              alignItems="center"
              mt={1}
            >
              <Checkbox
                sx={{
                  color: 'black',
                  padding: 0,
                  margin: 0,
                  '&.Mui-checked': {
                    color: 'primary.main',
                  },
                }}
              />
              <Typography>{store.displayName}</Typography>
            </Stack>
          ))}
          */}
          {/* 取り消す商品リスト */}
          <Box
            overflow="auto"
            border={1}
            borderColor="grey.300"
            width="100%"
            height={200}
            padding={2}
            sx={{
              pt: 1,
              pr: 2,
              pl: 2,
              pb: 1,
              mt: 1.5,
            }}
            display="flex"
            justifyContent="center" // 横方向の中央寄せ
          >
            <Stack width="100%">
              {searchState.searchResults.map((product) => (
                <Stack
                  key={product.id}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    width: '100%',
                    mx: 'auto',
                  }}
                >
                  <Typography flex={0.6}>
                    {product.displayNameWithMeta}
                  </Typography>
                  <Typography flex={0.35}>
                    {product.item_cardnumber} {product.item_expansion}
                  </Typography>
                  <Typography flex={0.05} textAlign="right">
                    {product.item_rarity}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>

          {/* ボタン */}
          <Box display="flex" justifyContent="flex-end" mt={1.5} gap={2}>
            <TertiaryButtonWithIcon
              onClick={() => {
                onClose();
                setSearchState((prev) => ({
                  ...prev,
                  searchResults: [],
                }));
              }}
            >
              キャンセル
            </TertiaryButtonWithIcon>
            <PrimaryButtonWithIcon
              loading={
                primaryButtonLoading || (isShopifyShow && isShopifyLoading)
              }
              onClick={onPrimaryButtonClick}
              disabled={selectedIds.length === 0}
            >
              {isShowEcListing
                ? '出品する'
                : isShopifyShow
                ? '在庫連携する'
                : '出品を取り消す'}
            </PrimaryButtonWithIcon>
          </Box>
        </Box>
      </Modal>

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
