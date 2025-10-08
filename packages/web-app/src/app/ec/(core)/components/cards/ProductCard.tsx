import {
  Box,
  Button,
  Card,
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { ConditionOptionHandle } from '@prisma/client';
import { StockSelect } from '@/app/ec/(core)/components/selects/StockSelect';
import { ConditionTag } from '@/app/ec/(core)/components/tags/ConditionTag';
import { SpecialtyTag } from '@/app/ec/(core)/components/tags/SpecialtyTag';
import { formatPrice } from '@/app/ec/(core)/utils/price';
import { getConditionLabel } from '@/app/ec/(core)/utils/condition';
import { useEcOrder } from '@/app/ec/(core)/hooks/useEcOrder';
import { useState, useCallback, useMemo } from 'react';
import { useAppAuth } from '@/providers/useAppAuth';
import { useCart } from '@/app/ec/(core)/hooks/useCart';
import { useCartUnifiedCount } from '@/app/ec/(core)/hooks/useCartUnifiedCount';
import { useRouter } from 'next/navigation';
import { PATH } from '@/app/ec/(core)/constants/paths';
import { EcProduct } from '@/app/ec/(core)/components/DetailContent';
import { ImageViewer } from '@/app/ec/(core)/components/viewer/ImageViewer';
import Image from 'next/image';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Base64エンコード関数
const encodeStoreId = (storeId: number): string => {
  try {
    return btoa(storeId.toString());
  } catch (error) {
    console.error('Failed to encode store ID:', error);
    return '';
  }
};

type Props = {
  product: EcProduct & {
    _unifiedGroup?: {
      products: EcProduct[];
      totalQuantity: number;
    };
  };
  hasTitle?: boolean;
  orderBy?: string;
  onAddToCartSuccess?: () => void;
  shippingAddressPrefecture?: string;
  itemCount?: number;
};

export const ProductCard = ({
  product,
  hasTitle = false,
  orderBy,
  onAddToCartSuccess,
  shippingAddressPrefecture,
  itemCount = 1,
}: Props) => {
  // nullチェックを行い、デフォルト値を設定
  const displayPrice = product.actual_ec_sell_price ?? 0;
  const displayStoreName = product.store.display_name ?? '店舗名なし';
  const sameDayLimitHour = product.store.ec_setting.same_day_limit_hour ?? 15;
  const freeShippingPrice = product.store.ec_setting.free_shipping_price ?? 0;
  const enableSameDayShipping =
    product.store.ec_setting.enable_same_day_shipping;
  const freeShipping = product.store.ec_setting.free_shipping;

  // 店舗情報ページへのリンクを生成
  const shopLink = PATH.STORE.about(encodeStoreId(product.store.id));

  // カート追加のカスタムフック
  const { addToCart } = useEcOrder();
  // ユーザー認証カスタムフック
  const { getUserId } = useAppAuth();
  // カートコンテキスト
  const { draftCart } = useCart();
  // ルーター
  const router = useRouter();

  // 追加中の状態管理
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // カート内統合数量を計算するカスタムフック
  const { maxAvailableStock, getInitialSelectedCount } =
    useCartUnifiedCount(product);

  const [selectedCount, setSelectedCount] = useState(
    getInitialSelectedCount(itemCount),
  );

  // 注意: useEffectを削除してユーザーの入力を保護
  // カートの変更による自動更新は初期化時のgetInitialSelectedCountで対応済み

  // カート内に同一店舗の同一商品が存在するかチェック
  const isProductInCart = useMemo(() => {
    if (!draftCart?.cart_stores) return false;

    return draftCart.cart_stores.some(
      (store) =>
        store.store_id === product.store.id &&
        store.products.some(
          (cartProduct) => cartProduct.product_id === product.id,
        ),
    );
  }, [draftCart, product.id, product.store.id]);

  // カートに遷移
  const handleGoToCart = useCallback(() => {
    router.push(PATH.CART);
  }, [router]);

  // 画像ビューアーの状態管理
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  // 商品画像があるかチェック
  const hasImages =
    product.images &&
    Array.isArray(product.images) &&
    product.images.length > 0;

  // ImageViewer用の画像データ
  const imageViewerImages = useMemo(() => {
    if (!hasImages || !product.images) return [];
    return product.images
      .filter((img) => img.image_url !== null)
      .map((img) => ({
        src: img.image_url!,
        alt: '商品画像',
        description: img.description || '',
      }));
  }, [hasImages, product.images]);

  // カートに追加
  const handleAddToCart = useCallback(async () => {
    if (isAddingToCart) return;

    setIsAddingToCart(true);
    try {
      // カート追加時にリアルタイムでログイン状態を確認
      const currentUserId = await getUserId();
      const isLoggedIn = currentUserId !== null;

      let cartStores: Array<{
        storeId: number;
        products: Array<{
          productId: number;
          originalItemCount: number;
        }>;
      }> = [];

      // 統合された商品の場合は、統合グループ内の各商品に分散して追加
      if (product._unifiedGroup && product._unifiedGroup.products.length > 1) {
        const unifiedGroup = product._unifiedGroup;
        const totalRequestedCount = selectedCount;
        let remainingCount = totalRequestedCount;

        // 統合グループ内の各商品の在庫数に基づいて数量を分散
        const productsToAdd: Array<{
          productId: number;
          originalItemCount: number;
        }> = [];

        for (const groupProduct of unifiedGroup.products) {
          if (remainingCount <= 0) break;

          const availableStock = groupProduct.ec_stock_number;
          const countToAdd = Math.min(remainingCount, availableStock);

          if (countToAdd > 0) {
            productsToAdd.push({
              productId: groupProduct.id,
              originalItemCount: countToAdd,
            });
            remainingCount -= countToAdd;
          }
        }

        // 店舗ごとにグループ化
        const storeMap = new Map<
          number,
          Array<{ productId: number; originalItemCount: number }>
        >();

        for (const productToAdd of productsToAdd) {
          // 各商品の店舗IDを取得（統合グループ内の商品は同じ店舗のはず）
          const groupProduct = unifiedGroup.products.find(
            (p) => p.id === productToAdd.productId,
          );
          if (groupProduct) {
            const storeId = groupProduct.store.id;
            if (!storeMap.has(storeId)) {
              storeMap.set(storeId, []);
            }
            storeMap.get(storeId)!.push(productToAdd);
          }
        }

        // cartStoresに変換
        cartStores = Array.from(storeMap.entries()).map(
          ([storeId, products]) => ({
            storeId,
            products,
          }),
        );
      } else {
        // 通常の単一商品の場合
        cartStores = [
          {
            storeId: product.store.id,
            products: [
              {
                productId: product.id,
                originalItemCount: selectedCount,
              },
            ],
          },
        ];
      }

      // ログイン状態に応じて異なるパラメータでカート追加処理を実行
      const success = await addToCart({
        shippingAddressPrefecture,
        cartStores,
        isLoggedIn: isLoggedIn,
      });

      // 成功時のみコールバックを実行（エラー時はuseEcOrderがエラー表示を担当）
      if (success) {
        onAddToCartSuccess?.();
      }
    } finally {
      setIsAddingToCart(false);
    }
  }, [
    product.id,
    product.store.id,
    product._unifiedGroup,
    isAddingToCart,
    addToCart,
    onAddToCartSuccess,
    shippingAddressPrefecture,
    selectedCount,
    getUserId,
  ]);

  const handleGoToShop = useCallback(() => {
    router.push(shopLink);
  }, [shopLink, router]);

  return (
    <Card
      sx={{
        borderRadius: '10px',
        border: '1px solid',
        borderColor: 'grey.400',
        p: hasTitle ? 0 : 2,
        boxShadow: 'none',
      }}
    >
      <Stack direction="column" spacing={1}>
        {hasTitle && (
          <Typography
            variant="h4"
            color="white"
            fontWeight="bold"
            sx={{
              fontSize: '1rem !important',
              bgcolor: 'primary.main',
              textAlign: 'center',
              textBox: 'trim-both cap alphabetic',
              p: '12px',
            }}
          >
            {getConditionLabel(
              (product.condition_option?.handle as ConditionOptionHandle) ??
                null,
            )}
            {orderBy ? ` ${orderBy}` : ''}
          </Typography>
        )}
        <Stack
          direction="column"
          spacing={1}
          sx={{ p: hasTitle ? 2 : 0, pt: hasTitle ? 0 : 0 }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {product.specialty?.handle && (
                // 特殊状態
                <SpecialtyTag value={product.specialty.handle} />
              )}
              <ConditionTag
                value={
                  (product.condition_option?.handle as ConditionOptionHandle) ??
                  null
                }
              />
            </Box>
            <Typography
              fontWeight="bold"
              color="primary.main"
              sx={{ fontSize: '1.4rem !important' }}
            >
              {formatPrice(displayPrice)}円
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'end',
                gap: 1,
                justifyContent: 'flex-end',
                flex: 1,
              }}
            >
              {hasImages &&
                product.images &&
                product.images[0] &&
                product.images[0].image_url && (
                  <Box
                    sx={{
                      position: 'relative',
                      paddingTop: '6px',
                      paddingRight: '6px',
                    }}
                  >
                    {/* 最初の画像のプレビュー */}
                    <Box
                      sx={{
                        width: 55,
                        height: 55,
                        border: '1.5px solid',
                        borderColor: 'grey.400',
                        borderRadius: 2,
                        overflow: 'hidden',
                        position: 'relative',
                        cursor: 'pointer',
                      }}
                      onClick={() => setIsImageViewerOpen(true)}
                    >
                      <Image
                        src={
                          product.images[0].image_url || '/images/no-image.png'
                        }
                        alt="商品画像"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </Box>
                    {/* 画像数バッジ（複数枚の場合のみ表示） */}
                    {product.images.length > 1 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          bgcolor: 'primary.main',
                          color: 'white',
                          borderRadius: '50%',
                          width: 20,
                          height: 20,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          border: '2px solid white',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          zIndex: 1,
                        }}
                      >
                        +{product.images.length - 1}
                      </Box>
                    )}
                  </Box>
                )}
            </Box>
          </Stack>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 1,
              alignItems: 'center',
            }}
          >
            <Typography variant="h5">{displayStoreName}</Typography>
            <Typography
              onClick={handleGoToShop}
              sx={{
                fontSize: '0.5rem',
                color: 'grey.600',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              このショップについて
            </Typography>
          </Box>
          {freeShipping && (
            <Typography variant="h5" color="grey.600">
              このショップで{freeShippingPrice}円以上の注文で送料無料
            </Typography>
          )}
          {enableSameDayShipping && (
            <Typography variant="h5" color="grey.600">
              {sameDayLimitHour}時までの注文で即日発送
            </Typography>
          )}
          {product.description && product.description.trim() !== '' && (
            <Accordion
              sx={{
                boxShadow: 'none',
                border: 'none',
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="memo-content"
                id="memo-header"
                sx={{
                  minHeight: 32,
                  pl: 0,
                  '& .MuiAccordionSummary-content': { my: 0.5, ml: 0 }, // 左寄せ
                  border: 'none',
                }}
              >
                <Typography
                  variant="caption"
                  color="grey.600"
                  fontWeight="bold"
                  sx={{ ml: 0 }} // 左寄せ
                >
                  この商品について詳しく知る
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ border: 'none' }}>
                <Typography
                  variant="caption"
                  color="grey.600"
                  sx={{
                    whiteSpace: 'pre-line',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                >
                  {product.description}
                </Typography>
              </AccordionDetails>
            </Accordion>
          )}
          <Stack
            direction="row"
            spacing={3}
            sx={{
              height: { xs: '40px', md: '50px' },
              justifyContent: { xs: 'flex-start', md: 'space-between' },
            }}
          >
            <Box sx={{ width: '100%', maxWidth: { xs: '100%', md: '30%' } }}>
              <StockSelect
                maxStock={maxAvailableStock}
                value={selectedCount}
                onChange={(value) => setSelectedCount(value)}
                disabled={isProductInCart}
              />
            </Box>
            <Button
              variant={isProductInCart ? 'outlined' : 'contained'}
              fullWidth
              onClick={isProductInCart ? handleGoToCart : handleAddToCart}
              disabled={isAddingToCart}
              sx={{
                bgcolor: isProductInCart ? 'white' : 'primary.main',
                py: 1.5,
                width: '100%',
                maxWidth: { xs: '100%', md: '30%' },
              }}
            >
              <Typography
                variant="h4"
                fontWeight="bold"
                color={isProductInCart ? 'primary.main' : 'white'}
              >
                {isAddingToCart
                  ? '追加中...'
                  : isProductInCart
                  ? 'カートを見る'
                  : 'カートに入れる'}
              </Typography>
            </Button>
          </Stack>
        </Stack>
      </Stack>

      {/* 画像ビューアーモーダル */}
      {hasImages && (
        <ImageViewer
          isOpen={isImageViewerOpen}
          onClose={() => setIsImageViewerOpen(false)}
          images={imageViewerImages}
          initialIndex={0}
        />
      )}
    </Card>
  );
};
