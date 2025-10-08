# EC Account - ECアカウント管理システム

## 目的
ECサイトの顧客アカウント登録・編集・プロフィール管理を行う包括的な機能群を提供し、ユーザー情報の完全性と利便性を確保

## 機能概要
- **新規登録**: 新規顧客のアカウント作成（signup/）
- **プロフィール編集**: 既存顧客の情報更新（edit/）
- **確認機能**: 登録・編集内容の2段階確認システム
- **バリデーション**: React Hook Form + Zodによる厳密な入力検証
- **住所自動入力**: 郵便番号による住所自動補完機能
- **セッション管理**: ページ間のデータ永続化

## 内容概要
```
packages/web-app/src/app/ec/account/
├── CLAUDE.md              # 本ドキュメント
├── edit/                  # プロフィール編集機能
│   ├── page.tsx           # アカウント編集フォーム（570行）
│   └── confirm/           # 編集内容確認
│       └── page.tsx       # 編集確認画面（214行）
└── signup/                # 新規登録機能
    ├── page.tsx           # 新規登録フォーム（177行）
    └── confirm/           # 登録内容確認
        └── page.tsx       # 登録確認画面（157行）
```

## 重要ファイル
- `edit/page.tsx`: アカウント編集フォーム - 570行の大規模フォーム実装
- `edit/confirm/page.tsx`: 編集確認画面 - 214行の確認・更新処理
- `signup/page.tsx`: 新規登録フォーム - 177行のシンプル登録フォーム
- `signup/confirm/page.tsx`: 登録確認画面 - 157行の確認・登録処理

## 主要機能実装

### 1. アカウント編集フォーム（570行）
```typescript
// React Hook Form + Zod による堅牢なフォーム管理
export const editAccountSchema = z.object({
  displayName: z.string().min(1, '表示名は必須です'),
  fullName: z.string().min(1, 'お名前は必須です'),
  fullNameRuby: z.string().min(1, 'フリガナは必須です'),
  birthday: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '正しい形式で入力してください (YYYY-MM-DD)')
    .refine((date) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
      const inputDate = new Date(date);
      const currentDate = new Date();
      return !isNaN(inputDate.getTime()) && inputDate < currentDate;
    }, '生年月日は現在より過去の日付を入力してください'),
  phoneNumber: z
    .string()
    .regex(/^\d{10,11}$/, '電話番号は10桁または11桁の数字を入力してください'),
  mail: z.string().email('有効なメールアドレスを入力してください'),
  zipCode: z
    .string()
    .regex(/^\d{3}-?\d{4}$|^\d{7}$/, '郵便番号は7桁の数字を入力してください'),
  prefecture: z.string().min(1, '都道府県は必須です'),
  city: z.string().min(1, '市区町村は必須です'),
  address2: z.string().min(1, '住所は必須です'),
  building: z.string().optional(),
});

type EditAccountFormData = z.infer<typeof editAccountSchema>;
```

### 2. アカウント情報取得・初期化
```typescript
// 既存アカウント情報の取得・フォーム初期化
useEffect(() => {
  const fetchAccountInfo = async () => {
    try {
      setIsLoading(true);
      const userData = await getAccountInfo();

      if (userData && !(userData instanceof CustomError)) {
        const formattedData = {
          displayName: userData.display_name || '',
          fullName: userData.full_name || '',
          fullNameRuby: userData.full_name_ruby || '',
          birthday: userData.birthday || '',
          phoneNumber: userData.phone_number || '',
          mail: userData.mail || '',
          zipCode: userData.zip_code || '',
          prefecture: userData.prefecture || '',
          city: userData.city || '',
          address2: userData.address2 || '',
          building: userData.building || '',
        };

        setDefaultValues(formattedData);
        reset(formattedData);
      }
    } catch (error) {
      setIsUserData(false);
      console.error('アカウント情報の取得に失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  };

  fetchAccountInfo();
}, [getAccountInfo, reset]);
```

### 3. 住所自動入力機能
```typescript
// 郵便番号による住所自動補完
const watchZipCode = watch('zipCode');
const { address, handleAddressSearch } = useAddressSearch(
  watchZipCode?.replace(/-/g, '') || '',
);

// 郵便番号入力時の自動住所検索
useEffect(() => {
  if (watchZipCode && watchZipCode.replace(/-/g, '').length === 7) {
    handleAddressSearch();
  }
}, [watchZipCode, handleAddressSearch]);

// 住所フィールドの自動設定
useEffect(() => {
  if (address.prefecture) {
    setValue('prefecture', address.prefecture);
  }
  if (address.city) {
    setValue('city', address.city);
  }
  if (address.address2) {
    setValue('address2', address.address2);
  }
}, [address, setValue]);
```

### 4. 自動フォーマット入力処理
```typescript
// 生年月日の自動フォーマット（YYYY-MM-DD）
<TextField
  {...register('birthday', {
    onChange: (e) => {
      let value = e.target.value.replace(/[^\d]/g, '');
      if (value.length > 4) {
        value = `${value.substring(0, 4)}-${value.substring(4)}`;
      }
      if (value.length > 7) {
        value = `${value.substring(0, 7)}-${value.substring(7)}`;
      }
      if (value.length > 10) {
        value = value.substring(0, 10);
      }
      e.target.value = value;
    },
  })}
  fullWidth
  placeholder="YYYY-MM-DD"
  size="small"
  variant="outlined"
  error={!!errors.birthday}
  inputProps={{
    maxLength: 10,
    inputMode: 'numeric',
  }}
/>

// 郵便番号の自動フォーマット（123-4567）
<TextField
  {...register('zipCode', {
    onChange: (e) => {
      let value = e.target.value.replace(/[^\d]/g, '');
      if (value.length > 3) {
        value = `${value.substring(0, 3)}-${value.substring(3)}`;
      }
      if (value.length > 8) {
        value = value.substring(0, 8);
      }
      e.target.value = value;
    },
  })}
  fullWidth
  placeholder="123-4567"
  size="small"
  variant="outlined"
  error={!!errors.zipCode}
  inputProps={{
    maxLength: 8,
    inputMode: 'numeric',
  }}
/>

// 電話番号の数字のみ入力制限
<TextField
  {...register('phoneNumber', {
    onChange: (e) => {
      const value = e.target.value.replace(/[^\d]/g, '');
      e.target.value = value;
    },
  })}
  fullWidth
  size="small"
  variant="outlined"
  error={!!errors.phoneNumber}
  inputProps={{
    maxLength: 11,
    inputMode: 'numeric',
  }}
/>
```

### 5. 新規登録機能（177行）
```typescript
// 新規登録スキーマ
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

// 新規登録フォーム処理
const onSubmit = (data: SignupFormData) => {
  const userData: UserRegisterInfo = {
    email: data.email,
    password: data.password,
  };
  
  sessionStorage.setItem('userData', JSON.stringify(userData));
  router.push(PATH.ACCOUNT.signupConfirm);
};
```

### 6. 確認・登録処理
```typescript
// 新規登録確認・実行（signup/confirm/）
const handleConfirm = async () => {
  if (!userData) return;

  setLoading(true);

  try {
    const result = await signUp({
      email: userData.email,
      password: userData.password,
    });

    if (result && 'ok' in result) {
      sessionStorage.removeItem('userData');
      router.push('/ec/order');
    } else {
      setLoading(false);
      alert('会員登録に失敗しました。');
    }
  } catch (error) {
    console.error('Error registering user:', error);
    setLoading(false);
    alert('エラーが発生しました。');
  }
};

// アカウント編集確認・実行（edit/confirm/）
const handleConfirm = async () => {
  if (!userData) return;

  setLoading(true);

  try {
    const result = await updateAccountInfo(userData);

    if (result && 'ok' in result) {
      sessionStorage.removeItem('userData');
      router.push('/ec/order');
    } else {
      setLoading(false);
      alert('会員情報の更新に失敗しました。');
    }
  } catch (error) {
    console.error('Error updating account:', error);
    setLoading(false);
    alert('エラーが発生しました。');
  }
};
```

## 技術実装詳細

### フォーム管理システム
- **React Hook Form**: 高性能なフォーム状態管理
- **Zod バリデーション**: 型安全なスキーマ検証
- **リアルタイム検証**: onBlur・onChange による即座なエラー表示
- **エラーメッセージ**: ErrorMessage コンポーネントによる統一表示

### 住所自動入力システム
- **useAddressSearch**: 郵便番号API連携フック
- **リアルタイム検索**: 7桁入力完了時の自動検索
- **フィールド自動設定**: setValue による住所フィールド更新

### セッション管理
- **sessionStorage**: ページ間のデータ永続化
- **JSON シリアライゼーション**: 複雑なオブジェクトの保存
- **自動クリア**: 処理完了時の適切なデータクリア

### 入力フォーマット
- **自動フォーマット**: 生年月日・郵便番号・電話番号
- **入力制限**: 数字のみ・最大文字数制限
- **inputMode**: モバイルでの適切なキーボード表示

## データフロー

### 新規登録フロー
1. **入力**: signup/ でメールアドレス・パスワード入力
2. **確認**: signup/confirm/ で入力内容確認
3. **登録**: signUp() API呼び出し
4. **完了**: /ec/order へリダイレクト

### アカウント編集フロー
1. **取得**: getAccountInfo() で既存情報取得
2. **編集**: edit/ で情報更新
3. **確認**: edit/confirm/ で変更内容確認
4. **更新**: updateAccountInfo() API呼び出し
5. **完了**: /ec/order へリダイレクト

## UI/UX設計

### レスポンシブデザイン
```typescript
// Container maxWidth="sm" によるモバイル対応
<Container maxWidth="sm" sx={{ py: 1 }}>
  <Paper elevation={2} sx={{ p: 3, borderRadius: '8px' }}>
    {/* フォームコンテンツ */}
  </Paper>
</Container>
```

### エラー表示
```typescript
// 統一されたエラーメッセージ表示
<ErrorMessage
  errors={errors}
  name="displayName"
  render={({ message }) => (
    <FormHelperText error>{message}</FormHelperText>
  )}
/>
```

### ローディング状態
```typescript
// ローディング中の適切なフィードバック
{isLoading ? (
  <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
    <CircularProgress />
  </Container>
) : (
  // フォーム表示
)}
```

## 使用パターン

### 1. 新規会員登録
```typescript
// signup/ → signup/confirm/ → 登録完了 → /ec/order
```

### 2. アカウント情報編集
```typescript
// edit/ → edit/confirm/ → 更新完了 → /ec/order
```

### 3. 住所自動入力
```typescript
// 郵便番号7桁入力 → 自動住所検索 → フィールド自動設定
```

### 4. フォーマット入力
```typescript
// 生年月日: 数字入力 → YYYY-MM-DD 自動フォーマット
// 郵便番号: 数字入力 → 123-4567 自動フォーマット
// 電話番号: 数字のみ入力制限
```

## セキュリティ考慮事項

### パスワード管理
- **パスワード確認**: 新規登録時の二重入力確認
- **最小文字数**: 8文字以上の制限
- **一致確認**: confirmPassword との一致検証

### データ保護
- **セッション管理**: 一時データの適切なクリア
- **入力検証**: サーバーサイド・クライアントサイド両方での検証
- **エラーハンドリング**: 機密情報の適切な処理

## API統合

### useAppAuth プロバイダー
```typescript
// 認証・アカウント管理機能
const { signUp, getAccountInfo, updateAccountInfo } = useAppAuth();

// 新規登録
const result = await signUp({
  email: 'user@example.com',
  password: 'password123',
});

// アカウント情報取得
const userData = await getAccountInfo();

// アカウント情報更新
const result = await updateAccountInfo(formData);
```

### useAddressSearch フック
```typescript
// 住所検索機能
const { address, handleAddressSearch } = useAddressSearch(zipCode);

// 住所検索結果
{
  prefecture: '東京都',
  city: '渋谷区',
  address2: '神南',
}
```

## 関連ディレクトリ
- `../login/`: ログイン機能
- `../forget-password/`: パスワードリセット
- `../(auth)/order/`: 認証後の注文ページ
- `../(core)/constants/`: PATH定数
- `/providers/`: useAppAuth認証プロバイダー
- `/feature/stocking/hooks/`: useAddressSearch住所検索

## 開発ノート
- **570行の大規模フォーム**: 包括的なアカウント情報管理
- **2段階確認システム**: 入力→確認→実行の安全なフロー
- **住所自動入力**: ユーザビリティ向上のための自動化
- **自動フォーマット**: 入力支援による使いやすさ向上
- **型安全性**: TypeScript + Zod による完全な型チェック
- **再利用性**: 共通のバリデーションスキーマ・コンポーネント

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 