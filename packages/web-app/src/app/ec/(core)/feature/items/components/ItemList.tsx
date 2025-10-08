'use client';

// ReactNativeWebViewの型定義を追加
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage(message: string): void;
    };
  }
}

import { Paper, Box, Typography, Stack } from '@mui/material';
import Image from 'next/image';
import { EcItem } from '@/app/ec/(core)/hooks/useEcItem';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PATH } from '@/app/ec/(core)/constants/paths';
import {
  cardCondition,
  boxCondition,
} from '@/app/ec/(core)/constants/condition';
/**
 * 商品リストアイテムのProps
 */
type Props = {
  item: EcItem;
};

/**
 * 商品リストアイテムコンポーネント
 * @param item 商品情報
 */
export const ItemList = ({ item }: Props) => {
  const searchParams = useSearchParams();
  const currentParams = searchParams.toString();
  const detailUrl = `${PATH.ITEMS.detail(Number(item.id))}?${currentParams}`;

  return (
    <Link href={detailUrl} style={{ textDecoration: 'none', color: 'inherit' }}>
      {/* 商品カード */}
      <Paper
        sx={{
          p: 1,
          '&:hover': {
            cursor: 'pointer',
            bgcolor: 'grey.50',
            transition:
              'background-color 0.2s, transform 0.2s, box-shadow 0.2s',
            transform: 'scale(1.05)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        {/* 商品情報レイアウト */}
        <Stack direction="row" spacing={2}>
          {/* 商品画像 */}
          <Box sx={{ width: 80, height: 80, position: 'relative' }}>
            <Image
              src={item.fullImageUrl ?? '/images/ec/noimage.png'}
              alt={item.cardName}
              width={80}
              height={80}
              style={{ objectFit: 'contain', height: '100%' }}
            />
          </Box>
          {/* 商品詳細情報 */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* 商品名 - 2行まで表示 */}
            <Typography
              variant="body2"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.2,
                mb: 0.5,
              }}
            >
              {item.cardName}
            </Typography>
            {/* 型番 - 1行まで表示 */}
            <Typography
              variant="caption"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mb: 0.5,
              }}
            >
              {item.expansion} {item.cardNumber}
            </Typography>
            {/* レアリティ - 1行まで表示 */}
            <Typography
              variant="caption"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mb: 0.5,
              }}
            >
              {item.rarity}
            </Typography>
            {/* 在庫状況と価格表示 */}
            {item.topPosProduct.ecStockNumber > 0 &&
            item.topPosProduct.actualEcSellPrice !== null &&
            item.topPosProduct.conditionOptionHandle !== null ? (
              // 在庫ありの場合
              <Stack direction="row" alignItems="center" spacing={0.5}>
                {/* 商品状態 */}
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.6rem',
                    borderRadius: 0.5,
                    p: '2px',
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
                  variant="body2"
                  color="error"
                  sx={{
                    fontWeight: 'bold',
                    lineHeight: 1.2,
                  }}
                >
                  {item.topPosProduct.actualEcSellPrice?.toLocaleString() ?? 0}
                  円{item.productCount > 1 ? '〜' : ''}
                </Typography>
              </Stack>
            ) : (
              // 在庫なしの場合
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
                  p: '2px 15px',
                }}
              >
                売り切れ
              </Typography>
            )}
          </Box>
        </Stack>
      </Paper>
    </Link>
  );
};
