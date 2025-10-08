# EC Account Signup - アカウント新規登録システム

## 概要
**ディレクトリ**: `packages/web-app/src/app/ec/account/signup/`
**構成**: 登録画面 + 確認画面の2段階構成
**機能**: 新規会員登録（メール・パスワード）
**フロー**: 入力画面 → 確認画面 → 注文画面

## 実装ファイル

### 1. 登録画面 (`page.tsx` - 178行)
```typescript
'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

export const signupSchema = z
  .object({
    email: z.string().email('有効なメールアドレスを入力してください'),
    password: z.string().min(8, 'パスワードは8文字以上必要です'),
    confirmPassword: z.string().min(1, 'パスワード(確認)は必須です'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;
```

### 2. 確認画面 (`confirm/page.tsx` - 158行)
```typescript
'use client';

import { useEffect, useState } from 'react';
import { UserRegisterInfo } from '@/app/ec/(core)/utils/validateUserInfo';
import { useAppAuth } from '@/providers/useAppAuth';

export default function SignupConfirmPage() {
  const [userData, setUserData] = useState<UserRegisterInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAppAuth();
  
  // セッションストレージから登録データを復元
  useEffect(() => {
    const storedUserData = sessionStorage.getItem('userData');
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData) as UserRegisterInfo;
        setUserData(parsedData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);
}
```

## 主要機能

### 1. バリデーション機能
```typescript
// Zod スキーマによる厳密なバリデーション
export const signupSchema = z
  .object({
    email: z.string().email('有効なメールアドレスを入力してください'),
    password: z.string().min(8, 'パスワードは8文字以上必要です'),
    confirmPassword: z.string().min(1, 'パスワード(確認)は必須です'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  });
```

### 2. リアルタイムバリデーション
```typescript
const methods = useForm<SignupFormData>({
  resolver: zodResolver(signupSchema),
  defaultValues: {
    email: '',
    password: '',
    confirmPassword: '',
  },
  mode: 'onBlur',        // フォーカスアウト時にバリデーション
  reValidateMode: 'onChange', // 変更時に再バリデーション
});
```

### 3. セッションストレージ管理
```typescript
// 入力画面 → 確認画面
const onSubmit = (data: SignupFormData) => {
  sessionStorage.setItem('userData', JSON.stringify(data));
  router.push(PATH.ACCOUNT.signupConfirm);
};

// 確認画面 → 登録実行
const handleConfirm = async () => {
  try {
    const result = await signUp({
      email: userData.email,
      password: userData.password,
    });

    if (result && 'ok' in result) {
      sessionStorage.removeItem('userData');
      router.push('/ec/order');
    }
  } catch (error) {
    console.error('Error registering user:', error);
  }
};
```

## 技術実装

### フォーム管理
```typescript
// React Hook Form + Zod の完全統合
const {
  register,
  handleSubmit,
  formState: { errors },
} = methods;

// エラーメッセージの動的表示
<ErrorMessage
  errors={errors}
  name="email"
  render={({ message }) => (
    <FormHelperText error>{message}</FormHelperText>
  )}
/>
```

### 型安全性
```typescript
// validateUserInfo.ts からの型定義
export type UserRegisterInfo = z.infer<typeof signupSchema>;

// 登録データの型
interface UserRegisterInfo {
  email: string;
  password: string;
  confirmPassword: string;
}
```

### 状態管理
```typescript
// 登録画面の状態
const [loading, setLoading] = useState(false);

// 確認画面の状態
const [userData, setUserData] = useState<UserRegisterInfo | null>(null);
const [loading, setLoading] = useState(false);
```

## UI/UX設計

### 登録画面レイアウト
```typescript
<Container maxWidth="sm" sx={{ py: 1 }}>
  <Typography variant="h5" component="h1" align="center">
    新規アカウント登録
  </Typography>
  
  <Paper elevation={2} sx={{ p: 3, borderRadius: '8px' }}>
    <FormProvider {...methods}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          {/* メールアドレス入力 */}
          <Box>
            <Typography variant="body1">メールアドレス</Typography>
            <TextField
              {...register('email')}
              type="email"
              error={!!errors.email}
            />
            <ErrorMessage errors={errors} name="email" />
          </Box>
          
          {/* パスワード入力 */}
          <Box>
            <Typography variant="body1">パスワード</Typography>
            <TextField
              {...register('password')}
              type="password"
              error={!!errors.password}
            />
            <ErrorMessage errors={errors} name="password" />
          </Box>
          
          {/* パスワード確認 */}
          <Box>
            <Typography variant="body1">パスワード（確認）</Typography>
            <TextField
              {...register('confirmPassword')}
              type="password"
              error={!!errors.confirmPassword}
            />
            <ErrorMessage errors={errors} name="confirmPassword" />
          </Box>
          
          {/* 送信ボタン */}
          <Button
            type="submit"
            variant="contained"
            sx={{ bgcolor: '#c34646' }}
          >
            入力内容を確認
          </Button>
        </Stack>
      </Box>
    </FormProvider>
  </Paper>
</Container>
```

### 確認画面レイアウト
```typescript
<Container maxWidth="sm" sx={{ py: 1 }}>
  <Typography variant="h5" component="h1" align="center">
    入力内容の確認
  </Typography>
  
  <Paper elevation={2} sx={{ p: 3, borderRadius: '8px' }}>
    <Stack spacing={2}>
      {/* メールアドレス表示 */}
      <Box>
        <Typography variant="subtitle1" fontWeight="bold">
          メールアドレス
        </Typography>
        <Typography variant="body1">{userData.email}</Typography>
      </Box>
      
      {/* パスワード表示（マスク） */}
      <Box>
        <Typography variant="subtitle1" fontWeight="bold">
          パスワード
        </Typography>
        <Typography variant="body1">********</Typography>
      </Box>
      
      {/* アクションボタン */}
      <Stack direction="row" spacing={2}>
        <Button
          onClick={handleBack}
          variant="outlined"
          sx={{ color: '#c34646', borderColor: '#c34646' }}
        >
          戻る
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          sx={{ bgcolor: '#c34646' }}
          disabled={loading}
        >
          {loading ? '処理中...' : '会員登録を完了する'}
        </Button>
      </Stack>
    </Stack>
  </Paper>
</Container>
```

## エラーハンドリング

### バリデーションエラー
```typescript
// メールアドレス形式チェック
email: z.string().email('有効なメールアドレスを入力してください'),

// パスワード長チェック
password: z.string().min(8, 'パスワードは8文字以上必要です'),

// パスワード一致チェック
.refine((data) => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword'],
});
```

### 登録エラー
```typescript
// API エラー処理
try {
  const result = await signUp({
    email: userData.email,
    password: userData.password,
  });

  if (result && 'ok' in result) {
    // 成功処理
  } else {
    alert('会員登録に失敗しました。');
  }
} catch (error) {
  console.error('Error registering user:', error);
  alert('エラーが発生しました。');
}
```

### データ不在エラー
```typescript
// 確認画面でのデータ不在処理
if (!userData) {
  return (
    <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
      <Paper elevation={2} sx={{ p: 2, borderRadius: '8px' }}>
        会員登録画面から情報を入力し直してください
        <Button onClick={handleBack} variant="outlined">
          戻る
        </Button>
      </Paper>
    </Container>
  );
}
```

## セキュリティ機能

### パスワード検証
```typescript
// 最小8文字の要求
password: z.string().min(8, 'パスワードは8文字以上必要です'),

// 確認パスワードとの一致チェック
.refine((data) => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword'],
});
```

### セッションストレージ管理
```typescript
// 登録完了後のクリーンアップ
if (result && 'ok' in result) {
  sessionStorage.removeItem('userData'); // 一時データ削除
  router.push('/ec/order');
}
```

### 入力データの型チェック
```typescript
// 厳密な型チェック
try {
  const parsedData = JSON.parse(storedUserData) as UserRegisterInfo;
  setUserData(parsedData);
} catch (error) {
  console.error('Error parsing user data:', error);
}
```

## データフロー

### 1. 入力 → 確認
```
登録画面 → Zod バリデーション → sessionStorage保存 → 確認画面
```

### 2. 確認 → 登録
```
確認画面 → signUp API → 成功時 → sessionStorage削除 → 注文画面
```

### 3. エラー処理
```
バリデーションエラー → 入力画面にエラー表示
API エラー → alert表示 → 確認画面に留まる
```

## 依存関係

### 外部ライブラリ
- **React Hook Form**: フォーム管理
- **Zod**: スキーマバリデーション
- **@hookform/resolvers**: React Hook Form + Zod統合
- **@hookform/error-message**: エラーメッセージ表示
- **Material-UI**: UI コンポーネント
- **Next.js**: ルーティング

### 内部モジュール
- **useAppAuth**: 認証管理フック
- **validateUserInfo**: 型定義
- **PATH**: パス定数

## 使用されるAPI

### signUp
```typescript
// useAppAuth フックから提供される登録機能
const result = await signUp({
  email: userData.email,
  password: userData.password,
});
```

## パス定義

### 関連パス
```typescript
// packages/web-app/src/app/ec/(core)/constants/paths.ts
export const PATH = {
  ACCOUNT: {
    signup: `${BASE_PATH}/account/signup`,           // '/ec/account/signup'
    signupConfirm: `${BASE_PATH}/account/signup/confirm`, // '/ec/account/signup/confirm'
  },
};
```

## 関連ファイル

### 前段階
- **ログイン画面**: `/ec/login` → 新規登録リンク

### 後段階
- **成功時**: `/ec/order` (注文画面)
- **失敗時**: 確認画面に留まる

### 共通モジュール
- `@/providers/useAppAuth`: 認証管理
- `@/app/ec/(core)/utils/validateUserInfo`: 型定義
- `@/app/ec/(core)/constants/paths`: パス定数

## 開発ノート

### フォーム設計の特徴
```typescript
// リアルタイムバリデーション
mode: 'onBlur',         // フォーカスアウト時
reValidateMode: 'onChange', // 変更時に再検証
```

### エラー表示の統一
```typescript
// 動的エラー色変更
sx={{
  color: errors.email ? 'error.main' : 'inherit',
}}
```

### パスワード表示の配慮
```typescript
// 確認画面でのパスワードマスク
<Typography variant="body1">********</Typography>
```

---
*生成: 2025-01-24 | 項目53: EC Account Signup* 