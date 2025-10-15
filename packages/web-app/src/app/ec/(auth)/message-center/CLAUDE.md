# EC Auth Message Center - メッセージセンター

## 目的
ECサイトで顧客が注文に関するメッセージ・問い合わせを管理・確認する機能

## 機能概要
- **メッセージ一覧**: 注文に関するメッセージ・問い合わせの一覧表示
- **新着表示**: 未読メッセージの新着表示・管理
- **詳細確認**: 個別メッセージの詳細確認・回答表示
- **問い合わせ管理**: 注文問い合わせの統合管理

## 実装されているファイル

### 1. page.tsx (205行) - メッセージセンター一覧
```typescript
'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  Paper,
  ListItem,
  Button,
  Chip,
  Container,
  CircularProgress,
} from '@mui/material';
import { PATH } from '@/app/ec/(core)/constants/paths';
import { useRouter } from 'next/navigation';
import { useEcOrderContact } from '@/app/ec/(core)/hooks/useEcOrderContact';
import {
  MessageSummary,
  isValidOrderContactResponse,
  transformEcOrderContact,
} from '@/app/ec/(core)/utils/transformEcOrderContact';
import { getOrderContactKindValue } from '@/app/ec/(core)/constants/orderContactKInd';
import MessageIcon from '@mui/icons-material/Message';
```

## 実装されている機能

### メッセージ一覧表示
```typescript
const MessageCenter = () => {
  const [messages, setMessages] = useState<MessageSummary[]>();
  const [loading, setLoading] = useState(false);
  const { getOrderContact } = useEcOrderContact();

  useEffect(() => {
    const fetchOrderContacts = async () => {
      setLoading(true);
      try {
        const orderContacts = await getOrderContact(undefined, {
          includesMessages: true,
        });

        if (isValidOrderContactResponse(orderContacts)) {
          const convertedMessages = orderContacts.ecOrderContacts.map(
            transformEcOrderContact,
          );
          setMessages(convertedMessages);
        }
      } catch (error) {
        console.error('メッセージの取得に失敗しました', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderContacts();
  }, [getOrderContact]);
```

### 新着メッセージ表示
```typescript
{message.isRead && (
  <Chip
    label="新着"
    size="small"
    sx={{
      bgcolor: '#d32f2f',
      color: 'white',
      fontSize: '0.75rem',
      height: 24,
      mr: 1,
      borderRadius: 0.5,
    }}
  />
)}
```

### 空状態表示
```typescript
if (!messages) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        p: 3,
      }}
    >
      <MessageIcon sx={{ fontSize: 60, color: 'grey.600', mb: 1 }} />
      <Typography variant="body2" color="grey.600" align="center">
        メッセージが見つかりません
      </Typography>
      <Typography variant="body2" color="grey.600" align="center">
        新しいメッセージが届くとここに表示されます
      </Typography>
    </Box>
  );
}
```

### メッセージカード表示
```typescript
{messages.map((message) => (
  <Paper
    key={message.id}
    sx={{
      mb: 2,
      borderRadius: 1,
      overflow: 'hidden',
    }}
  >
    <ListItem
      alignItems="flex-start"
      sx={{
        flexDirection: 'column',
        p: 2,
        pb: 1.5,
      }}
    >
      <Box
        sx={{
          width: '100%',
          mb: 1,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography
            variant="body2"
            component="span"
            fontWeight="bold"
          >
            ご注文番号#{message.id}
          </Typography>
          <Typography variant="body2">{message.shopName}</Typography>
          <Typography variant="body2" color="grey.600">
            {message.lastUpdate}
          </Typography>
          <Typography variant="body2" color="grey.600">
            {getOrderContactKindValue(message.kind)}
          </Typography>
        </Box>
        <Box sx={{ width: '100px', mt: 'auto' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleViewDetails(message.id)}
            sx={{
              borderRadius: 2,
              px: 1.5,
              fontSize: '0.75rem',
              borderColor: '#ddd',
              color: '#333',
              '&:hover': {
                borderColor: '#bbb',
                bgcolor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            詳細を見る
          </Button>
        </Box>
      </Box>
    </ListItem>
  </Paper>
))}
```

## ディレクトリ構造
```
packages/web-app/src/app/ec/(auth)/message-center/
├── page.tsx                    # メッセージセンター一覧（205行）
└── [id]/                       # 個別メッセージ詳細
    └── page.tsx                # メッセージ詳細画面
```

## 使用している依存関係

### フック・ユーティリティ
- **useEcOrderContact**: 注文問い合わせデータ取得
- **transformEcOrderContact**: 注文問い合わせデータ変換
- **isValidOrderContactResponse**: レスポンス検証
- **getOrderContactKindValue**: 問い合わせ種別表示

### Material-UI コンポーネント
- **Box**: レイアウト・コンテナ
- **Typography**: テキスト表示
- **List/ListItem**: リスト表示
- **Paper**: カード表示
- **Button**: 詳細確認ボタン
- **Chip**: 新着表示
- **Container**: 中央配置
- **CircularProgress**: ローディング表示

## 技術実装の特徴

### 状態管理
```typescript
const [messages, setMessages] = useState<MessageSummary[]>();
const [loading, setLoading] = useState(false);
```

### データ取得・変換
```typescript
const orderContacts = await getOrderContact(undefined, {
  includesMessages: true,
});

if (isValidOrderContactResponse(orderContacts)) {
  const convertedMessages = orderContacts.ecOrderContacts.map(
    transformEcOrderContact,
  );
  setMessages(convertedMessages);
}
```

### エラーハンドリング
```typescript
try {
  // データ取得処理
} catch (error) {
  console.error('メッセージの取得に失敗しました', error);
} finally {
  setLoading(false);
}
```

### ナビゲーション
```typescript
const handleViewDetails = (id: string) => {
  router.push(PATH.MESSAGE_CENTER.detail(id));
};
```

## UI/UX の特徴

### レスポンシブデザイン
- **モバイルファースト**: 小画面での最適化
- **フレックスレイアウト**: 柔軟なレイアウト
- **適切な余白**: p: 2, mb: 2 等の統一された余白

### 視覚的フィードバック
- **新着表示**: 赤色チップでの新着メッセージ表示
- **ローディング**: CircularProgress での読み込み表示
- **空状態**: メッセージアイコンでの空状態表示

### インタラクション
- **ホバー効果**: ボタンのホバー時の色変化
- **詳細確認**: 個別メッセージへの遷移

## 使用パターン

### 初期化・データ取得
```typescript
useEffect(() => {
  const fetchOrderContacts = async () => {
    // データ取得処理
  };
  fetchOrderContacts();
}, [getOrderContact]);
```

### 条件分岐表示
```typescript
if (loading) return <CircularProgress />;
if (!messages) return <EmptyState />;
return <MessageList />;
```

## 関連ディレクトリ
- `../`: 認証機能グループ
- `../(core)/hooks/`: useEcOrderContact
- `../(core)/utils/`: transformEcOrderContact
- `../(core)/constants/`: パス定数・問い合わせ種別
- `[id]/`: 個別メッセージ詳細

## 開発ノート
- **型安全性**: TypeScript による MessageSummary 型
- **非同期処理**: async/await による適切な非同期処理
- **エラーハンドリング**: try-catch による統一されたエラー処理
- **UX設計**: ローディング・空状態・エラー状態の適切な表示
- **Material-UI**: 統一されたデザインシステム
- **パフォーマンス**: useEffect の依存関係最適化

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 