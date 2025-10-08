# EC Account Edit Result - アカウント編集完了ページ

## 概要
**ディレクトリ**: `packages/web-app/src/app/ec/account/edit/result/`
**状態**: **未実装** (ディレクトリ存在せず)
**予定機能**: アカウント編集完了の結果表示
**フロー**: 編集画面 → 確認画面 → **結果画面**

## 現在の実装状況

### 未実装の理由
```typescript
// 現在の確認画面では直接注文画面に遷移
if (result && 'ok' in result) {
  sessionStorage.removeItem('userData');
  router.push(PATH.ORDER.root); // 注文画面へ直接遷移
}
```

### 期待される機能フロー
```
1. アカウント編集画面 (`/ec/account/edit`)
2. 編集確認画面 (`/ec/account/edit/confirm`)
3. 【未実装】編集結果画面 (`/ec/account/edit/result`)
4. 注文画面 (`/ec/order`)
```

## 実装予定の機能

### 1. 編集完了メッセージ
```typescript
// 想定される実装
export default function AccountEditResultPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h5" component="h1" align="center">
        会員情報の編集が完了しました
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <CheckCircleIcon 
            sx={{ fontSize: 64, color: 'success.main', mb: 2 }} 
          />
          <Typography variant="h6">
            編集完了
          </Typography>
        </Box>
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          会員情報の編集が正常に完了しました。
          新しい情報が反映されています。
        </Typography>
      </Paper>
    </Container>
  );
}
```

### 2. 編集された項目の表示
```typescript
// セッションストレージから更新項目を取得
const [updatedFields, setUpdatedFields] = useState<string[]>([]);

useEffect(() => {
  const updatedData = sessionStorage.getItem('updatedFields');
  if (updatedData) {
    setUpdatedFields(JSON.parse(updatedData));
  }
}, []);

// 更新項目の表示
<Typography variant="subtitle1" fontWeight="bold">
  更新された項目
</Typography>
<List>
  {updatedFields.map((field) => (
    <ListItem key={field}>
      <ListItemText primary={getFieldLabel(field)} />
    </ListItem>
  ))}
</List>
```

### 3. 次のアクション案内
```typescript
// 操作選択肢の提供
<Stack spacing={2} sx={{ mt: 3 }}>
  <Button
    variant="contained"
    onClick={() => router.push(PATH.ORDER.root)}
    sx={{ bgcolor: '#c34646' }}
  >
    注文に進む
  </Button>
  
  <Button
    variant="outlined"
    onClick={() => router.push(PATH.ACCOUNT.edit)}
    sx={{ color: '#c34646', borderColor: '#c34646' }}
  >
    会員情報を再編集
  </Button>
  
  <Button
    variant="text"
    onClick={() => router.push(PATH.TOP)}
  >
    トップページに戻る
  </Button>
</Stack>
```

## 技術実装計画

### 必要なパス定義
```typescript
// packages/web-app/src/app/ec/(core)/constants/paths.ts に追加
export const PATH = {
  ACCOUNT: {
    edit: `${BASE_PATH}/account/edit`,
    editConfirm: `${BASE_PATH}/account/edit/confirm`,
    editResult: `${BASE_PATH}/account/edit/result`, // 追加予定
    signup: `${BASE_PATH}/account/signup`,
    signupConfirm: `${BASE_PATH}/account/signup/confirm`,
  },
};
```

### 状態管理
```typescript
// 編集結果の状態管理
interface EditResult {
  success: boolean;
  updatedFields: string[];
  timestamp: string;
  message?: string;
}

const [editResult, setEditResult] = useState<EditResult | null>(null);
```

### セッションストレージ管理
```typescript
// 確認画面からの情報引き継ぎ
useEffect(() => {
  const resultData = sessionStorage.getItem('editResult');
  if (resultData) {
    try {
      const parsedResult = JSON.parse(resultData) as EditResult;
      setEditResult(parsedResult);
    } catch (error) {
      console.error('Error parsing edit result:', error);
    }
  }
}, []);
```

## UI/UX設計計画

### レイアウト構成
```typescript
<Container maxWidth="sm" sx={{ py: 1 }}>
  {/* ヘッダー */}
  <Typography variant="h5" component="h1" align="center">
    会員情報編集完了
  </Typography>
  
  {/* 成功アイコン */}
  <Box sx={{ textAlign: 'center', my: 3 }}>
    <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main' }} />
  </Box>
  
  {/* 完了メッセージ */}
  <Paper elevation={2} sx={{ p: 3, borderRadius: '8px' }}>
    <Typography variant="body1" sx={{ mb: 2 }}>
      会員情報の編集が完了しました。
    </Typography>
    
    {/* 更新項目一覧 */}
    <Typography variant="subtitle2" sx={{ mb: 1 }}>
      更新された項目:
    </Typography>
    <List dense>
      {/* 更新項目のリスト */}
    </List>
  </Paper>
  
  {/* アクションボタン */}
  <Stack spacing={2} sx={{ mt: 3 }}>
    {/* 各種ボタン */}
  </Stack>
</Container>
```

### 成功・失敗の状態表示
```typescript
// 成功時
<Alert severity="success" sx={{ mb: 2 }}>
  会員情報の編集が正常に完了しました。
</Alert>

// 失敗時（エラー情報の表示）
<Alert severity="error" sx={{ mb: 2 }}>
  会員情報の編集中にエラーが発生しました。
  しばらく時間をおいてから再度お試しください。
</Alert>
```

## データフロー設計

### 確認画面からの遷移
```typescript
// 現在の確認画面を修正
const handleConfirm = async () => {
  try {
    const result = await updateUserInfo(requestBody);
    
    if (result && 'ok' in result) {
      // 編集結果をセッションストレージに保存
      const editResult = {
        success: true,
        updatedFields: Object.keys(requestBody),
        timestamp: new Date().toISOString(),
        message: '会員情報の編集が完了しました。'
      };
      
      sessionStorage.setItem('editResult', JSON.stringify(editResult));
      sessionStorage.removeItem('userData');
      
      // 結果画面に遷移
      router.push(PATH.ACCOUNT.editResult);
    }
  } catch (error) {
    // エラー結果をセッションストレージに保存
    const editResult = {
      success: false,
      updatedFields: [],
      timestamp: new Date().toISOString(),
      message: 'エラーが発生しました。'
    };
    
    sessionStorage.setItem('editResult', JSON.stringify(editResult));
    router.push(PATH.ACCOUNT.editResult);
  }
};
```

## セキュリティ考慮事項

### セッションストレージの管理
```typescript
// 結果表示後のクリーンアップ
useEffect(() => {
  return () => {
    // コンポーネントアンマウント時にセッションストレージをクリア
    sessionStorage.removeItem('editResult');
  };
}, []);
```

### 直接アクセス対策
```typescript
// 編集結果データがない場合のリダイレクト
if (!editResult) {
  return (
    <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
      <Typography variant="body1" sx={{ mb: 2 }}>
        編集結果が見つかりません。
      </Typography>
      <Button
        variant="contained"
        onClick={() => router.push(PATH.ACCOUNT.edit)}
        sx={{ bgcolor: '#c34646' }}
      >
        会員情報編集に戻る
      </Button>
    </Container>
  );
}
```

## 実装の優先度

### 高優先度
1. **基本的な完了メッセージ表示**
2. **注文画面への遷移ボタン**
3. **セッションストレージからの結果データ取得**

### 中優先度
1. **更新項目の詳細表示**
2. **成功・失敗の状態表示**
3. **複数のアクション選択肢**

### 低優先度
1. **編集履歴の表示**
2. **アニメーション効果**
3. **詳細なエラー情報表示**

## 関連ファイル

### 実装時に作成が必要
- `packages/web-app/src/app/ec/account/edit/result/page.tsx`
- `packages/web-app/src/app/ec/account/edit/result/CLAUDE.md`

### 修正が必要
- `packages/web-app/src/app/ec/account/edit/confirm/page.tsx`: 遷移先変更
- `packages/web-app/src/app/ec/(core)/constants/paths.ts`: パス定数追加

### 参考実装
- `packages/web-app/src/app/ec/(auth)/order/result/[id]/page.tsx`: 注文結果画面
- `packages/web-app/src/app/ec/account/signup/confirm/page.tsx`: 登録確認画面

---
*生成: 2025-01-24 | 項目52: EC Account Edit Result (未実装)* 