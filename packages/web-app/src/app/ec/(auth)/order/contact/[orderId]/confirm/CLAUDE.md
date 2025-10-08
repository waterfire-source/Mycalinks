# EC注文問い合わせ確認画面

## 目的
注文に関する問い合わせ内容を送信前に確認し、最終的な送信処理を行う画面

## 機能概要
- **入力内容確認**: セッションストレージから取得した問い合わせ内容の表示
- **送信処理**: 問い合わせの最終送信とセッションデータのクリア
- **修正機能**: 入力画面への戻り機能
- **データ保護**: セッションストレージによる一時的なデータ保持

## 技術実装詳細

### 状態管理
```typescript
// 149行のコンポーネント、セッションストレージベースの状態管理
const [contactData, setContactData] = useState<z.infer<typeof contactSchema> | null>(null);

// セッションストレージからの復元
useEffect(() => {
  const data = sessionStorage.getItem('contactData');
  if (data) {
    setContactData(JSON.parse(data));
  } else {
    router.push(PATH.TOP); // データなしの場合はトップページへ
  }
}, [router]);
```

### データフロー
```typescript
// 1. セッションストレージからデータ取得
const data = sessionStorage.getItem('contactData');

// 2. 送信処理
const handleSubmit = async () => {
  const params = {
    kind: contactData.kind,        // 問い合わせ種類
    title: contactData.title,      // 件名
    content: contactData.content,  // 内容
  };
  
  await createOrderContact(orderId, params);
  sessionStorage.removeItem('contactData'); // データクリア
  router.push(PATH.ORDER.contactResult(orderId));
};
```

### UI/UX特徴

#### 確認表示形式
- **注文番号**: 動的パラメータから取得
- **問い合わせ種類**: kindsマッピングによる日本語表示
- **件名・内容**: 改行・改行保持の表示（whiteSpace: 'pre-wrap'）

#### アクションボタン
```typescript
// 送信ボタン - プライマリアクション
<Button fullWidth variant="contained" onClick={handleSubmit}>
  送信する
</Button>

// 修正ボタン - セカンダリアクション（グレー背景）
<Button fullWidth variant="outlined" onClick={handleBack}
  sx={{ color: '#fff', borderColor: 'grey.500', backgroundColor: 'grey.500' }}>
  修正する
</Button>
```

### データ構造
```typescript
// Zod スキーマによる型安全性
interface ContactFormData {
  orderNumber: string;  // 注文番号
  kind: string;         // 問い合わせ種類
  title: string;        // 件名
  content: string;      // 問い合わせ内容
}
```

### セキュリティ・エラーハンドリング
- **データ検証**: セッションストレージにデータがない場合のトップページリダイレクト
- **エラーログ**: 送信エラー時のコンソールログ出力
- **型安全性**: Zodスキーマによる実行時型チェック

## 依存関係
- **useEcOrderContact**: 問い合わせ送信API
- **PATH**: ルーティング定数
- **contactSchema + kinds**: 親コンポーネントからの型・定数インポート
- **sessionStorage**: ブラウザセッションストレージAPI

## ユーザーフロー
1. 問い合わせ入力画面で「確認」ボタンクリック
2. 入力内容がセッションストレージに保存され、確認画面へ遷移
3. 入力内容を確認し、「送信する」または「修正する」を選択
4. 送信時：API呼び出し → セッションクリア → 完了画面へ遷移
5. 修正時：前画面に戻る（セッションデータは保持）

## 開発上の特徴
- **シンプルな構造**: 149行のコンパクトな実装
- **セッション管理**: 一時的なデータ保持による UX向上
- **型安全性**: Zodスキーマとの連携による堅牢性
- **Material-UI**: 統一されたデザインシステム

## 関連ファイル
- `../page.tsx`: 問い合わせ入力画面（データ送信元）
- `../result/page.tsx`: 問い合わせ完了画面（遷移先）
- `@/app/ec/(core)/hooks/useEcOrderContact`: 問い合わせAPI
- `@/app/ec/(core)/constants/paths`: ルーティング定数

---
*生成: 2025-01-24 / 項目42 - EC注文問い合わせ確認画面* 