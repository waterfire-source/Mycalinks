# EC Core Components Modals - モーダルコンポーネント

## 目的
ECサイトで使用される各種モーダルダイアログコンポーネントを提供

## 実装されているコンポーネント (4個)

```
modals/
├── ShopChangeModal.tsx (463行) - 最大規模
├── ReportModal.tsx (193行)
├── CommonModal.tsx (110行)
└── ReceiptIssueModal.tsx (134行)
```

## 主要実装

### ShopChangeModal.tsx (463行) - ショップ変更モーダル
```typescript
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Stack,
  IconButton,
  Box,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getConditionLabel } from '@/app/ec/(core)/utils/condition';
import { useEcProduct } from '@/app/ec/(core)/hooks/useEcProduct';
import { StockSelect } from '@/app/ec/(core)/components/selects/StockSelect';
import { useEffect, useState } from 'react';
import { ConditionOptionHandle } from '@prisma/client';

// ショップ変更時の選択商品情報の型定義
export type ShopChangeSelection = {
  id: number; // 商品ID
  store_id: number; // ストアID
  count: number; // 選択数量
  price?: number; // 商品価格
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  product: {
    product_id: number;
    original_item_count: number;
    store_id?: number;
    product: {
      condition_option: {
        handle: ConditionOptionHandle | null;
      };
      mycaItem: {
        id: number;
        cardname: string | null;
        cardnumber: string | null;
        rarity: string | null;
        full_image_url: string | null;
      };
    };
  };
  // 現在のカート内の商品情報
  currentCartItems?: Array<{
    product_id: number;
    store_id: number;
    original_item_count: number;
  }>;
  onConfirm: (selections: ShopChangeSelection[]) => void;
};

export const ShopChangeModal = ({
  isOpen,
  onClose,
  product,
  currentCartItems = [],
  onConfirm,
}: Props) => {
  const { getEcProduct } = useEcProduct();
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Array<{
    id: number;
    store: {
      id: number;
      display_name: string | null;
      ec_setting: {
        same_day_limit_hour: number | null;
        shipping_days: number | null;
        free_shipping: boolean;
      };
    };
    price: number;
    ec_stock_number: number;
    condition_option: {
      handle: ConditionOptionHandle | null;
    };
  }> | null>(null);

  // ショップ変更の選択内容を保持するステート
  const [shopChangeSelections, setShopChangeSelections] = useState<
    ShopChangeSelection[]
  >([]);

  // 確定ボタンの有効/無効を管理
  const isConfirmButtonEnabled = () => {
    // 選択された商品の合計数量が0より大きい場合にボタンを有効化
    const totalSelected = shopChangeSelections.reduce(
      (sum, selection) => sum + selection.count,
      0,
    );
    return totalSelected > 0;
  };

  // 確定ボタンクリック時の処理
  const handleConfirm = () => {
    if (!isConfirmButtonEnabled()) return;

    // 選択情報を親コンポーネントに渡す（既にステートで管理しているのでそのまま渡す）
    onConfirm(shopChangeSelections);
    onClose();
  };

  // 数量変更時の処理
  const handleQuantityChange = (productId: number, quantity: number) => {
    // 対応する商品データを取得
    const productData = products?.find((p) => p.id === productId);

    if (!productData) return;

    setShopChangeSelections((prev) => {
      // 既存の選択内容から該当商品を探す
      const existingIndex = prev.findIndex((item) => item.id === productId);

      if (quantity === 0) {
        // 数量が0の場合は配列から削除
        return existingIndex >= 0
          ? prev.filter((item) => item.id !== productId)
          : prev;
      } else if (existingIndex >= 0) {
        // 既存のアイテムを更新
        return prev.map((item) =>
          item.id === productId ? { ...item, count: quantity } : item,
        );
      } else {
        // 新しいアイテムを追加
        return [
          ...prev,
          {
            id: productId,
            store_id: productData.store.id,
            count: quantity,
            price: productData.price, // 価格情報も保存
          },
        ];
      }
    });
  };

  // 各商品の選択数量を取得するヘルパー関数
  const getSelectedQuantity = (productId: number): number => {
    const selection = shopChangeSelections.find(
      (item) => item.id === productId,
    );
    return selection?.count || 0;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      if (!product.product.mycaItem.id) return;

      setIsLoading(true);
      try {
        // 親カードの状態（コンディション）を取得
        const parentCondition = product.product?.condition_option?.handle;

        // 同じカード、同じコンディションの商品を取得
        const res = await getEcProduct(product.product.mycaItem.id, {
          hasStock: true,
          conditionOption: parentCondition || undefined,
        });

        if (res) {
          // 親の出品情報を除外
          const filteredProducts = res.products
            .filter((item) => item.id !== product.product_id)
            .map((item) => {
              return {
                id: item.id,
                store: {
                  id: item.store.id,
                  display_name: item.store.display_name,
                  ec_setting: item.store.ec_setting,
                },
                price: item.actual_ec_sell_price ?? 0,
                ec_stock_number: item.ec_stock_number,
                condition_option: item.condition_option,
              };
            });
          setProducts(filteredProducts);
        }
      } catch (error) {
        console.error('商品情報の取得に失敗しました', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchProducts();
      // モーダルを開くたびに選択状態をリセット
      setShopChangeSelections([]);
    }
  }, [isOpen]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '10px',
          overflow: 'hidden',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          textAlign: 'center',
          fontSize: '1rem !important',
          fontWeight: 'bold',
          py: 1,
          position: 'relative',
        }}
      >
        ショップ変更
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'white',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px',
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={2} sx={{ mt: 2 }}>
            {/* 現在の商品情報 */}
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                変更対象の商品
              </Typography>
              <Typography>
                {product.product.mycaItem.cardname} - {product.product.mycaItem.cardnumber}
              </Typography>
              <Typography>
                コンディション: {getConditionLabel(product.product.condition_option?.handle)}
              </Typography>
              <Typography>
                数量: {product.original_item_count}個
              </Typography>
            </Box>

            {/* 代替商品一覧 */}
            <Typography variant="h6" fontWeight="bold">
              他のショップの同じ商品
            </Typography>
            {products && products.length > 0 ? (
              <Stack spacing={1}>
                {products.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'grey.300',
                      borderRadius: 1,
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography fontWeight="bold">
                          {item.store.display_name || '店舗名なし'}
                        </Typography>
                        <Typography color="primary.main" fontWeight="bold">
                          {item.price.toLocaleString()}円
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          在庫: {item.ec_stock_number}個
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.store.ec_setting.same_day_limit_hour}時まで即日発送
                        </Typography>
                      </Box>
                      <Box sx={{ minWidth: 120 }}>
                        <StockSelect
                          maxStock={Math.min(item.ec_stock_number, product.original_item_count)}
                          value={getSelectedQuantity(item.id)}
                          onChange={(quantity) => handleQuantityChange(item.id, quantity)}
                        />
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary">
                他のショップでの取り扱いはありません
              </Typography>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Stack
          direction="column"
          spacing={2}
          sx={{ width: '100%', px: 2, pb: 2 }}
        >
          <Button
            onClick={handleConfirm}
            variant="contained"
            color="primary"
            sx={{ borderRadius: '10px' }}
            disabled={!isConfirmButtonEnabled()}
          >
            変更を確定
          </Button>
          <Button
            onClick={onClose}
            color="inherit"
            sx={{ borderRadius: '10px' }}
          >
            キャンセル
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
```

### ReportModal.tsx (193行) - 問題報告モーダル
```typescript
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Stack,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import { useEcContact } from '@/app/ec/(core)/hooks/useEcContact';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  mycaItemId: number;
};

export const ReportModal = ({ isOpen, onClose, mycaItemId }: Props) => {
  // 問題報告のカスタムフック
  const { reportProblem } = useEcContact();

  // 選択された問題の種類
  const [selectedKind, setSelectedKind] = useState('1');
  // 報告内容
  const [content, setContent] = useState('');
  // 送信中かどうか
  const [isSubmitting, setIsSubmitting] = useState(false);

  // モーダルを閉じる
  const handleClose = () => {
    setSelectedKind('1');
    setContent('');
    onClose();
  };

  // 報告を送信
  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // 選択された問題の種類に応じたラベルを取得
      const kindLabel = (() => {
        switch (selectedKind) {
          case '1':
            return '画像が間違っている';
          case '2':
            return '商品情報が間違っている';
          case '3':
            return 'その他';
          default:
            return 'その他';
        }
      })();

      const success = await reportProblem(kindLabel, content, mycaItemId);
      if (success) {
        handleClose();
      } else {
        // TODO: エラー時の処理を実装
        console.error('問題報告の送信に失敗しました');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '10px',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          textAlign: 'center',
          fontSize: '1rem !important',
          fontWeight: 'bold',
          py: 1,
          position: 'relative',
        }}
      >
        問題を報告
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'white',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography variant="h3" fontWeight="bold" sx={{ mt: 3, mb: 1 }}>
          問題の内容を選択してください
        </Typography>
        <RadioGroup
          value={selectedKind}
          onChange={(e) => setSelectedKind(e.target.value)}
        >
          <FormControlLabel
            value="1"
            control={<Radio />}
            label="画像が間違っている"
            sx={{
              '& .MuiFormControlLabel-label': {
                fontSize: '1rem',
                fontWeight: 'bold',
              },
            }}
          />
          <FormControlLabel
            value="2"
            control={<Radio />}
            label="商品情報が間違っている"
            sx={{
              '& .MuiFormControlLabel-label': {
                fontSize: '1rem',
                fontWeight: 'bold',
              },
            }}
          />
          <FormControlLabel
            value="3"
            control={<Radio />}
            label="その他"
            sx={{
              '& .MuiFormControlLabel-label': {
                fontSize: '1rem',
                fontWeight: 'bold',
              },
            }}
          />
        </RadioGroup>
        <TextField
          multiline
          rows={5}
          fullWidth
          placeholder="問題の内容を入力してください"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Stack
          direction="column"
          spacing={2}
          sx={{ width: '100%', px: 2, pb: 2 }}
        >
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            sx={{ borderRadius: '10px' }}
            disabled={isSubmitting}
          >
            報告する
          </Button>
          <Button
            onClick={handleClose}
            color="inherit"
            sx={{ borderRadius: '10px' }}
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
```

### CommonModal.tsx (110行) - 共通モーダル
```typescript
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  IconButton,
  SxProps,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

type Props = {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onSubmit?: () => void | Promise<void>;
  isCancel?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  sx?: SxProps;
};

export const CommonModal = ({
  children,
  isOpen,
  onClose,
  title,
  onSubmit,
  isCancel = false,
  submitLabel = '保存',
  cancelLabel = 'キャンセル',
  isSubmitting = false,
  sx = {},
}: Props) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '10px',
          overflow: 'hidden',
          ...sx,
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          textAlign: 'center',
          fontSize: '1rem !important',
          fontWeight: 'bold',
          py: 1,
          position: 'relative',
        }}
      >
        {title}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'white',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <Stack
          direction="column"
          spacing={2}
          sx={{ width: '100%', px: 2, pb: onSubmit || isCancel ? 2 : 0 }}
        >
          {onSubmit && (
            <Button
              onClick={onSubmit}
              variant="contained"
              color="primary"
              sx={{ borderRadius: '10px' }}
              disabled={isSubmitting}
            >
              {submitLabel}
            </Button>
          )}
          {isCancel && (
            <Button
              onClick={onClose}
              color="inherit"
              sx={{ borderRadius: '10px' }}
              disabled={isSubmitting}
            >
              {cancelLabel}
            </Button>
          )}
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
```

### ReceiptIssueModal.tsx (134行) - 領収書発行モーダル
- **領収書発行**: 注文に対する領収書発行機能
- **フォーム入力**: 宛名・但し書きの入力フォーム
- **PDF生成**: 領収書PDFの生成・ダウンロード
- **入力検証**: 必須項目のバリデーション

## 主要な技術実装

### 複雑なショップ変更機能 (ShopChangeModal.tsx - 463行)
- **商品検索**: 同じカード・同じコンディションの商品を検索
- **在庫管理**: 各店舗の在庫数・価格・配送設定の表示
- **数量選択**: StockSelect による数量選択
- **状態管理**: 複数商品の選択状態を管理

### 問題報告システム (ReportModal.tsx - 193行)
- **カテゴリ選択**: ラジオボタンによる問題種類選択
- **自由記述**: TextField による詳細内容入力
- **送信処理**: useEcContact による問題報告送信
- **状態管理**: 送信中状態の管理

### 再利用可能な共通モーダル (CommonModal.tsx - 110行)
- **柔軟な設計**: children による内容の自由度
- **カスタマイズ**: ボタンラベル・動作の設定可能
- **統一デザイン**: 共通のヘッダー・フッター・スタイル
- **型安全性**: TypeScript による厳密な型定義

### 統一されたUI設計
- **ヘッダー**: 青色背景・白文字・中央揃え・閉じるボタン
- **角丸**: 10px の統一された角丸
- **ボタン**: 縦並び・フルWidth・統一スタイル
- **レスポンシブ**: maxWidth・fullWidth による適応

## 使用パターン

### 1. ショップ変更モーダル
```typescript
import { ShopChangeModal } from './modals/ShopChangeModal';

const CartPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleShopChange = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleConfirm = (selections) => {
    // ショップ変更の処理
    console.log('Selected products:', selections);
    setIsModalOpen(false);
  };

  return (
    <div>
      <button onClick={() => handleShopChange(product)}>
        ショップを変更
      </button>
      <ShopChangeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        onConfirm={handleConfirm}
      />
    </div>
  );
};
```

### 2. 問題報告モーダル
```typescript
import { ReportModal } from './modals/ReportModal';

const ProductDetailPage = () => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [mycaItemId, setMycaItemId] = useState(null);

  const handleReportProblem = (itemId) => {
    setMycaItemId(itemId);
    setIsReportModalOpen(true);
  };

  return (
    <div>
      <button onClick={() => handleReportProblem(123)}>
        問題を報告
      </button>
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        mycaItemId={mycaItemId}
      />
    </div>
  );
};
```

### 3. 共通モーダル
```typescript
import { CommonModal } from './modals/CommonModal';

const SettingsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 保存処理
      await saveSettings();
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>
        設定を編集
      </button>
      <CommonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="設定の編集"
        onSubmit={handleSubmit}
        isCancel={true}
        submitLabel="保存"
        cancelLabel="キャンセル"
        isSubmitting={isSubmitting}
      >
        <div>
          <input type="text" placeholder="設定値を入力" />
        </div>
      </CommonModal>
    </div>
  );
};
```

## 関連ディレクトリ
- `../`: ECサイトコアコンポーネント
- `../../hooks/`: カスタムフック（useEcProduct, useEcContact）
- `../../utils/`: ユーティリティ（condition）
- `../selects/`: セレクトコンポーネント（StockSelect）

## 開発ノート
- **複雑な状態管理**: 商品選択・数量管理・送信状態の複合管理
- **非同期処理**: API呼び出し・データ取得・送信処理
- **型安全性**: TypeScript による厳密な型定義
- **UX**: 直感的な操作・適切なフィードバック・エラーハンドリング
- **再利用性**: 共通モーダルによる開発効率化
- **レスポンシブ**: モバイル・デスクトップ対応

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 