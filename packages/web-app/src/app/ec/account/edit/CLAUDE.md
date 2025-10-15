# ECアカウント編集画面

## 目的
既存顧客のプロフィール情報を編集・更新する包括的なフォーム機能

## 機能概要
- **プロフィール編集**: 個人情報・連絡先の包括的編集
- **住所自動入力**: 郵便番号による住所自動補完
- **リアルタイムバリデーション**: 入力時の即座なエラーチェック
- **確認フロー**: 編集 → 確認 → 更新の段階的処理

## 技術実装詳細

### 状態管理・データフロー
```typescript
// 570行の大規模コンポーネント、複雑な状態管理
const [defaultValues, setDefaultValues] = useState({
  displayName: '', fullName: '', fullNameRuby: '',
  birthday: '', phoneNumber: '', mail: '',
  zipCode: '', prefecture: '', city: '', address2: '', building: '',
});
const [isLoading, setIsLoading] = useState(true);
const [isUserData, setIsUserData] = useState(true);

// React Hook Form + Zod による堅牢なフォーム管理
const methods = useForm<EditAccountFormData>({
  resolver: zodResolver(editAccountSchema),
  defaultValues,
  mode: 'onBlur',
  reValidateMode: 'onChange',
});
```

### Zodスキーマ検証
```typescript
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
```

### 住所自動入力機能
```typescript
// 郵便番号監視・住所検索
const watchZipCode = watch('zipCode');
const { address, handleAddressSearch } = useAddressSearch(
  watchZipCode?.replace(/-/g, '') || '',
);

// 7桁入力時の自動検索
useEffect(() => {
  if (watchZipCode && watchZipCode.replace(/-/g, '').length === 7) {
    handleAddressSearch();
  }
}, [watchZipCode, handleAddressSearch]);

// 住所フィールドの自動入力
useEffect(() => {
  if (address.prefecture) setValue('prefecture', address.prefecture);
  if (address.city) setValue('city', address.city);
  if (address.address2) setValue('address2', address.address2);
}, [address, setValue]);
```

### アカウント情報取得・初期化
```typescript
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
```

## UI/UX設計

### 入力フィールドの自動フォーマット
```typescript
// 生年月日の自動フォーマット（YYYY-MM-DD）
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

// 電話番号の数字のみ入力
{...register('phoneNumber', {
  onChange: (e) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    e.target.value = value;
  },
})}

// 郵便番号の自動フォーマット（XXX-XXXX）
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
```

### エラー表示・バリデーション
```typescript
// 統一されたエラー表示
<Typography
  variant="body1"
  sx={{
    mb: 1,
    color: errors.fieldName ? 'error.main' : 'inherit',
  }}
>
  フィールド名
</Typography>
<TextField
  {...register('fieldName')}
  fullWidth
  size="small"
  variant="outlined"
  error={!!errors.fieldName}
/>
<ErrorMessage
  errors={errors}
  name="fieldName"
  render={({ message }) => (
    <FormHelperText error>{message}</FormHelperText>
  )}
/>
```

### フォームフィールド構成
```typescript
// 11の入力フィールド
1. 表示名（displayName）
2. お名前（fullName）
3. フリガナ（fullNameRuby）
4. 生年月日（birthday）- YYYY-MM-DD形式
5. 電話番号（phoneNumber）- ハイフンなし
6. メールアドレス（mail）
7. 郵便番号（zipCode）- 自動フォーマット
8. 都道府県（prefecture）- 自動入力
9. 市区町村（city）- 自動入力
10. 以降の住所（address2）- 自動入力
11. 建物名など（building）- オプション
```

## エラーハンドリング・状態管理

### ローディング状態
```typescript
if (isLoading) {
  return (
    <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
      <CircularProgress />
    </Container>
  );
}
```

### ユーザーデータ不在処理
```typescript
if (!isUserData) {
  return (
    <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
      <Paper elevation={2} sx={{ p: 2, borderRadius: '8px', fontSize: '0.875rem' }}>
        会員情報を編集するユーザーが存在しません
        <Button onClick={handleBack} fullWidth variant="outlined">
          戻る
        </Button>
      </Paper>
    </Container>
  );
}
```

### フォーム送信処理
```typescript
const onSubmit = (data: EditAccountFormData) => {
  sessionStorage.setItem('userData', JSON.stringify(data));
  router.push(PATH.ACCOUNT.editConfirm);
};
```

## 確認画面機能（confirm/page.tsx）

### データ復元・表示
```typescript
// 214行の確認画面コンポーネント
const [userData, setUserData] = useState<UserInfo | null>(null);
const [loading, setLoading] = useState(false);

// セッションストレージからのデータ復元
useEffect(() => {
  const storedUserData = sessionStorage.getItem('userData');
  if (storedUserData) {
    const parsedData = JSON.parse(storedUserData) as UserInfo;
    setUserData(parsedData);
  }
}, []);
```

### 更新処理
```typescript
const handleConfirm = async () => {
  if (!userData) return;
  setLoading(true);

  try {
    const requestBody = {
      displayName: userData.displayName,
      birthday: userData.birthday,
      fullName: userData.fullName,
      fullNameRuby: userData.fullNameRuby,
      phoneNumber: userData.phoneNumber,
      address2: userData.address2,
      city: userData.city,
      prefecture: userData.prefecture,
      building: userData.building,
      zipCode: userData.zipCode,
      mail: userData.mail,
    };
    
    const result = await updateUserInfo(requestBody);

    if (result && 'ok' in result) {
      sessionStorage.removeItem('userData');
      router.push(PATH.ORDER.root);
    } else {
      alert('会員登録に失敗しました。');
    }
  } catch (error) {
    console.error('Error registering user:', error);
    alert('エラーが発生しました。');
  } finally {
    setLoading(false);
  }
};
```

## 依存関係
- **useAppAuth**: 認証・ユーザー情報管理（getAccountInfo, updateUserInfo）
- **useAddressSearch**: 郵便番号による住所検索
- **React Hook Form**: フォーム管理・バリデーション
- **Zod**: スキーマ検証・型安全性
- **PATH**: ルーティング定数
- **CustomError**: エラー型定義

## パフォーマンス最適化
- **onBlur・onChange**: 適切なタイミングでのバリデーション実行
- **useEffect依存配列**: 必要最小限の再実行制御
- **条件分岐**: 不要な処理の回避
- **セッションストレージ**: 効率的な一時データ管理

## ユーザビリティ特徴
- **自動フォーマット**: 生年月日・郵便番号・電話番号の入力支援
- **住所自動補完**: 郵便番号入力による住所自動入力
- **リアルタイム検証**: 入力と同時のエラー表示
- **視覚的フィードバック**: エラー時のラベル色変更
- **入力制限**: 適切な文字数・文字種制限

## セキュリティ考慮事項
- **データ検証**: クライアント・サーバー両方でのバリデーション
- **エラーハンドリング**: 機密情報を含まないエラーメッセージ
- **セッション管理**: 一時データの適切なクリア
- **認証確認**: ユーザー認証状態の確認

## 開発上の特徴
- **大規模フォーム**: 570行の包括的な実装
- **型安全性**: TypeScript + Zod による完全な型チェック
- **再利用性**: 共通パターンの一貫した適用
- **保守性**: 明確な責任分離と構造化

## 関連ファイル
- `page.tsx`: アカウント編集フォーム（570行）
- `confirm/page.tsx`: 編集確認画面（214行）
- `../signup/`: 新規登録機能
- `@/providers/useAppAuth.tsx`: 認証プロバイダー
- `@/feature/stocking/hooks/useAddressSearch.tsx`: 住所検索フック
- `@/app/ec/(core)/constants/paths.ts`: ルーティング定数

---
*生成: 2025-01-24 / 項目50 - ECアカウント編集画面* 