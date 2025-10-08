# EC Auth Message Center Detail - メッセージ詳細

## 目的
ECサイトで顧客が注文に関する個別メッセージの詳細内容・やり取り履歴を確認する機能

## 機能概要
- **メッセージ詳細表示**: 注文に関するメッセージの詳細内容・履歴表示
- **アコーディオン表示**: メッセージ履歴の展開・収納表示
- **注文内容確認**: メッセージに関連する注文詳細のモーダル表示
- **問い合わせ送信**: 該当注文への新規問い合わせ作成

## 実装されているファイル

### 1. page.tsx (448行) - メッセージ詳細画面
```typescript
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Typography,
  Button,
  Stack,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Box,
  Divider,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useRouter } from 'next/navigation';
import { PATH } from '@/app/ec/(core)/constants/paths';
import { useEcOrderContact } from '@/app/ec/(core)/hooks/useEcOrderContact';
import { useEcOrder } from '@/app/ec/(core)/hooks/useEcOrder';
import {
  transformEcOrder,
  TransformedEcOrder,
} from '@/app/ec/(core)/utils/transformEcOrder';
import { CommonModal } from '@/app/ec/(core)/components/modals/CommonModal';
import {
  MessageSummary,
  transformEcOrderContact,
  isValidOrderContactResponse,
} from '@/app/ec/(core)/utils/transformEcOrderContact';
import { getOrderContactKindValue } from '@/app/ec/(core)/constants/orderContactKInd';
import MessageIcon from '@mui/icons-material/Message';
import {
  cardCondition,
  boxCondition,
} from '@/app/ec/(core)/constants/condition';
```

## 実装されている機能

### メッセージ詳細データ取得
```typescript
useEffect(() => {
  const fetchMessageDetail = async () => {
    setLoading(true);
    try {
      const orderContacts = await getOrderContact(params.id, {
        includesMessages: true,
      });

      if (isValidOrderContactResponse(orderContacts)) {
        const targetContact = orderContacts.ecOrderContacts.find(
          (contact) => contact.order_store.code === params.id,
        );

        if (targetContact) {
          const convertedMessage = transformEcOrderContact(targetContact);
          setMessage(convertedMessage);
        }
      }
    } catch (error) {
      console.error('メッセージの取得に失敗しました', error);
    } finally {
      setLoading(false);
    }
  };

  fetchMessageDetail();
}, [params.id, getOrderContact]);
```

### 注文データ取得・表示
```typescript
const fetchOrderData = async () => {
  if (!message?.orderNumber) return;
  setOrderLoading(true);
  try {
    const cartData = await getCartContents(message.orderNumber);
    if (cartData) {
      const transformedOrders = transformEcOrder(cartData);
      const order = transformedOrders.find(
        (order) => order.storeOrderCode.toString() == message.id,
      );

      if (order) {
        setOrderData(order);
      }
    }
  } catch (error) {
    console.error('注文データの取得に失敗しました', error);
  } finally {
    setOrderLoading(false);
  }
};
```

### 商品状態表示ユーティリティ
```typescript
const getConditionLabel = (conditionHandle: string): string => {
  // カード状態をチェック
  const cardMatch = cardCondition.find(
    (condition) => condition.value === conditionHandle,
  );
  if (cardMatch) {
    return cardMatch.label;
  }

  // ボックス状態をチェック
  const boxMatch = boxCondition.find(
    (condition) => condition.value === conditionHandle,
  );
  if (boxMatch) {
    return boxMatch.label;
  }

  // 何も見つからない場合はそのまま返す
  return conditionHandle;
};
```

### アコーディオン式メッセージ履歴
```typescript
{message.details.map((detail, index) => (
  <Accordion
    key={index}
    expanded={expandedIndex === index}
    onChange={() => toggleAccordion(index)}
    sx={{
      mb: 2,
      py: 2,
      borderRadius: 2,
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      '&::before': {
        display: 'none',
      },
    }}
  >
    <AccordionSummary
      expandIcon={<ExpandMoreIcon />}
      sx={{
        '&.Mui-expanded': {
          paddingBottom: 2,
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      <Stack sx={{ overflow: 'hidden' }} spacing={1}>
        <Stack direction="column">
          <Typography fontWeight="medium">
            {detail.sender}
          </Typography>
          <Typography>
            {detail.timestamp}
          </Typography>
        </Stack>
        <Typography noWrap>
          {detail.content}
        </Typography>
      </Stack>
    </AccordionSummary>
    <AccordionDetails sx={{ p: 2 }}>
      <Typography variant="body1">{detail.content}</Typography>
    </AccordionDetails>
  </Accordion>
))}
```

### 注文内容モーダル表示
```typescript
<CommonModal
  isOpen={isOrderModalOpen}
  onClose={handleCloseOrderModal}
  title="ご注文内容"
  isCancel={false}
  submitLabel="戻る"
  onSubmit={handleCloseOrderModal}
>
  {orderLoading ? (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
      <CircularProgress />
    </Box>
  ) : orderData ? (
    <Box sx={{ py: 2, px: 0 }}>
      {/* 注文ヘッダー */}
      <Stack direction="column" spacing={1} sx={{ mb: 1 }}>
        <Typography variant="body2" fontWeight="bold">
          ご注文番号 #{orderData.storeOrderCode}
        </Typography>
        <Typography variant="body2" fontWeight="bold">
          {orderData.shopName}
        </Typography>
      </Stack>

      {/* 注文アイテム */}
      <Stack spacing={2}>
        {orderData.items.map((item, index) => (
          <Stack key={index} direction="row" spacing={2}>
            <Box sx={{ width: 60, height: 90, position: 'relative' }}>
              <Image
                src={item.imageUrl || '/sample.png'}
                alt={item.name}
                fill
                sizes="60px"
                style={{ objectFit: 'contain' }}
              />
            </Box>
            <Stack justifyContent="space-between" sx={{ flex: 1, p: 1 }}>
              <Typography variant="body2" fontWeight="bold">
                {item.name}
              </Typography>
              <Stack direction="row" justifyContent="space-between">
                <Stack direction="row" alignItems="center">
                  <Chip
                    label={getConditionLabel(item.condition)}
                    variant="outlined"
                    size="small"
                  />
                  <Typography variant="caption" fontWeight="bold">
                    {(item.price || 0).toLocaleString()}円
                  </Typography>
                </Stack>
                <Typography variant="caption" fontWeight="bold">
                  ご注文数：{item.quantity}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        ))}
      </Stack>
    </Box>
  ) : (
    <Typography align="center" sx={{ p: 3 }}>
      注文データが見つかりませんでした
    </Typography>
  )}
</CommonModal>
```

## 状態管理

### 主要な状態
```typescript
const [message, setMessage] = useState<MessageSummary | null>(null);
const [loading, setLoading] = useState(false);
const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
const [orderData, setOrderData] = useState<TransformedEcOrder | null>(null);
const [orderLoading, setOrderLoading] = useState(false);
```

### アコーディオン制御
```typescript
const toggleAccordion = (index: number) => {
  setExpandedIndex(expandedIndex === index ? null : index);
};
```

## 使用している依存関係

### フック・ユーティリティ
- **useEcOrderContact**: 注文問い合わせデータ取得
- **useEcOrder**: 注文データ取得（getCartContents）
- **transformEcOrder**: 注文データ変換
- **transformEcOrderContact**: 問い合わせデータ変換
- **getOrderContactKindValue**: 問い合わせ種別表示
- **cardCondition/boxCondition**: 商品状態定数

### Material-UI コンポーネント
- **Accordion/AccordionSummary/AccordionDetails**: アコーディオン表示
- **Container/Box/Stack**: レイアウト
- **Typography**: テキスト表示
- **Button**: アクションボタン
- **CircularProgress**: ローディング表示
- **Chip**: 商品状態表示
- **Divider**: 区切り線

## UI/UX の特徴

### レスポンシブデザイン
- **モバイル最適化**: 小画面での読みやすい表示
- **アコーディオン**: メッセージ履歴の効率的な表示
- **モーダル**: 注文詳細の重層表示

### 視覚的フィードバック
- **ローディング状態**: CircularProgress での読み込み表示
- **空状態**: MessageIcon での空状態表示
- **状態表示**: Chip での商品状態表示

### インタラクション
- **アコーディオン展開**: メッセージ詳細の展開・収納
- **注文内容表示**: クリックでモーダル表示
- **問い合わせ送信**: 該当注文への問い合わせ作成

## 技術実装の特徴

### 動的パラメータ処理
```typescript
interface MessageDetailProps {
  params: { id: string };
}

const MessageDetail: React.FC<MessageDetailProps> = ({ params }) => {
  // params.id を使用してメッセージ詳細を取得
};
```

### エラーハンドリング
```typescript
try {
  const orderContacts = await getOrderContact(params.id, {
    includesMessages: true,
  });
  // 処理
} catch (error) {
  console.error('メッセージの取得に失敗しました', error);
} finally {
  setLoading(false);
}
```

### 条件分岐表示
```typescript
if (loading) return <CircularProgress />;
if (!message) return <EmptyState />;
return <MessageDetailContent />;
```

## ナビゲーション機能
```typescript
const navigateToContact = (id: string) => {
  router.push(PATH.ORDER.contact(id));
};
```

## 関連ディレクトリ
- `../`: メッセージセンター一覧
- `../../order/contact/`: 注文問い合わせ機能
- `../(core)/hooks/`: useEcOrderContact, useEcOrder
- `../(core)/utils/`: transformEcOrder, transformEcOrderContact
- `../(core)/constants/`: 問い合わせ種別・商品状態定数
- `../(core)/components/`: CommonModal

## 開発ノート
- **複雑な状態管理**: メッセージ・注文・モーダル・アコーディオンの状態統合
- **データ変換**: API レスポンスから UI 表示用データへの変換
- **エラーハンドリング**: try-catch による統一されたエラー処理
- **UX設計**: ローディング・空状態・エラー状態の適切な表示
- **パフォーマンス**: useEffect の依存関係最適化
- **型安全性**: TypeScript による MessageSummary・TransformedEcOrder 型

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 