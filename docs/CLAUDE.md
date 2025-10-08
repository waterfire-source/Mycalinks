# docs/CLAUDE.md

## 🎯 目的・役割

プロジェクトの技術ドキュメント集。コンポーネント仕様、フック使用方法、UI設計ガイドライン等の開発者向けドキュメントを集約し、プロジェクト全体の技術情報を体系化。

## 🏗️ 技術構成

- **主要技術**: Markdown, 画像ファイル（PNG）
- **依存関係**: プロジェクト全体の実装コード
- **関連システム**: 開発ツール、コンポーネントライブラリ

## 📁 ディレクトリ構造

```
docs/
├── CLAUDE.md
├── components.md        # コンポーネント設計ガイド
├── hooks.md            # カスタムフック使用方法
└── images/             # UI設計・仕様画像
    ├── CategorySelect.png              # カテゴリ選択UI
    ├── ConfirmationDialog.png          # 確認ダイアログ
    ├── ContainerLayout.png             # レイアウトコンテナ
    ├── CustomModalWithIcon.png         # アイコン付きモーダル
    ├── CustomTab.png                   # カスタムタブ
    ├── CustomTabTable.png              # タブテーブル
    ├── CustomTable.png                 # カスタムテーブル
    ├── DetailCard.png                  # 詳細カード
    ├── GenreTab.png                    # ジャンルタブ
    ├── ImagePicker.png                 # 画像選択
    ├── InfoTooltip.png                 # 情報ツールチップ
    ├── ItemImage.png                   # 商品画像表示
    ├── ItemSearch.png                  # 商品検索
    ├── ItemSortSelect.png              # 商品ソート選択
    ├── MultiSelectButtonGroup.png      # 複数選択ボタングループ
    ├── NumericTextField.png            # 数値入力フィールド
    ├── PrimaryButtonWithIcon.png       # プライマリアイコンボタン
    ├── PrimaryIconButton.png           # プライマリアイコンボタン
    ├── ProductCountSearchHeader.png    # 商品数検索ヘッダー
    ├── RequiredTitle.png               # 必須項目タイトル
    ├── SecondaryButtonWithIcon.png     # セカンダリアイコンボタン
    ├── SelectionButtonGroup.png        # 選択ボタングループ
    ├── SimpleButtonWithIcon.png        # シンプルアイコンボタン
    ├── StyledAlertConfirmationModal.png # スタイル付き確認モーダル
    └── TertiaryButtonWithIcon.png      # ターシャリアイコンボタン
```

## 🔧 主要機能

### 技術ドキュメント管理

- コンポーネント設計仕様書の提供
- カスタムフックの使用方法ガイド
- UI/UXデザインガイドライン

### 視覚的設計ガイド

- UIコンポーネントのビジュアル仕様
- インタラクション設計の参考資料
- デザインシステムの統一性確保

### 開発者リソース

- 実装パターンの標準化
- ベストプラクティスの共有
- トラブルシューティングガイド

## 💡 使用パターン

### ドキュメント参照

```bash
# コンポーネント設計確認
cat docs/components.md

# フック使用方法確認
cat docs/hooks.md

# UI仕様画像確認
open docs/images/[ComponentName].png
```

### 新規開発時の参照フロー

1. `components.md` で設計パターン確認
2. `hooks.md` で適用可能なフック確認
3. `images/` で類似UIの仕様確認
4. 実装・テスト・ドキュメント更新

## 🗺️ プロジェクト内での位置づけ

### 情報フロー

```
実装コード → ドキュメント更新 → 開発者参照
         ↓
新規実装ガイド → 品質向上 → プロジェクト標準化
```

### 他システムとの関係

- **全コンポーネント**: 設計仕様の参照元
- **開発プロセス**: 実装標準の提供
- **品質保証**: レビュー基準の提供
- **新規参加者**: オンボーディング資料

### 責務の境界

- **責務内**: 技術仕様の文書化、視覚的ガイドの提供
- **責務外**: ビジネスロジックの実装、コード生成

## 🔗 関連ディレクトリ

- [共通コンポーネント](../packages/web-app/src/components/) - 実装コード
- [カスタムフック](../packages/web-app/src/hooks/) - フック実装
- [Feature機能](../packages/web-app/src/feature/) - 機能別実装
- [API仕様](../packages/api-generator/) - API設計

## 📚 ドキュメント・リソース

- Material-UI 設計ガイドライン
- React Hook 設計パターン
- TypeScript 型設計ベストプラクティス
- アクセシビリティガイドライン

## 📝 開発メモ

### 文書化戦略

- 実装と同期したリアルタイム更新
- 視覚的な説明の重視
- 実用性を優先した構成

### 注意点

- ドキュメントの陳腐化防止
- 画像ファイルのサイズ管理
- 多言語対応の考慮

### ベストプラクティス

- 実装変更時の同期更新
- 画像の命名規則統一
- 検索しやすい構造化

### 品質管理

- 定期的なドキュメントレビュー
- 実装との整合性チェック
- 新規参加者によるユーザビリティテスト

### 将来の拡張計画

- インタラクティブなドキュメント
- 自動生成機能の導入
- 多言語対応
- バージョン管理の強化

---

_Documentation-Agent作成: 2025-01-24_
