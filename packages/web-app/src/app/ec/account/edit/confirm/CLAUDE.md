# EC Account Edit Confirm - アカウント編集確認ページ

## 概要
**ファイル**: `packages/web-app/src/app/ec/account/edit/confirm/page.tsx` (215行)
**機能**: アカウント編集内容の確認と更新実行
**フロー**: 編集画面 → **確認画面** → 注文画面

## 主要機能

### 1. セッションストレージからのデータ復元
```typescript
useEffect(() => {
  const storedUserData = sessionStorage.getItem('userData');
  if (storedUserData) {
    try {
      const parsedData = JSON.parse(storedUserData) as UserInfo;
      setUserData(parsedData);
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }
}, []);
```

### 2. 11項目の確認表示
```typescript
// 表示される項目
- 表示名 (displayName)
- お名前 (fullName)
- フリガナ (fullNameRuby)
- 生年月日 (birthday)
- 電話番号 (phoneNumber)
- メールアドレス (mail)
- 郵便番号 (zipCode)
- 都道府県 (prefecture)
- 市区町村 (city)
- 以降の住所 (address2)
- 建物名など (building) ※条件表示
```

### 3. 会員情報更新処理
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
  }
};
```

## 技術実装

### 状態管理
```typescript
const [userData, setUserData] = useState<UserInfo | null>(null);
const [loading, setLoading] = useState(false);
const { updateUserInfo } = useAppAuth();
```

### データ型定義
```typescript
// UserInfo型は editAccountSchema から生成
export type UserInfo = z.infer<typeof editAccountSchema>;

// 11個のフィールドを持つ型
interface UserInfo {
  displayName: string;
  fullName: string;
  fullNameRuby: string;
  birthday: string;
  phoneNumber: string;
  mail: string;
  zipCode: string;
  prefecture: string;
  city: string;
  address2: string;
  building?: string; // オプション
}
```

### エラーハンドリング
```typescript
// データ不在時のローディング表示
if (!userData) {
  return (
    <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
      <CircularProgress />
    </Container>
  );
}
```

## UI/UX設計

### レイアウト構成
```typescript
<Container maxWidth="sm" sx={{ py: 1 }}>
  <Typography variant="h5" component="h1" align="center">
    入力内容の確認
  </Typography>
  <Paper elevation={2} sx={{ p: 3, borderRadius: '8px' }}>
    <Stack spacing={2}>
      {/* 11項目の確認表示 */}
      <Box sx={{ mt: 2 }}>
        <Stack direction="row" spacing={2}>
          {/* 戻る・確定ボタン */}
        </Stack>
      </Box>
    </Stack>
  </Paper>
</Container>
```

### 条件表示ロジック
```typescript
{userData.building && (
  <Box>
    <Typography variant="subtitle1" fontWeight="bold">
      建物名など
    </Typography>
    <Typography variant="body1">{userData.building}</Typography>
  </Box>
)}
```

### ボタン設計
```typescript
// 2つのボタンを横並び配置
<Stack direction="row" spacing={2}>
  <Button
    onClick={handleBack}
    variant="outlined"
    sx={{ color: '#c34646', borderColor: '#c34646' }}
    disabled={loading}
  >
    戻る
  </Button>
  <Button
    onClick={handleConfirm}
    variant="contained"
    sx={{ bgcolor: '#c34646' }}
    disabled={loading}
  >
    {loading ? '処理中...' : '会員情報を編集する'}
  </Button>
</Stack>
```

## データフロー

### 1. 入力 → 確認
```
編集画面 → sessionStorage.setItem('userData', JSON.stringify(data))
確認画面 → sessionStorage.getItem('userData') → UserInfo復元
```

### 2. 確認 → 更新
```
確認画面 → updateUserInfo(requestBody) → API更新
成功時 → sessionStorage.removeItem('userData') → 注文画面へ
```

### 3. エラー処理
```
API失敗 → alert('会員登録に失敗しました。')
例外発生 → alert('エラーが発生しました。')
```

## セキュリティ対策

### データ検証
```typescript
// セッションストレージからの復元時に型チェック
try {
  const parsedData = JSON.parse(storedUserData) as UserInfo;
  setUserData(parsedData);
} catch (error) {
  console.error('Error parsing user data:', error);
}
```

### 一時データ管理
```typescript
// 更新完了後にセッションストレージをクリア
if (result && 'ok' in result) {
  sessionStorage.removeItem('userData');
  router.push(PATH.ORDER.root);
}
```

## 依存関係

### 外部ライブラリ
- **Material-UI**: UI コンポーネント
- **Next.js**: ルーティング (useRouter)
- **React**: 状態管理 (useState, useEffect)

### 内部モジュール
- **useAppAuth**: 認証・アカウント管理フック
- **validateUserInfo**: UserInfo型定義
- **PATH**: パス定数定義

## 使用されるAPI

### updateUserInfo
```typescript
// useAppAuth フックから提供される更新機能
const result = await updateUserInfo({
  displayName, birthday, fullName, fullNameRuby,
  phoneNumber, address2, city, prefecture, 
  building, zipCode, mail
});
```

## 開発ノート

### 命名の注意点
```typescript
// 関数名が SignupConfirmPage だが実際は編集確認
export default function SignupConfirmPage() {
  // 実際は会員情報編集の確認画面
}
```

### 成功時の遷移
```typescript
// 編集完了後は注文画面へ遷移
router.push(PATH.ORDER.root); // '/ec/order'
```

### エラーメッセージ
```typescript
// 統一されたエラーメッセージ
alert('会員登録に失敗しました。'); // 編集だが「登録」と表示
alert('エラーが発生しました。');
```

## 関連ファイル

### 前段階
- `../page.tsx`: アカウント編集画面（570行）
- `../../../(core)/utils/validateUserInfo.ts`: 型定義

### 後段階
- **成功時**: `/ec/order` (注文画面)
- **失敗時**: 現在画面に留まる

### 共通モジュール
- `@/providers/useAppAuth`: 認証管理
- `@/app/ec/(core)/constants/paths`: パス定数

---
*生成: 2025-01-24 | 項目51: EC Account Edit Confirm* 