'use client';

import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Stack,
} from '@mui/material';
import { EcItem } from '@/app/ec/(core)/hooks/useEcItem';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PATH } from '@/app/ec/(core)/constants/paths';
import {
  cardCondition,
  boxCondition,
} from '@/app/ec/(core)/constants/condition';
import { useDevice } from '@/app/ec/(core)/contexts/DeviceContext';

// ReactNativeWebViewの型定義を追加
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage(message: string): void;
    };
  }
}

/**
 * 商品カードコンポーネントのプロパティ
 */
type Props = {
  item: EcItem; // 表示する商品情報
};

/**
 * PC版商品カードコンポーネント
 */
const DesktopItemCard = ({ item }: Props) => {
  const searchParams = useSearchParams();
  const currentParams = searchParams.toString();
  const detailUrl = `${PATH.ITEMS.detail(Number(item.id))}?${currentParams}`;

  return (
    <Link
      href={detailUrl}
      style={{ textDecoration: 'none', color: 'inherit', height: '100%' }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'row', // 横並びレイアウト
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          },
          cursor: 'pointer',
          borderRadius: 2,
          overflow: 'hidden',
          minHeight: '180px', // 横長カードの最小高さ
        }}
      >
        {/* 商品画像エリア */}
        <Box
          sx={{
            position: 'relative',
            width: '150px', // 固定幅
            minWidth: '150px', // 最小幅を確保
            padding: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CardMedia
            component="img"
            image={item.fullImageUrl ?? '/images/ec/noimage.png'}
            alt={item.cardName}
            sx={{
              width: '100%',
              height: '100%',
              maxHeight: '250px',
              objectFit: 'contain',
              bgcolor: 'white',
              borderRadius: 1,
              border: '1px solid #f0f0f0',
            }}
          />
        </Box>

        {/* 商品情報エリア */}
        <CardContent
          sx={{
            p: 2,
          }}
        >
          {/* 商品情報上部 */}
          <Box sx={{ flex: 1 }}>
            {/* 商品名 */}
            <Typography
              variant="h6"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.3,
                fontWeight: 600,
                mb: 1,
                fontSize: '1.1rem',
              }}
            >
              {item.cardName}
            </Typography>

            {/* 型番とレア度を縦並び */}
            <Stack direction="column" spacing={0.5} sx={{ mb: 1 }}>
              <Typography
                variant="body2"
                color="grey.600"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  flex: 1,
                }}
              >
                {item.expansion} {item.cardNumber}
              </Typography>
              <Typography
                variant="body2"
                color="grey.600"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  minWidth: '80px',
                }}
              >
                {item.rarity}
              </Typography>
            </Stack>
          </Box>

          {/* 価格・在庫情報エリア（下部） */}
          <Box>
            {item.topPosProduct.ecStockNumber > 0 &&
            item.topPosProduct.actualEcSellPrice !== null &&
            item.topPosProduct.conditionOptionHandle !== null ? (
              <>
                {/* 商品の状態表示 */}
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.6rem',
                    borderRadius: 1,
                    px: 1.5,
                    py: 0.5,
                    bgcolor: '#f5f5f5',
                    border: '1px solid #e0e0e0',
                    whiteSpace: 'nowrap',
                    fontWeight: 500,
                    display: 'inline-block',
                    mr: 2,
                  }}
                >
                  {cardCondition.find(
                    (condition) =>
                      condition.value ===
                      item.topPosProduct.conditionOptionHandle,
                  )?.label ||
                    boxCondition.find(
                      (condition) =>
                        condition.value ===
                        item.topPosProduct.conditionOptionHandle,
                    )?.label}
                </Typography>

                {/* 価格表示 */}
                <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
                  <Typography
                    variant="h2"
                    color="error"
                    sx={{
                      fontWeight: 'bold',
                      fontSize: '1.3rem',
                    }}
                  >
                    ¥
                    {item.topPosProduct.actualEcSellPrice?.toLocaleString() ??
                      0}
                    {item.productCount.$bigint &&
                    BigInt(item.productCount.$bigint) > 1n
                      ? '〜'
                      : ''}
                  </Typography>
                </Box>
                {item.productCount.$bigint && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'grey.600',
                      whiteSpace: 'nowrap',
                      fontSize: '0.8rem',
                    }}
                  >
                    {BigInt(item.productCount.$bigint).toString()}商品の出品
                  </Typography>
                )}
              </>
            ) : (
              // 在庫がない場合は売り切れ表示
              <Typography
                variant="body2"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  bgcolor: '#666',
                  borderRadius: 50,
                  px: 3,
                  py: 1,
                  fontSize: '0.85rem',
                }}
              >
                売り切れ
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Link>
  );
};

/**
 * モバイル版商品カードコンポーネント
 */
const MobileItemCard = ({ item }: Props) => {
  const searchParams = useSearchParams();
  const currentParams = searchParams.toString();
  const detailUrl = `${PATH.ITEMS.detail(Number(item.id))}?${currentParams}`;

  return (
    <Link
      href={detailUrl}
      style={{ textDecoration: 'none', color: 'inherit', height: '100%' }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.05)',
          },
          cursor: 'pointer',
        }}
      >
        {/* 商品画像エリア */}
        <Box sx={{ position: 'relative', mt: 1 }}>
          <CardMedia
            component="img"
            height="140"
            image={item.fullImageUrl ?? '/images/ec/noimage.png'}
            alt={item.cardName}
            sx={{ objectFit: 'contain', bgcolor: 'white' }}
          />
        </Box>
        {/* 商品情報エリア */}
        <CardContent
          sx={{ p: 1, flexGrow: 1, display: 'flex', flexDirection: 'column' }}
        >
          {/* 商品名 - 2行まで表示、それ以上は省略 */}
          <Typography
            variant="body2"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.2,
            }}
          >
            {item.cardName}
          </Typography>
          {/* 型番 - 1行まで表示、それ以上は省略 */}
          <Typography
            variant="caption"
            sx={{
              mb: 0.5,
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.expansion} {item.cardNumber}
          </Typography>
          {/* レア度 - 1行まで表示、それ以上は省略 */}
          <Typography
            variant="caption"
            sx={{
              mb: 0.5,
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.rarity}
          </Typography>
          {/* 価格・在庫情報エリア - カードの下部に配置 */}
          <Box sx={{ mt: 'auto' }}>
            {/* 在庫があり、価格が設定されており、コンディションがある場合は状態と価格を表示 */}
            {item.topPosProduct.ecStockNumber > 0 &&
            item.topPosProduct.actualEcSellPrice !== null &&
            item.topPosProduct.conditionOptionHandle !== null ? (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                {/* 商品の状態表示 */}
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.6rem',
                    borderRadius: 0.5,
                    p: '2px',
                    m: 0,
                    border: '1px solid #f0f0f0',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    width: 'fit-content',
                    maxWidth: '100px',
                    minWidth: '35px',
                  }}
                >
                  {cardCondition.find(
                    (condition) =>
                      condition.value ===
                      item.topPosProduct.conditionOptionHandle,
                  )?.label ||
                    boxCondition.find(
                      (condition) =>
                        condition.value ===
                        item.topPosProduct.conditionOptionHandle,
                    )?.label}
                </Typography>
                {/* 価格表示 */}
                <Typography
                  color="error"
                  sx={{
                    fontWeight: 'bold',
                    lineHeight: 1.2,
                    fontSize: { xs: '11.5px', sm: '16px' }, // フォントサイズの最適化
                  }}
                >
                  {item.topPosProduct.actualEcSellPrice?.toLocaleString() ?? 0}
                  円{' '}
                  {item.productCount.$bigint &&
                  BigInt(item.productCount.$bigint) > 1n
                    ? '〜'
                    : ''}
                </Typography>
              </Stack>
            ) : (
              // 在庫がない場合は売り切れ表示
              <Typography
                variant="caption"
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  width: 'fit-content',
                  color: 'white',
                  fontWeight: 'bold',
                  bgcolor: 'black',
                  borderRadius: 100,
                  margin: 'auto',
                  p: '2px 15px',
                }}
              >
                売り切れ
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Link>
  );
};

/**
 * 商品カードコンポーネント
 * デバイス別にPC版とモバイル版のUIを切り替える
 * @param item - 表示する商品情報
 */
export const ItemCard = ({ item }: Props) => {
  const { isDesktop } = useDevice();

  if (isDesktop) {
    return <DesktopItemCard item={item} />;
  } else {
    return <MobileItemCard item={item} />;
  }
};
