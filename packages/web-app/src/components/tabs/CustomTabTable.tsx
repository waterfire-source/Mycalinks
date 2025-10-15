import React, { ReactNode, useState, useEffect, useMemo } from 'react';
import {
  Box,
  Tabs,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  IconButton,
  SxProps,
  Theme,
  Grid,
} from '@mui/material';
import { TabsProps } from '@mui/material/Tabs';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { CustomTabTableStyle } from '@/components/tabs/CustomTabTableStyle';
import {
  CustomTable,
  ColumnDef as CustomTableColumnDef,
} from '@/components/tables/CustomTable';
import RefreshIcon from '@mui/icons-material/Refresh';

/**
 * カラム定義
 *  - filterConditions?: string[] フィルター対象となる値のリスト（指定しなければフィルタリングボタンは表示しない）
 *  - filterConditionsDict?: { [key: string]: string }; ローカルフィルタ時にenumのkeyとvalueを変換する
 *  - onFilterConditionChange?: (value: string) => void フィルターが変更されたときのハンドラ
 *  - isSortable?: boolean ソート可能かどうか
 *  - onSortChange?: サーバーソートの場合
 */
export interface ColumnDef<DataType> extends CustomTableColumnDef<DataType> {
  filterConditions?: string[]; // フィルタ用
  filterDefaultValue?: string; // フィルタのデフォルト値
  filterConditionsDict?: { [key: string]: string }; // ローカルフィルタ用
  onFilterConditionChange?: (value: string) => void; // サーバーフィルタ用またはローカルフィルタリングに副作用を持たせる場合
  isSortable?: boolean; // ソート可能かどうか
  onSortChange?: (direction: 'asc' | 'desc' | undefined) => void; // サーバーソート用
}

/**
 * タブごとの定義
 *
 * - `label`: タブ上に表示するラベル
 * - `filterFn?`: ローカルフィルタ用。渡された場合、タブクリック時にこの関数で `data` を絞り込み表示する
 * - `value?`: サーバーサイドフィルタ用。渡された場合、タブクリック時に `onTabChange(value)` で親に通知してサーバーリクエストを行う想定
 */
export interface TabDef<DataType> {
  label: React.ReactNode;
  filterFn?: (data: DataType[]) => DataType[]; // ローカルフィルタ用(任意)
  value?: string; // サーバーフィルタ用(任意)
}

/*
 * カスタムタブコンポーネントのプロパティ
 *
 * 本コンポーネントは内部で MUI の `<Tabs>` を使用しますが、`value`と`onChange` は独自のステート管理で競合を防ぐため、
 * `TabsProps` からそれらを除外 (`Omit`) しています。代わりに `onTabChange` でサーバーフィルタ用の値を受け取る設計です。
 *
 * ### フィールド概要
 * - **data**: テーブルに表示する元データ（すでにサーバーorローカルで取得済みの配列）
 * - **tabs**: タブの配列。各タブに `label` と、任意で `value` (サーバーサイドフィルタ用) と `filterFn` (ローカルフィルタ用) を定義
 * - **defaultSelectedTabIndex**: 初期選択のタブ
 * - **columns**: テーブルのカラム定義。表示内容やヘッダ、スタイルなどを指定
 * - **rowKey**: 行要素を一意に識別するための関数（key 属性に使用）
 * - **onRowClick**: 行クリック時に呼ばれるハンドラ（任意）
 * - **selectedRow**: 選択中の行（ハイライトなどを行う場合に使用）
 * - **onTabChange**: タブが切り替わったときに呼び出されるコールバック。`tabs` の `value` が存在する場合に通知し、サーバーサイドフィルタに利用できる
 * - **isLoading**: ローディング中フラグ。`true` ならテーブル内に `CircularProgress` を表示
 * - **resetSortConditions**: ソート条件をリセットするための関数（任意）
 * - addFilter: 追加の任意のコンポーネント（フィルター）
 * - addField: 追加の任意のコンポーネント
 * - take: ページネーション用
 * - skip: ページネーション用
 * - totalRow: ページネーション用
 *
 * ### 運用イメージ
 * - **フィルタの種類**: (ローカルフィルタorサーバーサイドフィルタ) x (タブorテーブルヘッダ上部の左側のドロップダウンフィルタor右側のソートフィルタ) = 6通り
 * - **タブローカルフィルタ**: `TabDef` に `filterFn` を持たせる。クリックされたタブの `filterFn` で `data` を絞り込んで表示する。
 * - **タブサーバーサイドフィルタ**: `TabDef` の `value` と `onTabChange` を使い、クリックされたタブの `value` を親に通知 → 親がサーバーリクエスト。
 * - **カラムローカルフィルタ**: `ColumnDef` に `filterConditions` を持たせる。ローカルでのみフィルタリングを行う。
 * - **カラムサーバーサイドフィルタ**: `ColumnDef` に `filterConditions`と`onFilterConditionChange` を持たせる。選択されたフィルタを親に通知 → 親がサーバーリクエスト。
 * - **カラムローカルソート**: `ColumnDef` に `isSortable` を持たせる。選択されたソート条件でローカルソート。
 * - **カラムサーバーソート**: `ColumnDef` に `isSortable` と `onSortChange` を持たせる。選択されたソート条件を親に通知 → 親がサーバーリクエスト。
 */
export interface CustomTabTableProps<DataType>
  extends Omit<TabsProps, 'value' | 'onChange'> {
  data: DataType[];
  tabs: TabDef<DataType>[];
  defaultSelectedTabIndex?: number;
  columns: ColumnDef<DataType>[];
  rowKey: (item: DataType) => string | number;
  onRowClick?: (item: DataType) => void;
  selectedRow?: DataType | null;
  onTabChange?: (value: string) => void; // サーバーフィルタ用
  isLoading?: boolean;
  resetSortConditions?: () => void;
  addFilter?: ReactNode;
  addField?: ReactNode;
  isShowFooterArea?: boolean;
  customFooter?: ReactNode;
  currentPage?: number; // 現在のページ 0 origin
  rowPerPage?: number; // 1ページあたりの件数
  totalRow?: number; // 全件数
  handleRowPerPageChange?: (newTake: number) => void;
  handlePrevPagination?: () => void;
  handleNextPagination?: () => void;
  isSingleSortMode?: boolean; // 並び替えのプルダウンを１つにまとめるか（こんな感じの並び替え項目になる→「商品名 昇順/降順」,「開始時間 昇順/降順」,「終了時間 昇順/降順）
  tableContainerSx?: SxProps<Theme>;
  tableWrapperSx?: SxProps<Theme>;
  tabTableWrapperSx?: SxProps<Theme>;
}
export function CustomTabTable<DataType>(props: CustomTabTableProps<DataType>) {
  const {
    data,
    tabs,
    defaultSelectedTabIndex,
    columns,
    rowKey,
    onRowClick,
    selectedRow,
    onTabChange,
    isLoading = false,
    resetSortConditions,
    addFilter,
    addField,
    isShowFooterArea = false,
    currentPage = 0,
    rowPerPage = 30,
    totalRow,
    handleRowPerPageChange,
    handlePrevPagination,
    handleNextPagination,
    isSingleSortMode = false,
    customFooter,
    tableContainerSx,
    tableWrapperSx,
    tabTableWrapperSx,
    ...restTabsProps
  } = props;

  // タブインデックスの管理
  const [tabIndex, setTabIndex] = useState(() =>
    defaultSelectedTabIndex ?? tabs.length > 0 ? 0 : -1,
  );

  useEffect(() => {
    if (defaultSelectedTabIndex && defaultSelectedTabIndex >= 0) {
      setTabIndex(defaultSelectedTabIndex);
    }
  }, [defaultSelectedTabIndex]);

  // カラムごとのフィルター選択値を管理
  // key: カラムのindex, value: 選択中のフィルター文字列
  const [columnFilters, setColumnFilters] = useState<{
    [colIndex: number]: string;
  }>(
    // 初期値は全てのカラムでフィルターを解除した状態
    (() => {
      const obj: { [index: number]: string } = {};
      columns.forEach((_, idx) => {
        obj[idx] = '';
      });
      return obj;
    })(),
  );
  // カラムごとのソート条件でデフォルト値が設定されている場合は初期値を設定
  useEffect(() => {
    const obj: { [index: number]: string } = {};
    columns.forEach((col, idx) => {
      if (col.filterDefaultValue) {
        obj[idx] = col.filterDefaultValue;
      }
    });
    setColumnFilters(obj);
  }, []);

  // カラムごとの選択中のソート条件
  const [columnSorts, setColumnSorts] = useState<{
    [colIndex: number]: 'asc' | 'desc';
  }>({});

  // 並び替えプルダウンを１つにまとめる場合の状態管理
  const [singleSortState, setSingleSortState] = useState<{
    columnIndex: number;
    direction: 'asc' | 'desc';
  } | null>(null);

  // フィルターやソートエリアを表示するかどうか
  const isShowFilterArea = columns.some(
    (col) =>
      col.filterConditions?.length ||
      col.onFilterConditionChange ||
      col.isSortable,
  );

  // タブ切り替えハンドラ
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
    // サーバーサイドフィルタ用に value を通知
    const tabDef = tabs[newValue];
    if (tabDef.value && onTabChange) {
      onTabChange(tabDef.value);
    }
  };

  // フィルターDropdownが変更されたとき
  const handleFilterChange = (colIndex: number, value: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [colIndex]: value,
    }));
  };

  // 選択中のタブ
  const currentTab = tabs[tabIndex];

  // dataの変更を検知してローカルフィルタとソートを適用
  const outputData = useMemo(() => {
    // まずタブのローカルフィルタを適用
    const tabFilteredData = currentTab?.filterFn
      ? currentTab.filterFn(data)
      : data;

    // 次にカラムごとのローカルフィルタを全て適用
    let columnFilteredData = tabFilteredData;
    columns.forEach((col, colIndex) => {
      const selectedVal = columnFilters[colIndex];
      if (
        col.key &&
        col.filterConditions?.length &&
        col.filterConditionsDict &&
        selectedVal &&
        selectedVal !== ''
      ) {
        columnFilteredData = columnFilteredData.filter((item) => {
          const key: keyof typeof item = col.key as keyof typeof item;
          if (col.filterConditionsDict) {
            return (
              col.filterConditionsDict[item[key] as string] === selectedVal
            );
          } else {
            return item[key] === selectedVal;
          }
        });
      }
    });

    // 最後にソート処理
    const sorted = columnFilteredData;
    const getNestedValue = (obj: any, path?: string): any => {
      return path?.split('.').reduce((acc, key) => acc?.[key], obj);
    };
    if (isSingleSortMode && singleSortState) {
      const col = columns[singleSortState.columnIndex];
      if (col.key) {
        sorted.sort((a, b) => {
          const aValue = getNestedValue(a, col.key);
          const bValue = getNestedValue(b, col.key);

          if (singleSortState.direction === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });
      }
    } else {
      // 既存の複数ソート処理
      for (const [colIndex, col] of columns.entries()) {
        if (col.isSortable && !col.onSortChange) {
          const sort = columnSorts[colIndex];
          if (sort) {
            sorted.sort((a, b) => {
              const key: keyof typeof a = col.key as keyof typeof a;
              if (sort === 'asc') {
                return a[key] > b[key] ? 1 : -1;
              } else {
                return a[key] < b[key] ? 1 : -1;
              }
            });
          }
        }
      }
    }
    return sorted;
  }, [
    data,
    currentTab,
    columns,
    columnFilters,
    columnSorts,
    singleSortState,
    isSingleSortMode,
  ]);

  // ソート条件のリセット
  const handleResetSortConditions = () => {
    setColumnSorts({});
    setSingleSortState(null);
    resetSortConditions?.();
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...tableWrapperSx,
        ...tabTableWrapperSx,
      }}
    >
      {/* タブ */}
      <Box
        sx={{
          borderBottom: '8px solid #b82a2a',
          display: 'flex',
          alignItems: 'center',
          padding: 0,
        }}
      >
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          sx={{
            margin: 0,
            padding: 0,
            minHeight: '31px',
          }}
          {...restTabsProps}
        >
          {tabs.map((tab, index) => (
            <CustomTabTableStyle key={index} label={<Box>{tab.label}</Box>} />
          ))}
        </Tabs>
      </Box>
      {isShowFilterArea && (
        <Grid
          container
          sx={{
            p: 1,
            justifyContent: 'space-between', // 左詰めと右詰め
            alignItems: 'center', // 縦方向の位置を揃える
            columnGap: 1, // 必要なら間隔を調整
            backgroundColor: 'common.white', // 背景色
            borderBottom: '1px solid',
            borderBottomColor: 'grey.200',
            py: 1.5,
            rowGap: 1,
          }}
        >
          {/* フィルタリング用のドロップダウン */}
          <Box sx={{ display: 'flex', gap: 2, pl: 2 }}>
            {columns.map((col, colIndex) => {
              if (!col.key || !col.filterConditions?.length) {
                // フィルタ不要カラムは表示しない
                return null;
              } else {
                const options = col.filterConditions;
                const labelText = col.header;
                return (
                  <FormControl
                    size="small"
                    sx={{
                      minWidth: 100,
                      '@media (min-width: 1400px)': {
                        minWidth: 120,
                      },
                    }}
                    key={colIndex}
                  >
                    <InputLabel
                      id={`filter-label-${colIndex}`}
                      sx={{ color: 'text.primary' }}
                    >
                      {labelText}
                    </InputLabel>
                    <Select
                      labelId={`filter-label-${colIndex}`}
                      label={labelText}
                      value={columnFilters[colIndex]}
                      onChange={(e) => {
                        if (col.onFilterConditionChange) {
                          // サーバーフィルタリングまたはローカルフィルタリングに副作用を持たせる場合
                          col.onFilterConditionChange(e.target.value as string);
                        }
                        handleFilterChange(colIndex, e.target.value as string);
                      }}
                    >
                      <MenuItem value="すべて">{'すべて'}</MenuItem>
                      {options.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                );
              }
            })}
            {/* 追加フィルタリング用コンポーネント */}
            {addFilter}
          </Box>

          {/* ★ ソート用のドロップダウン */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              mr: 1,
              pl: 2,
              alignItems: 'center',
            }}
          >
            <Typography>並び替え</Typography>
            {isSingleSortMode ? (
              // 並び替えプルダウンを１つにまとめる場合
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <Select
                  labelId="single-sort-label"
                  value={
                    singleSortState
                      ? `${singleSortState.columnIndex}-${singleSortState.direction}`
                      : ''
                  }
                  onChange={(e) => {
                    const value = e.target.value as string;
                    if (!value) {
                      setSingleSortState(null);

                      const col = columns.find(
                        (_, idx) => singleSortState?.columnIndex === idx,
                      );
                      if (col?.onSortChange) {
                        col.onSortChange(undefined);
                      }
                      return;
                    }
                    const [colIndex, direction] = value.split('-');
                    const newState = {
                      columnIndex: Number(colIndex),
                      direction: direction as 'asc' | 'desc',
                    };
                    setSingleSortState(newState);

                    // サーバーソート対応
                    const col = columns[Number(colIndex)];
                    if (col.onSortChange) {
                      col.onSortChange(direction as 'asc' | 'desc');
                    }
                  }}
                >
                  <MenuItem value="">
                    <em>選択なし</em>
                  </MenuItem>
                  {columns.map((col, index) => {
                    if (!col.isSortable) return null;
                    return [
                      <MenuItem key={`${index}-asc`} value={`${index}-asc`}>
                        {`${col.header} 昇順`}
                      </MenuItem>,
                      <MenuItem key={`${index}-desc`} value={`${index}-desc`}>
                        {`${col.header} 降順`}
                      </MenuItem>,
                    ];
                  })}
                </Select>
              </FormControl>
            ) : (
              columns.map((col, colIndex) => {
                if (!col.isSortable) return null; // ソート不要カラムは表示しない
                return (
                  <FormControl
                    size="small"
                    sx={{
                      minWidth: 100,
                      '@media (min-width: 1400px)': {
                        minWidth: 120,
                      },
                    }}
                    key={colIndex}
                  >
                    <InputLabel
                      id={`sort-label-${colIndex}`}
                      sx={{ color: 'text.primary' }}
                    >
                      {col.header}
                    </InputLabel>
                    <Select
                      labelId={`sort-label-${colIndex}`}
                      label={col.header}
                      value={columnSorts[colIndex] || ''}
                      onChange={(e) => {
                        if (col.onSortChange) {
                          // サーバーソートの場合
                          col.onSortChange(e.target.value as 'asc' | 'desc');
                          setColumnSorts((prev) => ({
                            ...prev,
                            [colIndex]: e.target.value as 'asc' | 'desc',
                          }));
                        } else {
                          // ローカルソートの場合
                          setColumnSorts((prev) => ({
                            ...prev,
                            [colIndex]: e.target.value as 'asc' | 'desc',
                          }));
                        }
                      }}
                    >
                      {/* 本来指定なしはvalue={undefined}であるべきだが、影響範囲が計り知れないので保留（2025/08/03 Kokai） */}
                      <MenuItem value="">指定なし</MenuItem>{' '}
                      <MenuItem value="asc">昇順</MenuItem>
                      <MenuItem value="desc">降順</MenuItem>
                    </Select>
                  </FormControl>
                );
              })
            )}

            {/* 追加アクションエリア */}
            {resetSortConditions && (
              <IconButton onClick={handleResetSortConditions}>
                <RefreshIcon />
              </IconButton>
            )}
          </Box>
        </Grid>
      )}
      {/* テーブル上部部分 */}
      {addField}

      {!isLoading && data.length === 0 ? (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h6">一つもありません</Typography>
        </Box>
      ) : (
        <>
          {/* テーブル表示部分 */}
          <CustomTable<DataType>
            columns={columns}
            rows={outputData}
            isLoading={isLoading}
            rowKey={rowKey}
            onRowClick={onRowClick}
            selectedRow={selectedRow}
            sx={tableContainerSx}
            tableWrapperSx={tableWrapperSx}
          />
          {/* フッター(任意のDOMを入れられる) */}
          {customFooter && (
            <Box
              sx={{
                width: '100%',
                height: '57px',
                backgroundColor: 'common.white',
                boxShadow: '0px -4px 4px rgba(0, 0, 0, 0.1)',
                '@media (max-width: 1400px)': {
                  height: '51px',
                },
                borderRadius: '8px',
              }}
            >
              {customFooter}
            </Box>
          )}
          {/*  ページネーション用の表示エリア */}
          {isShowFooterArea && (
            <Box
              sx={{
                width: '100%',
                height: '57px',
                backgroundColor: 'common.white',
                boxShadow: '0px -4px 4px rgba(0, 0, 0, 0.1)',
                '@media (max-width: 1400px)': {
                  height: '51px',
                },
              }}
            >
              {/* ▼ ページあたりの行数ドロップダウン */}
              {currentPage !== undefined &&
                rowPerPage !== undefined &&
                totalRow !== undefined &&
                handleRowPerPageChange &&
                handlePrevPagination &&
                handleNextPagination && (
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      py: 1,
                      px: 2,
                      gap: 1,
                    }}
                  >
                    <Typography>ページあたりの行数：</Typography>
                    <FormControl size="small" sx={{ minWidth: 80 }}>
                      <Select
                        value={rowPerPage}
                        onChange={(e) => {
                          handleRowPerPageChange(Number(e.target.value));
                        }}
                      >
                        <MenuItem value={30}>30</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                        <MenuItem value={100}>100</MenuItem>
                      </Select>
                    </FormControl>

                    {/* ▼ 現在のページ範囲表示 */}
                    <Typography sx={{ mx: 2 }}>
                      {1 + currentPage * rowPerPage}〜
                      {(1 + currentPage) * rowPerPage > totalRow
                        ? totalRow
                        : (1 + currentPage) * rowPerPage}
                      / {totalRow}
                    </Typography>

                    {/* ▼ 前へ／次へボタン */}
                    <IconButton
                      onClick={handlePrevPagination}
                      disabled={currentPage === 0}
                    >
                      <KeyboardArrowLeftIcon />
                    </IconButton>
                    <IconButton
                      onClick={handleNextPagination}
                      disabled={(1 + currentPage) * rowPerPage > totalRow}
                    >
                      <KeyboardArrowRightIcon />
                    </IconButton>
                  </Box>
                )}
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
