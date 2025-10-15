# EC Core Components Buttons - ボタンコンポーネント

## 目的
ECサイトで使用される特殊なボタンコンポーネントを提供

## 実装されているコンポーネント (1個)

```
buttons/
└── FilterButton.tsx (747行)
```

## 主要実装

### FilterButton.tsx (747行) - 複雑なフィルターボタン
```typescript
'use client';

// 必要なコンポーネントをインポート
import { useState, useMemo, useEffect } from 'react';
import {
  Button,
  Badge,
  Drawer,
  Box,
  Typography,
  Checkbox,
  Divider,
  FormGroup,
  FormControlLabel,
  IconButton,
  TextField,
} from '@mui/material';
import { itemCategory } from '@/app/ec/(core)/constants/itemCategory';
import { cardCondition } from '@/app/ec/(core)/constants/condition';
import CloseIcon from '@mui/icons-material/Close';
import { useISettingConstant } from '@/app/ec/(core)/hooks/useISettingConstant';
import {
  useItemOption,
  ItemType,
  ItemOption,
} from '@/app/ec/(core)/hooks/useItemOption';
import {
  useSearchParams,
  useRouter,
  usePathname,
  useParams,
} from 'next/navigation';
import { ItemCategoryHandle } from '@prisma/client';
import { PrefectureSelect } from '@/app/ec/(core)/components/selects/PrefectureSelect';
import { useEcLoading } from '@/app/ec/(core)/contexts/EcLoadingContext';
import { EcSessionStorageManager } from '@/app/ec/(core)/utils/sessionStorage';

// クエリパラメータ一覧:
// - hasStock: boolean - 在庫があるもののみ表示するか
// - category: string[] - 選択されたカテゴリー (カンマ区切り)
// - cardConditions: string[] - カードのコンディション (カンマ区切り)
// - boxConditions: string[] - 箱のコンディション (カンマ区切り)
// - prefecture: number - 選択された都道府県ID (デフォルト: 13 東京都)
// - その他(itemOptions): ジャンルごとのオプション(find_option)、 mycaアプリ側から取得

export const FilterButton = () => {
  // カスタムフックの初期化
  const { getSettingConstants } = useISettingConstant();
  const { fetchItemOptions } = useItemOption();
  const { isEcLoading } = useEcLoading();
  
  // 商品オプションの状態管理
  const [itemOptions, setItemOptions] = useState<ItemOption[] | null>(null);
  const [settingConstants, setSettingConstants] = useState<any>(null);

  // 選択されたオプションを管理する状態
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string[]>
  >({});

  // URLパラメータとルーティング関連の初期化
  const searchParams = useSearchParams();
  const params = useParams();
  const genre = params.genre as string;
  const router = useRouter();
  const pathname = usePathname();

  // URLからクエリパラメータを取得して初期状態を設定する関数
  const getInitialState = () => {
    if (typeof window === 'undefined') return null;

    const params = new URLSearchParams(window.location.search);

    // 各フィルター項目の初期値を設定
    const hasStock = params.get('hasStock') === 'true';
    const category = params.get('category')
      ? params.get('category')?.split(',') || []
      : [];
    const cardConditions = params.get('cardConditions')
      ? params.get('cardConditions')?.split(',') || []
      : [];
    const boxConditions = params.get('boxConditions')
      ? params.get('boxConditions')?.split(',') || []
      : [];

    return {
      hasStock,
      category,
      cardConditions,
      boxConditions,
    };
  };

  // ドロワーの開閉状態を管理
  const [open, setOpen] = useState(false);

  // 各フィルター状態の管理（URLのクエリパラメータから初期化）
  const [showHasStock, setShowHasStock] = useState(() => {
    const initialState = getInitialState();
    return initialState ? initialState.hasStock : false;
  });

  const [selectedCategory, setSelectedCategory] = useState<string[]>(() => {
    const initialState = getInitialState();
    return initialState ? initialState.category : [];
  });

  const [selectedCardConditions, setSelectedCardConditions] = useState<
    string[]
  >(() => {
    const initialState = getInitialState();
    return initialState ? initialState.cardConditions : [];
  });

  const [selectedBoxConditions, setSelectedBoxConditions] = useState<string[]>(
    () => {
      const initialState = getInitialState();
      return initialState ? initialState.boxConditions : [];
    },
  );

  // アクティブなフィルターの数を管理
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // 初期状態とフィルター状態の管理
  const initialState = useMemo(() => getInitialState(), []);
  const [lastSearchState, setLastSearchState] = useState(initialState);
  const [searchFilters, setSearchFilters] = useState<Record<string, string>>(
    {},
  );

  // URLが変更されたときにフィルター状態を初期化
  useEffect(() => {
    const initialState = getInitialState();

    setShowHasStock(initialState ? initialState.hasStock : false);
    setSelectedCategory(initialState ? initialState.category : []);
    setSelectedCardConditions(initialState ? initialState.cardConditions : []);
    setSelectedBoxConditions(initialState ? initialState.boxConditions : []);
    setLastSearchState(initialState);

    // 選択されたオプションとフィルターも初期化
    const newSelectedOptions: Record<string, string[]> = {};
    const newSearchFilters: Record<string, string> = {};

    if (itemOptions) {
      itemOptions.forEach((option) => {
        const paramValue = searchParams.get(option.columnOnItems);
        if (paramValue) {
          newSelectedOptions[option.columnOnItems] = paramValue.split(',');
        }

        const searchValue = searchParams.get(`search_${option.columnOnItems}`);
        if (searchValue) {
          newSearchFilters[option.columnOnItems] = searchValue;
        }
      });
    }

    setSelectedOptions(newSelectedOptions);
    setSearchFilters(newSearchFilters);
  }, [pathname, searchParams]);

  // 設定定数の取得
  useEffect(() => {
    const fetchSettingConstants = async () => {
      const constants = await getSettingConstants();
      setSettingConstants(constants);
    };

    fetchSettingConstants();
  }, []);

  // 商品オプションの取得
  useEffect(() => {
    if (settingConstants) {
      const getItemOptions = async () => {
        const itemOptions = await fetchItemOptions(
          genre,
          settingConstants,
          ItemType.CARD,
        );
        setItemOptions(itemOptions);
      };
      getItemOptions();
    }
  }, [settingConstants]);

  // オプション変更処理
  const handleOptionChange = (
    category: string,
    value: string,
    checked: boolean,
  ) => {
    setSelectedOptions((prev) => {
      const currentValues = prev[category] || [];
      if (checked) {
        return {
          ...prev,
          [category]: [...currentValues, value],
        };
      } else {
        return {
          ...prev,
          [category]: currentValues.filter((v) => v !== value),
        };
      }
    });
  };

  // 検索フィルター変更処理
  const handleSearchFilterChange = (category: string, value: string) => {
    setSearchFilters((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  // フィルタリングされたオプションを取得
  const getFilteredOptions = (options: any[], searchTerm: string) => {
    if (!searchTerm) return options;
    return options.filter((option) =>
      option.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  };

  // ドロワーの開閉処理
  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  // 最後の検索状態にリセット
  const resetToLastSearchState = () => {
    if (lastSearchState) {
      setShowHasStock(lastSearchState.hasStock);
      setSelectedCategory(lastSearchState.category);
      setSelectedCardConditions(lastSearchState.cardConditions);
      setSelectedBoxConditions(lastSearchState.boxConditions);
    }
  };

  // カテゴリー変更処理
  const handleCategoryChange = (value: string) => {
    setSelectedCategory((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  // カードコンディション変更処理
  const handleCardConditionChange = (value: string) => {
    setSelectedCardConditions((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  // ボックスコンディション変更処理
  const handleBoxConditionChange = (value: string) => {
    setSelectedBoxConditions((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  // 検索実行処理
  const handleSearch = () => {
    const params = new URLSearchParams();

    // 基本フィルター
    if (showHasStock) params.set('hasStock', 'true');
    if (selectedCategory.length > 0) {
      params.set('category', selectedCategory.join(','));
    }
    if (selectedCardConditions.length > 0) {
      params.set('cardConditions', selectedCardConditions.join(','));
    }
    if (selectedBoxConditions.length > 0) {
      params.set('boxConditions', selectedBoxConditions.join(','));
    }

    // 商品オプション
    Object.entries(selectedOptions).forEach(([key, values]) => {
      if (values.length > 0) {
        params.set(key, values.join(','));
      }
    });

    // 検索フィルター
    Object.entries(searchFilters).forEach(([key, value]) => {
      if (value.trim()) {
        params.set(`search_${key}`, value.trim());
      }
    });

    // 現在のクエリパラメータを保持
    const currentParams = new URLSearchParams(window.location.search);
    ['name', 'orderBy', 'prefecture'].forEach((key) => {
      const value = currentParams.get(key);
      if (value) params.set(key, value);
    });

    // セッションストレージをクリア
    EcSessionStorageManager.clear();

    // ページ遷移
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);

    // 検索状態を更新
    setLastSearchState({
      hasStock: showHasStock,
      category: selectedCategory,
      cardConditions: selectedCardConditions,
      boxConditions: selectedBoxConditions,
    });
  };

  // 全てクリア処理
  const handleClearAll = () => {
    setShowHasStock(false);
    setSelectedCategory([]);
    setSelectedCardConditions([]);
    setSelectedBoxConditions([]);
    setSelectedOptions({});
    setSearchFilters({});
  };

  // アクティブフィルター数の計算
  useEffect(() => {
    let count = 0;
    if (showHasStock) count++;
    count += selectedCategory.length;
    count += selectedCardConditions.length;
    count += selectedBoxConditions.length;
    
    Object.values(selectedOptions).forEach((values) => {
      count += values.length;
    });
    
    setActiveFilterCount(count);
  }, [
    showHasStock,
    selectedCategory,
    selectedCardConditions,
    selectedBoxConditions,
    selectedOptions,
  ]);

  return (
    <>
      <Button
        variant="outlined"
        onClick={toggleDrawer(true)}
        sx={{
          borderRadius: 2,
          px: 2,
          py: 1,
          minWidth: 'auto',
        }}
      >
        <Badge
          badgeContent={activeFilterCount}
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              right: -3,
              top: 3,
            },
          }}
        >
          絞り込み
        </Badge>
      </Button>

      <Drawer
        anchor="bottom"
        open={open}
        onClose={toggleDrawer(false)}
        sx={{
          '& .MuiDrawer-paper': {
            height: '80vh',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          },
        }}
      >
        <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* ヘッダー */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              絞り込み
            </Typography>
            <IconButton onClick={toggleDrawer(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* フィルター内容 */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {/* 在庫有無フィルター */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                在庫
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showHasStock}
                      onChange={(e) => setShowHasStock(e.target.checked)}
                    />
                  }
                  label="在庫のある商品のみ表示"
                />
              </FormGroup>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* カテゴリーフィルター */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                カテゴリー
              </Typography>
              <FormGroup>
                {itemCategory.map((category) => (
                  <FormControlLabel
                    key={category.value}
                    control={
                      <Checkbox
                        checked={selectedCategory.includes(category.value)}
                        onChange={() => handleCategoryChange(category.value)}
                      />
                    }
                    label={category.label}
                  />
                ))}
              </FormGroup>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* カードコンディションフィルター */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                カードの状態
              </Typography>
              <FormGroup>
                {cardCondition.map((condition) => (
                  <FormControlLabel
                    key={condition.value}
                    control={
                      <Checkbox
                        checked={selectedCardConditions.includes(condition.value)}
                        onChange={() => handleCardConditionChange(condition.value)}
                      />
                    }
                    label={condition.label}
                  />
                ))}
              </FormGroup>
            </Box>

            {/* 動的商品オプション */}
            {itemOptions?.map((option) => (
              <Box key={option.columnOnItems} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                  {option.displayName}
                </Typography>
                
                {/* 検索フィールド */}
                <TextField
                  size="small"
                  placeholder={`${option.displayName}を検索...`}
                  value={searchFilters[option.columnOnItems] || ''}
                  onChange={(e) =>
                    handleSearchFilterChange(option.columnOnItems, e.target.value)
                  }
                  sx={{ mb: 1, width: '100%' }}
                />

                {/* オプション一覧 */}
                <FormGroup>
                  {getFilteredOptions(
                    option.options,
                    searchFilters[option.columnOnItems] || '',
                  ).map((opt) => (
                    <FormControlLabel
                      key={opt.value}
                      control={
                        <Checkbox
                          checked={
                            selectedOptions[option.columnOnItems]?.includes(
                              opt.value,
                            ) || false
                          }
                          onChange={(e) =>
                            handleOptionChange(
                              option.columnOnItems,
                              opt.value,
                              e.target.checked,
                            )
                          }
                        />
                      }
                      label={opt.name}
                    />
                  ))}
                </FormGroup>
                
                <Divider sx={{ my: 2 }} />
              </Box>
            ))}

            {/* 都道府県選択 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                配送先
              </Typography>
              <PrefectureSelect />
            </Box>
          </Box>

          {/* フッターボタン */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              pt: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Button
              variant="outlined"
              onClick={handleClearAll}
              sx={{ flex: 1 }}
            >
              クリア
            </Button>
            <Button
              variant="contained"
              onClick={handleSearch}
              sx={{ flex: 2 }}
            >
              検索する
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};
```

## 主要な技術実装

### 複雑な状態管理 (FilterButton.tsx - 747行)
- **多重フィルター**: 在庫・カテゴリー・コンディション・動的オプション・都道府県
- **URL同期**: クエリパラメータとの双方向同期
- **状態復元**: ページ遷移時の状態復元機能
- **リアルタイム更新**: フィルター変更時のリアルタイム反映

### 動的オプション処理
- **設定定数**: useISettingConstant による設定値取得
- **商品オプション**: useItemOption による動的オプション取得
- **検索フィルター**: オプション内での検索機能
- **ジャンル依存**: ジャンルごとの異なるオプション表示

### URL パラメータ管理
- **クエリパラメータ**: 複数のフィルター条件をURL に反映
- **状態初期化**: URL からの状態復元
- **ナビゲーション**: router.push による SPA ナビゲーション
- **セッション管理**: EcSessionStorageManager によるセッション制御

### UI/UX 設計
- **ドロワー**: 下からスライドアップするフィルタードロワー
- **バッジ**: アクティブフィルター数の表示
- **検索機能**: 動的オプション内での検索
- **レスポンシブ**: モバイル対応のフルハイトドロワー

## 使用パターン

### 1. 基本的なフィルターボタン
```typescript
import { FilterButton } from './buttons/FilterButton';

const ProductListPage = () => {
  return (
    <div>
      <FilterButton />
      <ProductList />
    </div>
  );
};
```

### 2. カスタムフィルター条件
```typescript
// URLパラメータで初期フィルター状態を設定
const ProductPageWithFilters = () => {
  const router = useRouter();

  const applyPresetFilter = () => {
    router.push('/ec/items/genre/1?hasStock=true&cardConditions=A,B&category=SINGLE');
  };

  return (
    <div>
      <button onClick={applyPresetFilter}>
        高品質カードのみ表示
      </button>
      <FilterButton />
    </div>
  );
};
```

### 3. フィルター状態の監視
```typescript
import { useSearchParams } from 'next/navigation';

const ProductPageWithState = () => {
  const searchParams = useSearchParams();
  
  const hasStock = searchParams.get('hasStock') === 'true';
  const categories = searchParams.get('category')?.split(',') || [];
  const cardConditions = searchParams.get('cardConditions')?.split(',') || [];

  return (
    <div>
      <div>
        アクティブフィルター: 
        {hasStock && '在庫あり '}
        {categories.length > 0 && `カテゴリー(${categories.length}) `}
        {cardConditions.length > 0 && `状態(${cardConditions.length})`}
      </div>
      <FilterButton />
    </div>
  );
};
```

## 関連ディレクトリ
- `../`: ECサイトコアコンポーネント
- `../../hooks/`: カスタムフック（useISettingConstant, useItemOption）
- `../../constants/`: 定数（itemCategory, condition）
- `../../contexts/`: Context（EcLoadingContext）
- `../../utils/`: ユーティリティ（sessionStorage）
- `../selects/`: セレクトコンポーネント（PrefectureSelect）

## 開発ノート
- **複雑性**: 747行の大規模コンポーネント
- **状態管理**: 多重フィルター状態の複雑な管理
- **パフォーマンス**: useMemo・useCallback による最適化
- **UX**: 直感的なフィルター操作・リアルタイム反映
- **拡張性**: 動的オプションによる柔軟な拡張
- **セッション管理**: ページ遷移時の適切なセッション制御

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 