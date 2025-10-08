'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Checkbox,
  Divider,
  FormGroup,
  FormControlLabel,
  TextField,
  Button,
} from '@mui/material';
import { itemCategory } from '@/app/ec/(core)/constants/itemCategory';
import {
  cardCondition,
  boxCondition,
} from '@/app/ec/(core)/constants/condition';
import { mallSpecialtyConditions } from '@/app/ec/(core)/constants/specialtyCondition';
import { boxType } from '@/app/ec/(core)/constants/boxType';
import { useISettingConstant } from '@/app/ec/(core)/hooks/useISettingConstant';
import { useItemOption } from '@/app/ec/(core)/hooks/useItemOption';
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
import { CustomError } from '@/api/implement';
import { prefectures } from '@/constants/prefectures';
import { useAppAuth } from '@/providers/useAppAuth';
import { MycaPosApiClient } from 'api-generator/client';
import { createClientAPI } from '@/api/implement';
import { MycaAppGenre } from 'backend-core';
import {
  useEcStore,
  GetEcStoreResponse,
} from '@/app/ec/(core)/hooks/useEcStore';

/**
 * PC版用の絞り込みサイドメニューコンポーネント
 * 一覧画面内に固定表示される
 */
export const FilterSidebar = () => {
  // カスタムフックの初期化
  const { getSettingConstants } = useISettingConstant();
  const { fetchItemOptions } = useItemOption();
  const { getAccountInfo } = useAppAuth();
  const { isEcLoading } = useEcLoading();
  const { getEcStore } = useEcStore();

  // 商品オプションの状態管理
  const [itemOptions, setItemOptions] = useState<
    | Awaited<
        ReturnType<MycaPosApiClient['mycaItem']['getMycaItemFindOption']>
      >['searchElements']
    | null
  >(null);
  const [settingConstants, setSettingConstants] = useState<any>(null);
  const [genres, setGenres] = useState<MycaAppGenre[]>([]);
  const [stores, setStores] = useState<GetEcStoreResponse | null>(null);

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

  // お届け先の選択
  const [prefecture, setPrefecture] = useState<number>(() => {
    const prefectureParam = searchParams.get('prefecture');
    if (prefectureParam) {
      return Number(prefectureParam);
    }

    const accountInfo = getAccountInfo();
    if (accountInfo instanceof Promise) {
      accountInfo.then((info) => {
        if (!(info instanceof CustomError)) {
          setPrefecture(
            prefectures.find((p) => p.name === info.prefecture)?.id ?? 13,
          );
        }
      });
    }
    return 13; // デフォルトは東京都
  });

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
    const storeIds = params.get('storeIds')
      ? params.get('storeIds')?.split(',') || []
      : [];
    const specialties = params.get('specialty')
      ? params.get('specialty')?.split(',') || []
      : [];
    const boxTypes = params.get('displaytype2')
      ? params.get('displaytype2')?.split(',') || []
      : [];

    return {
      hasStock,
      category,
      cardConditions,
      boxConditions,
      storeIds,
      specialties,
      boxTypes,
    };
  };

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

  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>(() => {
    const storeIds = searchParams.get('storeIds');
    return storeIds ? storeIds.split(',') : [];
  });

  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(
    () => {
      const specialties = searchParams.get('specialty');
      return specialties ? specialties.split(',') : [];
    },
  );

  const [selectedBoxTypes, setSelectedBoxTypes] = useState<string[]>(() => {
    const boxTypes = searchParams.get('displaytype2');
    return boxTypes ? boxTypes.split(',') : [];
  });

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
    setSelectedStoreIds(initialState ? initialState.storeIds : []);
    setSelectedSpecialties(initialState ? initialState.specialties : []);
    setSelectedBoxTypes(initialState ? initialState.boxTypes : []);
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

  // ジャンル情報の取得
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const clientAPI = createClientAPI();
        const genreRes = await clientAPI.ec.getEcGenre();
        if ('genres' in genreRes) {
          setGenres(genreRes.genres);
        }
      } catch (error) {
        console.error('Failed to fetch genres:', error);
      }
    };

    fetchGenres();
  }, []);

  // 店舗情報の取得
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const storeData = await getEcStore();
        setStores(storeData);
      } catch (error) {
        console.error('Failed to fetch stores:', error);
      }
    };

    fetchStores();
  }, []);

  // 商品オプションの取得
  useEffect(() => {
    const getItemOptions = async () => {
      // genreがIDの場合、対応するnameを取得
      const genreData = genres.find((g) => g.id === Number(genre));
      const genreHandle = genreData?.name || genre;

      const apiClient = new MycaPosApiClient({
        BASE: `${process.env.NEXT_PUBLIC_EC_ORIGIN}/api`,
      });
      try {
        const response = await apiClient.mycaItem.getMycaItemFindOption({
          genreHandle: genreHandle,
          categoryHandle: 'CARD',
        });

        // APIレスポンスの形式に合わせて変換
        const transformedOptions = response.searchElements.map((element) => ({
          label: element.metaLabel,
          columnOnItems: element.columnOnPosItem,
          options: element.options.map((opt) => ({
            option_label: opt.label,
            option_value: opt.value,
          })),
        }));

        setItemOptions(transformedOptions);
      } catch (error) {
        console.error('Failed to fetch item options:', error);
      }
    };

    if (genre && genres.length > 0) {
      getItemOptions();
    }
  }, [genre, genres]);

  // URLパラメータからフィルター状態を読み込む
  useEffect(() => {
    const newSelectedOptions: Record<string, string[]> = {};
    const newSearchFilters: Record<string, string> = {};

    if (itemOptions) {
      itemOptions.forEach((option) => {
        // 選択されたオプション値を取得
        const paramValue = searchParams.get(option.columnOnItems);
        if (paramValue) {
          newSelectedOptions[option.columnOnItems] = paramValue.split(',');
        }

        // 検索フィルターを取得
        const searchValue = searchParams.get(`search_${option.columnOnItems}`);
        if (searchValue) {
          newSearchFilters[option.columnOnItems] = searchValue;
        }
      });
    }

    setSelectedOptions(newSelectedOptions);
    setSearchFilters(newSearchFilters);
  }, [searchParams, itemOptions]);

  // オプション選択の変更を処理する関数
  const handleOptionChange = (
    category: string,
    value: string,
    checked: boolean,
  ) => {
    setSelectedOptions((prev) => {
      const currentCategoryValues = prev[category] || [];

      if (checked) {
        // 選択された場合は追加
        setSelectedCategory((prev) =>
          prev.includes(ItemCategoryHandle.CARD)
            ? prev
            : [...prev, ItemCategoryHandle.CARD],
        );
        return {
          ...prev,
          [category]: [...currentCategoryValues, value],
        };
      } else {
        // 選択解除された場合は削除
        return {
          ...prev,
          [category]: currentCategoryValues.filter((v) => v !== value),
        };
      }
    });
  };

  // 検索フィルターの変更を処理する関数
  const handleSearchFilterChange = (category: string, value: string) => {
    setSearchFilters((prev) => {
      const newState = {
        ...prev,
        [category]: value,
      };
      return newState;
    });
  };

  // フィルタリングされたオプションを取得する関数
  const getFilteredOptions = (options: any[], searchTerm: string) => {
    if (!searchTerm || searchTerm.trim() === '') {
      return options;
    }

    return options.filter((option) =>
      option.option_label.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  };

  // カテゴリの選択を処理
  const handleCategoryChange = (value: string) => {
    setSelectedCategory((prev) => {
      if (prev.includes(value)) {
        switch (value) {
          case ItemCategoryHandle.CARD:
            setSelectedCardConditions([]);
            setSelectedBoxTypes([]);
            break;
          case ItemCategoryHandle.BOX:
            setSelectedBoxConditions([]);
            setSelectedBoxTypes([]);
            break;
        }
        return prev.filter((item) => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  // カード状態の選択を処理
  const handleCardConditionChange = (value: string) => {
    setSelectedCardConditions((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      } else {
        setSelectedCategory((prev) =>
          prev.includes(ItemCategoryHandle.CARD)
            ? prev
            : [...prev, ItemCategoryHandle.CARD],
        );
        return [...prev, value];
      }
    });
  };

  // ボックス状態の選択を処理
  const handleBoxConditionChange = (value: string) => {
    setSelectedBoxConditions((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      } else {
        setSelectedCategory((prev) =>
          prev.includes(ItemCategoryHandle.BOX)
            ? prev
            : [...prev, ItemCategoryHandle.BOX],
        );
        return [...prev, value];
      }
    });
  };

  // 店舗選択の処理
  const handleStoreChange = (storeId: string) => {
    setSelectedStoreIds((prev) => {
      if (prev.includes(storeId)) {
        return prev.filter((id) => id !== storeId);
      } else {
        return [...prev, storeId];
      }
    });
  };

  // specialty選択の処理
  const handleSpecialtyChange = (value: string) => {
    setSelectedSpecialties((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  // boxType選択の処理
  const handleBoxTypeChange = (value: string) => {
    setSelectedBoxTypes((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      } else {
        setSelectedCategory((prev) =>
          prev.includes(ItemCategoryHandle.BOX)
            ? prev
            : [...prev, ItemCategoryHandle.BOX],
        );
        return [...prev, value];
      }
    });
  };

  // 検索ボタンクリック時の処理
  const handleSearch = () => {
    // sessionStorageをクリア（新しい絞り込み条件での検索のため）
    EcSessionStorageManager.clear();

    const params = new URLSearchParams(window.location.search);

    // 各フィルター項目をクエリパラメータに設定
    if (showHasStock) params.set('hasStock', 'true');
    else params.delete('hasStock');

    if (selectedCategory.length > 0)
      params.set('category', selectedCategory.join(','));
    else params.delete('category');

    if (selectedCardConditions.length > 0)
      params.set('cardConditions', selectedCardConditions.join(','));
    else params.delete('cardConditions');

    if (selectedBoxConditions.length > 0)
      params.set('boxConditions', selectedBoxConditions.join(','));
    else params.delete('boxConditions');

    if (selectedStoreIds.length > 0)
      params.set('storeIds', selectedStoreIds.join(','));
    else params.delete('storeIds');

    if (selectedSpecialties.length > 0)
      params.set('specialty', selectedSpecialties.join(','));
    else params.delete('specialty');

    if (selectedBoxTypes.length > 0)
      params.set('displaytype2', selectedBoxTypes.join(','));
    else params.delete('displaytype2');

    // 選択されたオプションをパラメータに設定
    Object.entries(selectedOptions).forEach(([category, values]) => {
      if (values.length > 0) {
        params.set(category, values.join(','));
      } else {
        params.delete(category);
      }
    });

    // URLを更新
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.push(newUrl, { scroll: false });

    // 最後に検索した状態を保存
    setLastSearchState({
      hasStock: showHasStock,
      category: selectedCategory,
      cardConditions: selectedCardConditions,
      boxConditions: selectedBoxConditions,
      storeIds: selectedStoreIds,
      specialties: selectedSpecialties,
      boxTypes: selectedBoxTypes,
    });
  };

  // すべてクリア処理
  const handleClearAll = () => {
    // すべての状態をリセット
    setShowHasStock(false);
    setSelectedCategory([]);
    setSelectedCardConditions([]);
    setSelectedBoxConditions([]);
    setSelectedStoreIds([]);
    setSelectedSpecialties([]);
    setSelectedBoxTypes([]);

    // 最後に検索した状態もクリア
    setLastSearchState(null);

    // URLからフィルター関連のクエリパラメータのみを削除
    const params = new URLSearchParams(window.location.search);
    params.delete('hasStock');
    params.delete('category');
    params.delete('cardConditions');
    params.delete('boxConditions');
    params.delete('storeIds');
    params.delete('specialty');
    params.delete('displaytype2');

    // 選択されたオプションをクリア
    Object.keys(selectedOptions).forEach((key) => {
      params.delete(key);
    });
    setSelectedOptions({});
    setSearchFilters({});

    // ページ遷移せずにURLを更新
    const newUrl = `${window.location.pathname}${
      params.toString() ? `?${params.toString()}` : ''
    }`;
    window.history.pushState({}, '', newUrl);
  };

  return (
    <Box
      sx={{
        width: '280px',
        minHeight: '100vh',
        bgcolor: 'white',
        borderRight: '1px solid',
        borderColor: 'grey.200',
        p: 2,
        position: 'sticky',
        top: 0,
        overflowY: 'auto',
        maxHeight: '100vh',
      }}
    >
      {/* ヘッダー */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" sx={{ mb: 1 }}>
          絞り込み
        </Typography>
      </Box>

      {/* フィルター内容 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* 在庫状況フィルター */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            在庫状況
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={showHasStock}
                  onChange={(e) => setShowHasStock(e.target.checked)}
                />
              }
              label={
                <Typography variant="body2" color="grey.700">
                  在庫のない商品を表示しない
                </Typography>
              }
            />
          </FormGroup>
        </Box>

        <Divider />

        {/* 商品カテゴリフィルター */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            商品カテゴリ
          </Typography>
          <FormGroup>
            {itemCategory.map((category) => (
              <FormControlLabel
                key={category.value}
                control={
                  <Checkbox
                    size="small"
                    checked={selectedCategory.includes(category.value)}
                    onChange={() => handleCategoryChange(category.value)}
                  />
                }
                label={
                  <Typography variant="body2" color="grey.700">
                    {category.label}
                  </Typography>
                }
              />
            ))}
          </FormGroup>
        </Box>

        <Divider />

        {/* カード状態フィルター */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            カード状態
          </Typography>
          <FormGroup>
            {cardCondition.map((condition) => (
              <FormControlLabel
                key={condition.value}
                control={
                  <Checkbox
                    size="small"
                    checked={selectedCardConditions.includes(condition.value)}
                    onChange={() => handleCardConditionChange(condition.value)}
                  />
                }
                label={
                  <Typography variant="body2" color="grey.700">
                    {condition.label}
                  </Typography>
                }
              />
            ))}
          </FormGroup>
        </Box>

        <Divider />

        {/* 店舗選択フィルター */}
        {stores && stores.length > 0 && (
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              店舗
            </Typography>
            <FormGroup>
              {stores.map((store) => (
                <FormControlLabel
                  key={store.id}
                  control={
                    <Checkbox
                      size="small"
                      checked={selectedStoreIds.includes(store.id.toString())}
                      onChange={() => handleStoreChange(store.id.toString())}
                    />
                  }
                  label={
                    <Typography variant="body2" color="grey.700">
                      {store.display_name || `店舗${store.id}`}
                    </Typography>
                  }
                />
              ))}
            </FormGroup>
          </Box>
        )}

        <Divider />

        {/* specialty フィルター */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            特殊状態
          </Typography>
          <FormGroup>
            {mallSpecialtyConditions
              .filter((condition) => condition.value !== undefined)
              .map((condition) => (
                <FormControlLabel
                  key={condition.value}
                  control={
                    <Checkbox
                      size="small"
                      checked={selectedSpecialties.includes(condition.value)}
                      onChange={() => handleSpecialtyChange(condition.value)}
                    />
                  }
                  label={
                    <Typography variant="body2" color="grey.700">
                      {condition.label}
                    </Typography>
                  }
                />
              ))}
          </FormGroup>
        </Box>

        <Divider />

        {/* ボックスタイプフィルター */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            ボックスタイプ
          </Typography>
          <FormGroup>
            {boxType.map((type) => (
              <FormControlLabel
                key={type.value}
                control={
                  <Checkbox
                    size="small"
                    checked={selectedBoxTypes.includes(type.value)}
                    onChange={() => handleBoxTypeChange(type.value)}
                  />
                }
                label={
                  <Typography variant="body2" color="grey.700">
                    {type.label}
                  </Typography>
                }
              />
            ))}
          </FormGroup>
        </Box>

        <Divider />

        {/* ボックス状態フィルター */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            ボックス状態
          </Typography>
          <FormGroup>
            {boxCondition.map((condition) => (
              <FormControlLabel
                key={condition.value}
                control={
                  <Checkbox
                    size="small"
                    checked={selectedBoxConditions.includes(condition.value)}
                    onChange={() => handleBoxConditionChange(condition.value)}
                  />
                }
                label={
                  <Typography variant="body2" color="grey.700">
                    {condition.label}
                  </Typography>
                }
              />
            ))}
          </FormGroup>
        </Box>

        {/* 動的に生成される検索オプション */}
        {itemOptions &&
          itemOptions.map((option, optionIndex) => (
            <Box key={optionIndex}>
              <Divider sx={{ mb: 2 }} />

              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                {option.label}
              </Typography>

              {/* 検索フィールド */}
              <TextField
                placeholder="検索"
                size="small"
                fullWidth
                sx={{ mb: 1 }}
                value={searchFilters[option.columnOnItems] || ''}
                onChange={(e) =>
                  handleSearchFilterChange(option.columnOnItems, e.target.value)
                }
              />

              {/* チェックボックスオプション - フィルタリング適用 */}
              <Box sx={{ height: '300px', overflow: 'auto' }}>
                <FormGroup>
                  {getFilteredOptions(
                    option.options || [],
                    searchFilters[option.columnOnItems] || '',
                  ).map((optionItem, optionItemIndex) => (
                    <FormControlLabel
                      key={optionItemIndex}
                      control={
                        <Checkbox
                          checked={
                            selectedOptions[option.columnOnItems]?.includes(
                              String(optionItem.option_value),
                            ) || false
                          }
                          onChange={(e) =>
                            handleOptionChange(
                              option.columnOnItems,
                              String(optionItem.option_value),
                              e.target.checked,
                            )
                          }
                          size="small"
                        />
                      }
                      label={
                        <Typography variant="body2" color="grey.700">
                          {optionItem.option_label || 'オプション'}
                        </Typography>
                      }
                    />
                  ))}
                </FormGroup>
              </Box>
            </Box>
          ))}
      </Box>

      {/* フッター - 固定位置 */}
      <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
        {/* お届け先選択エリア */}
        <Box sx={{ mb: 2 }}>
          <PrefectureSelect defaultPrefectureId={prefecture} />
        </Box>

        {/* アクションボタン */}
        <Button
          variant="contained"
          fullWidth
          sx={{
            mb: 1,
            bgcolor: '#d32f2f',
            '&:hover': { bgcolor: '#b71c1c' },
          }}
          onClick={handleSearch}
          disabled={isEcLoading}
        >
          検索
        </Button>
        <Button
          fullWidth
          sx={{
            color: 'text.secondary',
            bgcolor: 'grey.500',
            '&:hover': {
              bgcolor: 'grey.700',
            },
            '&:focus': {
              bgcolor: 'grey.700',
            },
          }}
          onClick={handleClearAll}
        >
          すべてクリア
        </Button>
      </Box>
    </Box>
  );
};
