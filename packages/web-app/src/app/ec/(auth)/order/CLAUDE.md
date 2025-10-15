# EC Auth Order - 注文確認・決済

## 目的
ECサイトで顧客がカート内容を確認し、支払い方法を選択して注文を確定する機能

## 機能概要
- **注文内容確認**: カート商品・価格・配送先の最終確認
- **支払い方法選択**: クレジットカード・コンビニ決済等の選択
- **注文確定処理**: 決済処理・注文完了までの一連の流れ
- **配送方法管理**: 配送方法の自動選択・最適化

## 実装されているファイル

### 1. page.tsx (578行) - 注文確認・決済画面
```typescript
'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  CircularProgress,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { PATH } from '@/app/ec/(core)/constants/paths';
import { useAppAuth } from '@/providers/useAppAuth';
import { StatusIcon } from '@/app/ec/(core)/components/icons/statusIcon';
import { useEcOrder } from '@/app/ec/(core)/hooks/useEcOrder';
import { useEcPayment } from '@/app/ec/(core)/hooks/useEcPayment';
import { PaymentMethodManager } from '@/app/ec/(core)/feature/order/PaymentMethodManager';
import { CustomError } from '@/api/implement';
import { EcPaymentMethod } from '@prisma/client';
import { useAlert } from '@/contexts/AlertContext';
import { StoreCard } from '@/app/ec/(core)/components/cards/StoreCard';
import { CartStore } from '@/app/ec/(core)/components/cards/StoreCard';
import { ConvenienceCode } from '@/app/ec/(core)/constants/convenience';
```

## 実装されている機能

### アカウント情報・注文データ取得
```typescript
useEffect(() => {
  const fetchAccountInfo = async () => {
    setIsAccountInfoLoading(true);
    const accountInfo = await getAccountInfo();
    if (accountInfo instanceof CustomError) {
      setIsAccountInfoLoading(false);
      return null;
    }

    const info = {
      id: accountInfo.id,
      fullName: accountInfo.full_name ?? '',
      prefecture: accountInfo.prefecture ?? '',
      city: accountInfo.city ?? '',
      address: accountInfo.address ?? '',
      address2: accountInfo.address2 ?? '',
      building: accountInfo.building ?? '',
      zipCode: accountInfo.zip_code ?? '',
    };

    setDisplayAccountInfo(info);
    setIsAccountInfoLoading(false);
    return info;
  };

  const fetchOrder = async (accountInfo: DisplayAccountInfo) => {
    setIsOrderItemsLoading(true);
    const orderData = await getCartContents();

    if (orderData?.orders && orderData.orders.length > 0) {
      // DRAFT状態の注文を1件取得（最もIDが大きいものを選択）
      const foundDraftOrder = orderData.orders
        .filter((orderItem) => orderItem.status === 'DRAFT')
        .sort((a, b) => b.id - a.id)[0];

      if (foundDraftOrder) {
        setDraftOrder(foundDraftOrder);
        setTotalAmount(foundDraftOrder.total_price || 0);
        setTotalShippingFee(foundDraftOrder.shipping_total_fee || 0);

        // 都道府県情報を更新
        if (accountInfo && accountInfo.prefecture) {
          const updatedOrderResponse = await updateOrderPrefecture(
            foundDraftOrder,
            accountInfo.prefecture,
          );
          // 更新処理...
        }
      }
    }
    setIsOrderItemsLoading(false);
  };

  const loadData = async () => {
    const accountInfo = await fetchAccountInfo();
    if (accountInfo) {
      await fetchOrder(accountInfo);
    }
  };

  loadData();
}, []);
```

### 都道府県による注文情報更新
```typescript
const updateOrderPrefecture = async (
  foundDraftOrder: DraftOrder,
  prefecture: string,
) => {
  if (!foundDraftOrder || !prefecture) {
    return null;
  }
  try {
    // カートストアの情報を準備
    const cartStores = foundDraftOrder.cart_stores.map((store) => ({
      storeId: store.store_id,
      shippingMethodId: store.shipping_method_id ?? undefined,
      products: store.products.map((product) => ({
        productId: product.product_id,
        originalItemCount: product.original_item_count,
      })),
    }));

    // カート情報を更新（都道府県を設定）
    const updatedOrder = await createOrUpdateEcOrder({
      includesShippingMethodCandidates: true,
      includesPaymentMethodCandidates: true,
      body: {
        shippingAddressPrefecture: prefecture,
        cartStores: cartStores,
      },
    });

    if (updatedOrder instanceof CustomError) {
      setAlertState({
        message: 'カート情報の更新に失敗しました',
        severity: 'error',
      });
      return null;
    }
    
    if (updatedOrder && updatedOrder.paymentMethodCandidates) {
      setPaymentMethodCandidates(updatedOrder.paymentMethodCandidates);
    }
    return updatedOrder;
  } catch (error) {
    setAlertState({
      message: 'カート情報の更新中にエラーが発生しました',
      severity: 'error',
    });
    return null;
  }
};
```

### 注文確定処理
```typescript
const handleConfirmOrder = async () => {
  if (!draftOrder || !paymentMethod) {
    setAlertState({
      message: '注文情報または支払い方法が選択されていません',
      severity: 'error',
    });
    return;
  }

  try {
    // クレジットカード決済の場合はトークンが必要
    if (paymentMethod === EcPaymentMethod.CARD && !cardToken) {
      setAlertState({
        message: 'クレジットカード情報が設定されていません',
        severity: 'error',
      });
      return;
    }

    // コンビニ決済の場合はコンビニコードが必要
    if (
      paymentMethod === EcPaymentMethod.CONVENIENCE_STORE &&
      !convenienceCode
    ) {
      setAlertState({
        message: 'コンビニエンスストアが選択されていません',
        severity: 'error',
      });
      return;
    }

    // 注文を確定する
    const result = await confirmOrder(
      draftOrder.id,
      paymentMethod,
      totalAmount,
      cardToken || undefined,
      convenienceCode || undefined,
    );

    if (result.success) {
      // クレジットカード決済でリダイレクトURLがある場合
      if (result.redirectUrl) {
        // 外部決済画面へリダイレクト
        window.location.href = result.redirectUrl;
      } else {
        // その他の決済方法または決済完了時は注文完了画面へ
        router.push(PATH.ORDER.result(draftOrder.id.toString()));
      }
    }
  } catch (error) {
    setAlertState({
      message: '注文処理中にエラーが発生しました',
      severity: 'error',
    });
  }
};
```

### 支払い方法確定処理
```typescript
const handlePaymentMethodConfirm = (
  method: EcPaymentMethod,
  cardToken?: string,
  cardLast4?: string,
  convenienceCode?: ConvenienceCode,
) => {
  setPaymentMethod(method);
  // クレジットカードの場合はトークンとカード番号下4桁を保存
  if (method === EcPaymentMethod.CARD && cardToken) {
    setCardToken(cardToken);
    setCardLast4(cardLast4 || null);
    setConvenienceCode(null);
  } else if (
    method === EcPaymentMethod.CONVENIENCE_STORE &&
    convenienceCode
  ) {
    setCardToken(null);
    setCardLast4(null);
    setConvenienceCode(convenienceCode);
  } else {
    setCardToken(null);
    setCardLast4(null);
    setConvenienceCode(null);
  }
};
```

## 状態管理

### 主要なインターフェース
```typescript
interface DisplayAccountInfo {
  id: number;
  fullName: string;
  prefecture: string;
  city: string;
  address: string;
  address2: string;
  building: string;
  zipCode: string;
}

interface DraftOrder {
  id: number;
  status: string;
  total_price: number;
  shipping_total_fee: number;
  cart_stores: Array<CartStore>;
}
```

### 主要な状態
```typescript
const [draftOrder, setDraftOrder] = useState<DraftOrder | null>(null);
const [totalAmount, setTotalAmount] = useState(0);
const [totalShippingFee, setTotalShippingFee] = useState(0);
const [displayAccountInfo, setDisplayAccountInfo] = useState<DisplayAccountInfo>({
  id: 0,
  fullName: '',
  prefecture: '',
  city: '',
  address: '',
  address2: '',
  building: '',
  zipCode: '',
});
const [isAccountInfoLoading, setIsAccountInfoLoading] = useState(true);
const [isOrderItemsLoading, setIsOrderItemsLoading] = useState(true);
const [paymentMethod, setPaymentMethod] = useState<EcPaymentMethod | null>(null);
const [cardToken, setCardToken] = useState<string | null>(null);
const [cardLast4, setCardLast4] = useState<string | null>(null);
const [convenienceCode, setConvenienceCode] = useState<ConvenienceCode | null>(null);
const [paymentMethodCandidates, setPaymentMethodCandidates] = useState<EcPaymentMethod[]>([]);
```

## UI/UX の特徴

### 進行状況表示
```typescript
<Box sx={{ display: 'flex', alignItems: 'center', p: 0, mb: 1 }}>
  <StatusIcon current={2} total={3} />
  <Typography variant="h2" color="gray" sx={{ ml: 1, mr: 'auto' }}>
    ご注文内容の確認
  </Typography>
</Box>
```

### 注文確定ボタン
```typescript
<Button
  variant="contained"
  color="primary"
  size="small"
  sx={{ width: '100%', maxWidth: '350px' }}
  onClick={handleConfirmOrder}
  disabled={
    !draftOrder?.cart_stores?.length || !paymentMethod || isProcessing
  }
>
  {isProcessing ? '処理中...' : '注文を確定する'}
</Button>
```

### 価格表示セクション
```typescript
<Paper sx={{ p: 2, mb: 2 }}>
  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
    <Typography variant="body2">商品の小計</Typography>
    <Typography variant="body2">
      {(totalAmount - totalShippingFee).toLocaleString()}円
    </Typography>
  </Box>
  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
    <Typography variant="body2">送料</Typography>
    <Typography variant="body2">
      {totalShippingFee.toLocaleString()}円
    </Typography>
  </Box>
  <Divider sx={{ my: 1 }} />
  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
    <Typography variant="body2">ご請求額</Typography>
    <Typography variant="body2">
      {totalAmount.toLocaleString()}円
    </Typography>
  </Box>
</Paper>
```

### お届け先表示
```typescript
<Paper sx={{ p: 2, mb: 2 }}>
  <Box>
    <Typography variant="body1" sx={{ mb: 1 }}>
      お届け先
    </Typography>
    <Box sx={{ mb: 1 }}>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {/* 郵便番号がハイフンがある場合はそのまま表示、ない場合はハイフンを追加 */}
        {displayAccountInfo.zipCode.includes('-')
          ? displayAccountInfo.zipCode
          : displayAccountInfo.zipCode.slice(0, 3) +
            '-' +
            displayAccountInfo.zipCode.slice(3)}
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {displayAccountInfo.prefecture} {displayAccountInfo.city}{' '}
        {displayAccountInfo.address2} {displayAccountInfo.building}
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {displayAccountInfo.fullName}
      </Typography>
    </Box>
  </Box>
</Paper>
```

## 使用している依存関係

### フック・ユーティリティ
- **useAppAuth**: アカウント情報取得（getAccountInfo）
- **useEcOrder**: 注文データ取得・更新（getCartContents, createOrUpdateEcOrder）
- **useEcPayment**: 決済処理（confirmOrder, isProcessing）
- **useAlert**: アラート表示管理
- **useRouter**: ページ遷移

### コンポーネント
- **StatusIcon**: 進行状況表示
- **PaymentMethodManager**: 支払い方法選択
- **StoreCard**: 店舗別商品表示

### Material-UI コンポーネント
- **Container/Box/Paper**: レイアウト
- **Typography**: テキスト表示
- **Button**: アクションボタン
- **Divider**: 区切り線
- **CircularProgress**: ローディング表示

## 技術実装の特徴

### 複雑な注文データ統合
- **DRAFT注文の取得**: 最新のDRAFT状態注文を取得
- **配送方法の自動選択**: 最安配送方法の自動適用
- **都道府県による更新**: 配送先に応じた配送方法・料金更新
- **支払い方法候補**: 利用可能な支払い方法の動的取得

### エラーハンドリング
```typescript
if (updatedOrder instanceof CustomError) {
  setAlertState({
    message: 'カート情報の更新に失敗しました',
    severity: 'error',
  });
  return null;
}
```

### 決済方法別処理
- **クレジットカード**: トークン化による安全決済
- **コンビニ決済**: コンビニコード管理
- **その他決済**: 各決済方法の個別処理

### 状態の複雑な管理
- **ローディング状態**: アカウント情報・注文情報の個別管理
- **決済状態**: 決済方法・トークン・処理状況の統合管理
- **エラー状態**: 各処理段階でのエラー管理

## ディレクトリ構造
```
packages/web-app/src/app/ec/(auth)/order/
├── page.tsx                    # 注文確認・決済画面（578行）
├── contact/                    # 注文問い合わせ
├── history/                    # 注文履歴
└── result/                     # 注文結果
```

## 関連ディレクトリ
- `contact/`: 注文問い合わせ機能
- `history/`: 注文履歴確認
- `result/`: 注文完了・結果表示
- `../(core)/hooks/`: useEcOrder, useEcPayment
- `../(core)/feature/order/`: PaymentMethodManager
- `../(core)/components/`: StatusIcon, StoreCard
- `/providers/`: useAppAuth

## 開発ノート
- **複雑な状態管理**: 注文・決済・配送・アカウント情報の統合管理
- **非同期処理**: 複数APIの順次・並列処理
- **エラーハンドリング**: CustomError による統一されたエラー処理
- **UX設計**: ローディング・エラー・成功状態の適切な表示
- **決済セキュリティ**: トークン化による安全な決済処理
- **パフォーマンス**: 必要最小限のAPI呼び出し最適化

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 