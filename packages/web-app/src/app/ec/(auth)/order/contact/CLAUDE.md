# EC Auth Order Contact - 注文問い合わせ

## 目的
ECサイトで顧客が特定の注文に関する問い合わせを作成・送信する機能

## 機能概要
- **問い合わせフォーム**: 注文に関する問い合わせの入力・送信
- **問い合わせ種別選択**: 注文内容・配送・支払い等の分類選択
- **セッション管理**: 入力内容の一時保存・復元
- **バリデーション**: 入力内容の検証・エラー表示

## 実装されているファイル

### 1. [orderId]/page.tsx (249行) - 注文問い合わせフォーム
```typescript
'use client';

import { useForm, FormProvider, Controller } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  FormHelperText,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { PATH } from '@/app/ec/(core)/constants/paths';
import { useEffect } from 'react';
```

## 実装されている機能

### バリデーションスキーマ定義
```typescript
export const contactSchema = z.object({
  orderNumber: z.string().min(1, 'ご注文番号は必須です'),
  kind: z.string().min(1, 'お問い合わせの種類は必須です'),
  title: z.string().min(1, '件名は必須です'),
  content: z.string().min(1, 'お問い合わせ内容は必須です'),
});

export type ContactFormData = z.infer<typeof contactSchema>;
```

### 問い合わせ種別定義
```typescript
export const kinds = [
  { value: 'order', label: '注文内容について' },
  { value: 'delivery', label: '配送について' },
  { value: 'payment', label: '支払いについて' },
  { value: 'other', label: 'その他' },
];
```

### フォーム初期化・管理
```typescript
const methods = useForm<ContactFormData>({
  resolver: zodResolver(contactSchema),
  defaultValues: {
    orderNumber: orderId,
    kind: '',
    title: '',
    content: '',
  },
  mode: 'onBlur',
  reValidateMode: 'onChange',
});

const {
  control,
  handleSubmit,
  formState: { errors },
  reset,
} = methods;
```

### セッションデータ管理
```typescript
// セッションデータの読み込み
useEffect(() => {
  const savedData = sessionStorage.getItem('contactData');
  if (savedData) {
    const parsedData = JSON.parse(savedData);
    reset(parsedData);
  }
}, [reset]);

const onSubmit = (data: ContactFormData) => {
  sessionStorage.setItem('contactData', JSON.stringify(data));
  router.push(PATH.ORDER.contactConfirm(orderId));
};
```

### 注文番号フィールド（無効化）
```typescript
<Box>
  <Typography
    variant="body1"
    sx={{
      mb: 1,
      color: errors.orderNumber ? 'error.main' : 'inherit',
    }}
  >
    ご注文番号
  </Typography>
  <Controller
    name="orderNumber"
    control={control}
    render={({ field }) => (
      <TextField
        {...field}
        disabled
        fullWidth
        size="small"
        variant="outlined"
        error={!!errors.orderNumber}
      />
    )}
  />
  <ErrorMessage
    errors={errors}
    name="orderNumber"
    render={({ message }) => (
      <FormHelperText error>{message}</FormHelperText>
    )}
  />
</Box>
```

### 問い合わせ種別選択
```typescript
<Box>
  <Typography
    variant="body1"
    sx={{
      mb: 1,
      color: errors.kind ? 'error.main' : 'inherit',
    }}
  >
    お問い合わせの種類
  </Typography>
  <Controller
    name="kind"
    control={control}
    render={({ field }) => (
      <FormControl fullWidth error={!!errors.kind}>
        <Select {...field} size="small" displayEmpty>
          <MenuItem value="" disabled>
            選択してください
          </MenuItem>
          {kinds.map((kind) => (
            <MenuItem key={kind.value} value={kind.value}>
              {kind.label}
            </MenuItem>
          ))}
        </Select>
        <ErrorMessage
          errors={errors}
          name="kind"
          render={({ message }) => (
            <FormHelperText error>{message}</FormHelperText>
          )}
        />
      </FormControl>
    )}
  />
</Box>
```

### 件名入力フィールド
```typescript
<Box>
  <Typography
    variant="body1"
    sx={{
      mb: 1,
      color: errors.title ? 'error.main' : 'inherit',
    }}
  >
    件名
  </Typography>
  <Controller
    name="title"
    control={control}
    render={({ field }) => (
      <TextField
        {...field}
        fullWidth
        size="small"
        variant="outlined"
        error={!!errors.title}
      />
    )}
  />
  <ErrorMessage
    errors={errors}
    name="title"
    render={({ message }) => (
      <FormHelperText error>{message}</FormHelperText>
    )}
  />
</Box>
```

### 問い合わせ内容入力フィールド
```typescript
<Box>
  <Typography
    variant="body1"
    sx={{
      mb: 1,
      color: errors.content ? 'error.main' : 'inherit',
    }}
  >
    お問い合わせ内容
  </Typography>
  <Controller
    name="content"
    control={control}
    render={({ field }) => (
      <TextField
        {...field}
        fullWidth
        multiline
        rows={10}
        size="small"
        variant="outlined"
        error={!!errors.content}
      />
    )}
  />
  <ErrorMessage
    errors={errors}
    name="content"
    render={({ message }) => (
      <FormHelperText error>{message}</FormHelperText>
    )}
  />
</Box>
```

### 送信ボタン
```typescript
<Box sx={{ mt: 2 }}>
  <Button
    type="submit"
    fullWidth
    variant="contained"
    sx={{
      mt: 1,
      mb: 2,
      py: 1.5,
    }}
  >
    入力内容を確認
  </Button>
</Box>
```

## 技術実装の特徴

### React Hook Form 統合
- **zodResolver**: Zod スキーマによるバリデーション
- **Controller**: Material-UI コンポーネントとの統合
- **FormProvider**: フォームコンテキストの提供
- **ErrorMessage**: 統一されたエラー表示

### バリデーション設定
```typescript
mode: 'onBlur',
reValidateMode: 'onChange',
```

### 動的パラメータ処理
```typescript
const params = useParams();
const orderId = params.orderId as string;

// 注文番号を初期値として設定
defaultValues: {
  orderNumber: orderId,
  // ...
},
```

### セッションストレージ活用
- **データ永続化**: ページ遷移時のデータ保持
- **復元機能**: ページ再読み込み時のデータ復元
- **JSON形式**: 構造化データの保存

## UI/UX の特徴

### レスポンシブデザイン
```typescript
<Container maxWidth="sm" sx={{ py: 1 }}>
  <Paper elevation={2} sx={{ p: 3, borderRadius: '8px' }}>
    {/* フォーム内容 */}
  </Paper>
</Container>
```

### エラー状態の視覚的表現
```typescript
sx={{
  mb: 1,
  color: errors.orderNumber ? 'error.main' : 'inherit',
}}
```

### 統一されたフィールドレイアウト
- **Typography**: ラベル表示
- **Controller**: フィールド制御
- **ErrorMessage**: エラーメッセージ表示
- **FormHelperText**: ヘルプテキスト

### マルチライン対応
```typescript
<TextField
  {...field}
  fullWidth
  multiline
  rows={10}
  size="small"
  variant="outlined"
  error={!!errors.content}
/>
```

## 使用している依存関係

### フォーム管理
- **react-hook-form**: フォーム状態管理
- **@hookform/resolvers/zod**: Zod バリデーション統合
- **@hookform/error-message**: エラーメッセージ表示

### バリデーション
- **zod**: スキーマ検証ライブラリ

### Material-UI コンポーネント
- **Container/Box/Paper**: レイアウト
- **Typography**: テキスト表示
- **TextField**: テキスト入力
- **Select/MenuItem**: 選択肢表示
- **Button**: 送信ボタン
- **FormControl/FormHelperText**: フォーム制御

### Next.js
- **useParams**: 動的パラメータ取得
- **useRouter**: ページ遷移

## ディレクトリ構造
```
packages/web-app/src/app/ec/(auth)/order/contact/
├── CLAUDE.md                   # このファイル
└── [orderId]/                  # 動的ルーティング
    ├── page.tsx                # 問い合わせフォーム（249行）
    ├── confirm/                # 確認画面
    └── result/                 # 送信完了画面
```

## データフロー
1. **パラメータ取得**: URL から orderId を取得
2. **フォーム初期化**: 注文番号をデフォルト値として設定
3. **セッション復元**: 保存されたデータがあれば復元
4. **入力・バリデーション**: リアルタイムバリデーション
5. **データ保存**: セッションストレージに保存
6. **確認画面遷移**: 確認画面へリダイレクト

## 関連ディレクトリ
- `confirm/`: 問い合わせ確認画面
- `result/`: 問い合わせ送信完了画面
- `../`: 注文管理メイン
- `../../`: 認証機能グループ
- `../(core)/constants/`: パス定数
- `../(core)/hooks/`: 問い合わせ関連フック

## 開発ノート
- **型安全性**: TypeScript + Zod による厳密な型検証
- **UX設計**: セッション管理による入力内容保持
- **バリデーション**: リアルタイム検証によるユーザビリティ向上
- **エラーハンドリング**: 統一されたエラー表示パターン
- **レスポンシブ**: モバイルファーストデザイン
- **アクセシビリティ**: 適切なラベル・エラーメッセージ表示

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 