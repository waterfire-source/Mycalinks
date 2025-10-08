'use client';

import {
  Card,
  Stack,
  Typography,
  Box,
  Button,
  Container,
  IconButton,
} from '@mui/material';
import Image from 'next/image';
import { ProductCard } from '@/app/ec/(core)/components/cards/ProductCard';
import { ItemInfoTable } from '@/app/ec/(core)/components/tables/ItemInfoTable';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Alert } from '@/app/ec/(core)/components/alerts/Alert';
import { ProductSummaryCard } from '@/app/ec/(core)/components/cards/ProductSummaryCard';
import { SortSelect } from '@/app/ec/(core)/components/selects/SortSelect';
import {
  ORDER_KIND_VALUE,
  OrderKind,
} from '@/app/ec/(core)/constants/orderKind';
import { MycaPosApiClient } from 'api-generator/client';
import { SelectChangeEvent } from '@mui/material';
import {
  unifyProducts,
  sortUnifiedProducts,
  UnifiableProduct,
  UnifiedProductGroup,
  SortOption,
} from '@/app/ec/(core)/utils/unifyProducts';
import {
  formatViewAllText,
  formatSimpleCount,
} from '@/app/ec/(core)/utils/productCounts';
import { ReportModal } from '@/app/ec/(core)/components/modals/ReportModal';
import { ImageViewer } from '@/app/ec/(core)/components/viewer/ImageViewer';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { PATH } from '@/app/ec/(core)/constants/paths';
import { StoreSelectionBanner } from '@/app/ec/(core)/components/banner/StoreSelectionBanner';
import { SpecialtyHandle } from '@prisma/client';

export type EcProduct = {
  id: number;
  ec_stock_number: number;
  actual_ec_sell_price: number | null;
  store: {
    id: number;
    display_name: string | null;
    ec_setting: {
      enable_same_day_shipping: boolean;
      same_day_limit_hour: number | null;
      shipping_days: number | null;
      free_shipping: boolean;
      free_shipping_price: number | null;
    };
  };
  condition_option: {
    handle: string;
  };
  images?: Array<{
    image_url: string | null;
    description: string | null;
    order_number: number;
  }>;
  specialty: {
    handle: SpecialtyHandle;
  } | null;
  description?: string | null;
  _unifiedGroup?: UnifiedProductGroup<EcUnifiableProduct>;
};

type Props = {
  data: Awaited<ReturnType<MycaPosApiClient['ec']['getEcProduct']>>;
  storeIds?: number[];
};

// EcProductをUnifiableProductに適応するアダプター
type EcUnifiableProduct = UnifiableProduct &
  Omit<EcProduct, 'specialty'> & {
    specialty: string | null; // unifyProducts用のspecialtyフィールド（string | null）
    originalSpecialty: EcProduct['specialty']; // ProductCard用の元の構造を保持
  };

const adaptEcProduct = (product: EcProduct): EcUnifiableProduct => {
  // descriptionが入力されていない場合
  const hasNoDescription =
    !product.description || product.description.trim() === '';
  // imagesがない場合
  const hasNoImages = !product.images || product.images.length === 0;

  // 統合する条件：descriptionが入力されていない または imagesがない場合に統合
  // 統合しない条件：descriptionが入力済み かつ imagesがある場合のみ統合しない
  const shouldUnify = hasNoDescription || hasNoImages;

  const { specialty, ...restProduct } = product;

  return {
    ...restProduct,
    storeId: product.store.id,
    // unifyProductsで使用するspecialtyフィールド（string | null）
    specialty: specialty?.handle || null,
    // ProductCard用の元の構造を保持
    originalSpecialty: specialty,
    price: product.actual_ec_sell_price || 0,
    quantity: product.ec_stock_number,
    hasCustomization: !shouldUnify, // 統合しない場合はカスタマイズありとして扱う
  };
};

/**
 * 商品詳細コンテンツコンポーネント
 * @param data - 商品詳細データ
 * @param storeIds - 店舗IDリスト
 */
export const DetailContent = ({ data, storeIds = [] }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // nullチェックを行い、デフォルト値を設定
  const displayName = data.mycaItem.cardname ?? '-';
  const displayCardNumber =
    data.mycaItem.expansion && data.mycaItem.cardnumber
      ? `${data.mycaItem.expansion} ${data.mycaItem.cardnumber}`
      : '-';
  const displayRarity = data.mycaItem.rarity ?? '-';
  const displayImageUrl =
    data.mycaItem.full_image_url ?? '/images/no-image.png';

  // 有効な商品のみを抽出（在庫があり、価格が設定されている商品）
  const validProducts = useMemo(
    () =>
      data.products.filter(
        (product) =>
          product.ec_stock_number > 0 &&
          product.actual_ec_sell_price !== null &&
          product.condition_option !== null,
      ),
    [data.products],
  );

  // storeIdsでフィルタ
  const filteredProducts = useMemo(
    () =>
      storeIds.length === 0
        ? validProducts
        : validProducts.filter((product) =>
            storeIds.includes(product.store.id),
          ),
    [validProducts, storeIds],
  );

  // 商品が存在するかどうか
  const hasProducts = filteredProducts.length > 0;
  // 2つ目以降の商品が存在するかどうか
  const hasMoreProducts = filteredProducts.length > 1;

  // 旧TOPロジック（グループ化前の商品から選択）- 後でoptimizedTopProductに置き換え済み
  const _legacyTopProduct = useMemo(() => {
    if (!hasProducts) return null;

    return filteredProducts.reduce((best, current) => {
      const currentHandle = current.condition_option?.handle ?? '';
      const bestHandle = best.condition_option?.handle ?? '';
      const currentPrice = current.actual_ec_sell_price ?? 0;
      const bestPrice = best.actual_ec_sell_price ?? 0;

      // 状態が良い順
      if (currentHandle < bestHandle) return current;
      // 状態が同じ場合は価格が安い方
      if (currentHandle === bestHandle)
        return currentPrice < bestPrice ? current : best;
      return best;
    }, filteredProducts[0]);
  }, [filteredProducts, hasProducts]);

  // モーダルの開閉状態
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  // カート追加通知の表示状態
  const [isCartNotifyOpen, setIsCartNotifyOpen] = useState(false);
  // スクロールヘッダーの表示状態
  const [showScrollHeader, setShowScrollHeader] = useState(false);
  // 画像ビューアーの開閉状態
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  // メインカードの参照
  const mainCardRef = useRef<HTMLDivElement>(null);
  // ProductCardの位置を参照するためのref
  const productCardRef = useRef<HTMLDivElement>(null);

  // 並び替えの状態管理 - 常に「安い順」を初期値とする
  const [sortOrder, setSortOrder] = useState<OrderKind['value']>(
    ORDER_KIND_VALUE.PRICE_ASC,
  );

  // 統合機能の状態管理
  const [unificationSort, setUnificationSort] = useState<SortOption>({
    field: 'price',
    order: 'asc',
  });

  // 統合処理された商品リスト（常に統合ON）
  const processedProducts = useMemo(() => {
    if (filteredProducts.length <= 1) {
      // 商品が1個以下の場合は統合処理不要
      return filteredProducts;
    }

    // 統合処理: 同一店舗・specialty・価格の商品をまとめる
    const adaptedProducts = filteredProducts.map(adaptEcProduct);
    const unifiedGroups = unifyProducts(adaptedProducts);
    const sortedGroups = sortUnifiedProducts(unifiedGroups, unificationSort);

    // 統合グループから代表商品を作成（在庫数は合計値）
    return sortedGroups.map((group) => {
      const representativeProduct = group.products[0];
      // ProductCardが期待する構造に戻す
      const { originalSpecialty, ...restProduct } = representativeProduct;
      return {
        ...restProduct,
        specialty: originalSpecialty, // 元の構造に戻す
        ec_stock_number: group.totalQuantity, // 在庫数を合計値に変更
        _unifiedGroup: group, // 統合情報を保持（デバッグ用）
      };
    });
  }, [filteredProducts, unificationSort]);

  // グループ化された商品から最適なTOP商品を再選択
  const optimizedTopProduct = useMemo(() => {
    if (processedProducts.length === 0) return null;

    return processedProducts.reduce((best, current) => {
      const currentHandle = current.condition_option?.handle ?? '';
      const bestHandle = best.condition_option?.handle ?? '';
      const currentPrice = current.actual_ec_sell_price ?? 0;
      const bestPrice = best.actual_ec_sell_price ?? 0;

      // 状態が良い順（handle値が小さいほど良い状態）
      if (currentHandle < bestHandle) return current;
      // 状態が同じ場合は価格が安い方
      if (currentHandle === bestHandle)
        return currentPrice < bestPrice ? current : best;
      return best;
    }, processedProducts[0]);
  }, [processedProducts]);

  // 並び替え後の商品リスト（従来機能）
  const sortedProducts = useMemo(() => {
    return [...processedProducts].sort((a, b) => {
      if (a.actual_ec_sell_price === null) return 1;
      if (b.actual_ec_sell_price === null) return -1;

      // 価格での並び替え
      if (sortOrder === ORDER_KIND_VALUE.PRICE_ASC) {
        return a.actual_ec_sell_price - b.actual_ec_sell_price;
      }
      if (sortOrder === ORDER_KIND_VALUE.PRICE_DESC) {
        return b.actual_ec_sell_price - a.actual_ec_sell_price;
      }

      // 状態での並び替え
      if (
        sortOrder === ORDER_KIND_VALUE.CONDITION_ASC ||
        sortOrder === ORDER_KIND_VALUE.CONDITION_DESC
      ) {
        const handleA = a.condition_option?.handle ?? '';
        const handleB = b.condition_option?.handle ?? '';
        return sortOrder === ORDER_KIND_VALUE.CONDITION_ASC
          ? handleA.localeCompare(handleB)
          : handleB.localeCompare(handleA);
      }

      return a.actual_ec_sell_price - b.actual_ec_sell_price;
    });
  }, [processedProducts, sortOrder]);

  // スクロールヘッダーの表示制御
  useEffect(() => {
    const handleScroll = () => {
      if (productCardRef.current) {
        const rect = productCardRef.current.getBoundingClientRect();
        setShowScrollHeader(rect.top < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // イベントハンドラー
  const handleSortChange = (event: SelectChangeEvent) => {
    const newValue = event.target.value as OrderKind['value'];
    setSortOrder(newValue);
  };

  // モーダルを開く
  const handleOpenReportModal = () => {
    setIsReportModalOpen(true);
  };

  // モーダルを閉じる
  const handleCloseReportModal = () => {
    setIsReportModalOpen(false);
  };

  // カート追加通知を閉じる
  const handleCloseCartNotify = () => {
    setIsCartNotifyOpen(false);
  };

  return (
    <>
      {/* スクロールで表示させる */}
      <ProductSummaryCard
        product={{
          name: displayName,
          cardNumber: displayCardNumber,
          rarity: displayRarity,
          imageUrl: displayImageUrl,
          price: optimizedTopProduct?.actual_ec_sell_price ?? null,
        }}
        isScrollHeader
        isVisible={showScrollHeader}
      />

      <Container maxWidth="md" sx={{ px: 0, mt: { xs: '-14px', md: 5 } }}>
        <Card sx={{ p: 2 }} ref={mainCardRef}>
          <Stack spacing={2}>
            {/* バックボタンと商品情報 */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <IconButton
                onClick={() => {
                  const genreId = data.mycaItem.genre_id;
                  if (genreId) {
                    // 現在のクエリパラメータを取得
                    const currentParams = searchParams.toString();
                    const url = currentParams
                      ? `${PATH.ITEMS.genre(
                          genreId.toString(),
                        )}?${currentParams}`
                      : `${PATH.ITEMS.genre(
                          genreId.toString(),
                        )}?hasStock=true&orderBy=-actual_ec_sell_price`;
                    router.push(url);
                  } else {
                    router.push(PATH.TOP);
                  }
                }}
                sx={{
                  mt: 0.5,
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ArrowBackIosIcon />
              </IconButton>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {displayName}
                </Typography>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {displayCardNumber + ' ' + displayRarity}
                </Typography>
              </Box>
            </Box>
            {/* 画像コンテナ */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Box
                onClick={() => setIsImageViewerOpen(true)}
                sx={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '500px',
                  aspectRatio: '1/1',
                  bgcolor: 'white',
                  borderRadius: 2,
                  overflow: 'hidden',
                  my: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.9,
                    transform: 'scale(1.01)',
                    transition: 'all 0.2s ease',
                  },
                }}
              >
                <Image
                  src={displayImageUrl}
                  alt={displayName}
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </Box>
            </Box>

            {/* 店舗選択バナー */}
            <StoreSelectionBanner borderRadius={2} />

            <Box ref={productCardRef}>
              {hasProducts ? (
                <ProductCard
                  product={optimizedTopProduct!}
                  hasTitle
                  orderBy="最安値"
                  onAddToCartSuccess={() => setIsCartNotifyOpen(true)}
                />
              ) : (
                <Box
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    color: 'grey.600',
                    bgcolor: 'grey.100',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="h5">
                    現在、購入可能な商品はありません
                  </Typography>
                </Box>
              )}
            </Box>

            {/* 2つ目以降の商品が存在する場合のみ表示 */}
            {hasMoreProducts && (
              <Box
                onClick={() => {
                  document
                    .getElementById('product-list')
                    ?.scrollIntoView({ behavior: 'smooth' });
                }}
                sx={{
                  textAlign: 'center',
                  border: '1px solid',
                  borderColor: 'grey.400',
                  borderRadius: '10px',
                  p: 2,
                  cursor: 'pointer',
                }}
              >
                <Typography sx={{ textDecoration: 'underline' }}>
                  {formatViewAllText(processedProducts.length)}
                </Typography>
              </Box>
            )}

            {/* 商品詳細情報テーブル */}
            <ItemInfoTable item={data.mycaItem} />

            {/* 問題報告ボタン */}
            <Button
              variant="text"
              startIcon={
                <ErrorOutlineOutlinedIcon sx={{ color: 'grey.600' }} />
              }
              onClick={handleOpenReportModal}
              sx={{
                width: 'fit-content',
                color: 'grey.600',
              }}
            >
              問題を報告
            </Button>
          </Stack>
        </Card>

        {/* 商品リストセクション */}
        <Box sx={{ p: 1 }} id="product-list">
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            pl={1}
            mt={2}
            mb={1}
          >
            {hasProducts ? (
              <>
                <Typography variant="h3" fontWeight="bold">
                  {formatSimpleCount(processedProducts.length)}
                </Typography>
                <SortSelect value={sortOrder} onChange={handleSortChange} />
              </>
            ) : (
              <Typography variant="h3" color="grey.600" mx="auto">
                現在、購入可能な商品はありません
              </Typography>
            )}
          </Stack>

          {hasProducts ? (
            <Stack direction="column" spacing={2}>
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCartSuccess={() => setIsCartNotifyOpen(true)}
                />
              ))}
            </Stack>
          ) : null}
        </Box>

        {/* 問題報告モーダル */}
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={handleCloseReportModal}
          mycaItemId={data.mycaItem.id}
        />

        {/* 画像ビューアー */}
        <ImageViewer
          images={[
            {
              src: displayImageUrl,
              alt: displayName,
            },
          ]}
          isOpen={isImageViewerOpen}
          onClose={() => setIsImageViewerOpen(false)}
        />

        {/* カート追加通知 */}
        <Alert
          isOpen={isCartNotifyOpen}
          onClose={handleCloseCartNotify}
          severity="success"
          message="カートに商品を追加しました"
        />
      </Container>
    </>
  );
};
