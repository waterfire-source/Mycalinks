import React, { useState, useEffect, useRef, useCallback } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell as MuiTableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Product } from '@prisma/client';
import { useStore } from '@/contexts/StoreContext';
import { useItemSearch } from '@/feature/item/hooks/useItemSearch';
import { createClientAPI } from '@/api/implement';
import SearchField from '@/components/inputFields/SearchField';
import { useCategory } from '@/feature/category/hooks/useCategory';
import { SaleItem } from '@/app/auth/(dashboard)/stock/sale/register/page';
import { SaleRule } from '@prisma/client';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';
import { getConditionDisplayName } from '@/feature/products/utils/conditionDisplayName';
import { GenreTabComponent } from '@/components/tabs/GenreTabComponent';

const ITEMS_PER_FETCH = 30; // 1回で読み込む件数

export interface CommonProductType {
  id: Product['id'];
  display_name: Product['display_name'];
  displayNameWithMeta: string;
  specific_buy_price: Product['specific_buy_price'];
  specific_sell_price: Product['specific_sell_price'];
  retail_price: Product['retail_price'];
  sell_price: Product['sell_price'];
  buy_price: Product['buy_price'];
  stock_number: Product['stock_number'];
  is_active: Product['is_active'];
  is_buy_only: Product['is_buy_only'];
  image_url: Product['image_url'];
  description: Product['description'];
  created_at: string;
  updated_at: string;
  item_rarity: string;
  item_cardnumber: string;
  // 入荷用
  arrival_count?: number; // 入荷数量
  arrival_price?: number; // 仕入れ値
  condition_option_display_name: string; // 状態名
  child_products: Array<{
    child_product_id: number;
    item_count: number;
  }>;
  consignment_client_id?: Product['consignment_client_id'];
}

// コンポーネントのプロップスの型定義
interface ProductSearchTableProps {
  width?: string | number; // テーブルの幅
  height?: string | number; // テーブルの高さ
  resetFlag?: number; // 検索条件をリセットするためのフラグ
  modalType?: 'sell' | 'buy' | 'arrival'; // モーダルの種類
  selectedSale: SaleItem;
  setSelectedSale: React.Dispatch<React.SetStateAction<SaleItem>>;
  saleRule: SaleRule;
  isActive?: boolean | null; //active商品を取得するかどうか null:指定しない boolean:指定する 親から何も送らない場合：false
}

// スタイル付きのTableCellコンポーネントを定義
// 中央揃え、オーバーフローテキストを省略表示するスタイルを適用
const TableCell = styled(MuiTableCell)(() => ({
  textAlign: 'center',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  padding: '8px',
}));

export const SaleProductSearchTable: React.FC<ProductSearchTableProps> = ({
  width = '100%',
  height = 'auto',
  resetFlag = 0,
  modalType = 'sell',
  setSelectedSale,
  saleRule,
  isActive,
}) => {
  // 状態管理
  const [allSearchResults, setAllSearchResults] = useState<any[]>(
    [],
  );

  const [hasMore, setHasMore] = useState(true); // さらに結果があるかどうか
  const [expandedItems, setExpandedItems] = useState<{
    [key: number]: boolean;
  }>({});

  // カスタムフックを使用してAPI操作を抽象化
  const { store } = useStore();
  // isActiveの処理：送られてこない場合はfalse、他は受け取った値
  const { searchState, setSearchState, performSearch } = useItemSearch(
    store.id,
    {
      isActive:
        isActive === null
          ? undefined
          : typeof isActive === 'undefined'
          ? false
          : isActive,
    },
  );
  const clientAPI = createClientAPI();

  // テーブルコンテナへの参照（無限スクロール用）
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // カテゴリの状態管理を追加
  const { category, fetchCategoryList } = useCategory();

  // カテゴリのデータ取得
  useEffect(() => {
    fetchCategoryList();
  }, [fetchCategoryList]);

  // 初期化と検索
  // resetFlagが変更されたときに実行
  useEffect(() => {
    performSearch();
  }, [resetFlag]);

  // カテゴリ、ジャンル、レアリティの変更を監視して即時検索
  useEffect(() => {
    performSearch();
  }, [
    searchState.cardnumber,
    searchState.searchName,
    searchState.rarity,
    searchState.expansion,
    searchState.selectedCategoryId,
    searchState.selectedGenreId,
    searchState.rarity,
  ]);

  // 追加ハンドラ
  const handleAdd = async (
    product: CommonProductType,
    products: CommonProductType[],
  ): Promise<void> => {
    // 「全て」以外の追加を押した場合
    const productIds =
      product.id !== -1
        ? product.id
        : products.filter((p) => p.id !== -1).map((p) => p.id);
    const productsResponse = await clientAPI.product.listProducts({
      storeID: store.id,
      id: productIds,
    });
    if ('products' in productsResponse) {
      const mappedProducts = productsResponse.products.map(
        (product): CommonProductType => {
          return {
            id: product.id,
            display_name: product.display_name,
            displayNameWithMeta: product.displayNameWithMeta,
            specific_buy_price: product.specific_buy_price,
            specific_sell_price: product.specific_sell_price,
            retail_price: product.retail_price,
            sell_price: product.sell_price,
            buy_price: product.buy_price,
            stock_number: product.stock_number,
            is_active: product.is_active,
            is_buy_only: product.is_buy_only,
            image_url: product.image_url,
            description: product.description,
            created_at: product.created_at.toString(),
            updated_at: product.updated_at.toString(),
            item_rarity: product.item_rarity ?? '',
            item_cardnumber: product.item_cardnumber ?? '',
            condition_option_display_name: product.is_special_price_product
              ? '特価在庫'
              : product.condition_option_display_name,
            child_products: [],
            consignment_client_id: product.consignment_client_id,
          };
        },
      );
      setSelectedSale((prev) => {
        // 既存の商品IDのセットを作成
        const existingProductIds = new Set(
          prev.products.map((p) => p.productId),
        );

        // 重複しない新規商品のみをフィルタリング（consignment_id付き商品を除外）
        const newProducts = mappedProducts
          .filter(
            (product) =>
              !existingProductIds.has(product.id) &&
              !product.consignment_client_id,
          )
          .map((product) => ({
            rule: saleRule,
            productId: product.id,
            productName: product.display_name,
            productDisplayNameWithMeta: product.displayNameWithMeta,
          }));

        return {
          ...prev,
          products: [...prev.products, ...newProducts],
        };
      });
    }
  };

  // スクロールハンドラ（テーブル下部までスクロールしたら商品を再取得）
  const handleScroll = useCallback((): void => {
    if (!tableContainerRef.current || searchState.isLoading) return;

    const { scrollTop, scrollHeight, clientHeight } = tableContainerRef.current;
    // スクロールが下端に近づいたら次のページを読み込む
    if (scrollTop + clientHeight >= scrollHeight - 5 && hasMore) {
      setSearchState((prevState) => ({
        ...prevState,
        currentPage: prevState.currentPage + 1,
      }));
    }
    // ↓eslint無効化：スクロールのみ確認しているため
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchState.isLoading, hasMore]);

  // スクロールイベントリスナーの設定
  useEffect(() => {
    const tableContainer = tableContainerRef.current;
    if (tableContainer) {
      tableContainer.addEventListener('scroll', handleScroll);
      return () => tableContainer.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // 検索結果の処理
  useEffect(() => {
    if (searchState.currentPage == 0) {
      setAllSearchResults([]);
    }
    if (
      searchState.searchResults.length > 0 &&
      searchState.searchResults.length <= ITEMS_PER_FETCH
    ) {
      // 新しい検索結果を処理し、「全て」の状態を追加
      const processedResults = searchState.searchResults.map((item) => {
        if (item.products && item.products.length > 0) {
          // consignment_client_id付きの商品をフィルタリング
          const nonConsignmentProducts = item.products.filter((product) => !product.consignment_client_id);
          
          // 非委託商品の中で最も高い売値と買値を取得
          const highestSellPrice = Math.max(
            ...nonConsignmentProducts.map((product) => product.sell_price ?? 0),
          );
          const highestBuyPrice = Math.max(
            ...nonConsignmentProducts.map((product) => product.buy_price ?? 0),
          );
          
          // 非委託商品の在庫数合計
          const totalNonConsignmentStock = nonConsignmentProducts.reduce(
            (sum, product) => sum + (product.stock_number ?? 0), 0
          );

          // 「全て」の状態を表す新しい商品オブジェクトを作成
          const allProduct: CommonProductType = {
            id: -1, // 一意の負のIDを使用
            condition_option_display_name: '全て',
            specific_sell_price: null,
            specific_buy_price: null,
            buy_price: highestBuyPrice,
            sell_price: highestSellPrice,
            retail_price: null,
            stock_number: totalNonConsignmentStock,
            is_active: true,
            is_buy_only: false,
            display_name: '',
            displayNameWithMeta: '',
            description: null,
            image_url: null,
            created_at: '',
            updated_at: '',
            item_rarity: '',
            item_cardnumber: '',
            child_products: [],
          };

          // 「全て」の状態を商品リストの先頭に追加
          // modalTypeが'arrival'の時は'全て'がいらない
          if (modalType === 'arrival') {
            return {
              ...item,
              products: nonConsignmentProducts,
            };
          }
          return {
            ...item,
            products: [allProduct, ...nonConsignmentProducts],
          };
        }
        return item;
      });

      // 処理された結果を既存の結果に追加（重複を避ける）
      setAllSearchResults((prevResults) => {
        const newResults = processedResults.filter(
          (newItem) =>
            !prevResults.some((prevItem) => prevItem.id === newItem.id),
        );
        return [...prevResults, ...newResults];
      });
      setHasMore(true);
    } else if (searchState.searchResults.length === 0) {
      setHasMore(false);
    }
    // ↓eslint無効化：検索結果のみ確認しているため
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchState.searchResults]);

  // 検索条件変更時のリセット
  useEffect(() => {
    setHasMore(true);
  }, [searchState.cardnumber, searchState.rarity]);

  // 開閉ボタンのクリックハンドラ
  const handleToggleExpand = (itemId: number): void => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  return (
    <Stack
      sx={{
        width,
        height,
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      {/* 検索フォーム */}
      <Box sx={{ width: 'fit-content', py: 1 }}>
        <SearchField
          searchState={searchState}
          setSearchState={setSearchState}
          onSearch={performSearch}
        />
      </Box>

      {/* ジャンルタブ */}
      <Box sx={{ width: '100%' }}>
        <GenreTabComponent setSearchState={setSearchState} />
      </Box>

      {/* カテゴリー選択 */}
      <Box sx={{ py: 1 }}>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel sx={{ color: 'black' }}>カテゴリー</InputLabel>
          <Select
            value={searchState.selectedCategoryId?.toString() || ''}
            onChange={(e) => {
              setSearchState((prev) => ({
                ...prev,
                currentPage: 0,
                selectedCategoryId: e.target.value
                  ? parseInt(e.target.value)
                  : undefined,
              }));
            }}
            label="カテゴリー"
            size="small"
          >
            <MenuItem value="">指定なし</MenuItem>
            {category?.itemCategories?.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.display_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* 検索結果テーブル */}
      <TableContainer
        component={Paper}
        ref={tableContainerRef}
        sx={{
          borderRadius: 1,
          flex: 1,
          overflow: 'auto',
          minHeight: 0,
          '& .MuiTableHead-root': {
            position: 'sticky',
            top: 0,
            zIndex: 1,
          },
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Table sx={{ tableLayout: 'fixed' }} stickyHeader>
          <colgroup>
            <col style={{ width: '40%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '20%' }} />
          </colgroup>
          <TableHead>
            <TableRow sx={{ height: '50px' }}>
              <TableCell
                sx={{
                  backgroundColor: 'grey.700',
                  color: 'white',
                  height: '50px',
                }}
              >
                商品
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: 'grey.700',
                  color: 'white',
                  height: '50px',
                }}
              >
                状態
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: 'grey.700',
                  color: 'white',
                  height: '50px',
                }}
              >
                {modalType === 'sell'
                  ? '販売価格'
                  : modalType === 'buy'
                  ? '買取価格'
                  : '単価'}
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: 'grey.700',
                  color: 'white',
                  height: '50px',
                }}
              >
                現在庫
              </TableCell>
              <TableCell
                sx={{
                  backgroundColor: 'grey.700',
                  color: 'white',
                  height: '50px',
                }}
              ></TableCell>
            </TableRow>
          </TableHead>
          <TableBody sx={{ width: '100%' }}>
            {allSearchResults.map((item, itemIndex) => {
              // 委託商品を除外したproductsを一度だけ計算
              const filteredProducts = item.products?.filter((p: any) => !p.consignment_client_id) ?? [];
              const displayProducts = expandedItems[item.id] ? filteredProducts : filteredProducts.slice(0, 1);
              
              return (
              <React.Fragment key={`${item.id}-${itemIndex}`}>
                {displayProducts.map((product: CommonProductType, productIndex: number) => (
                  <TableRow
                    key={`${item.id}-${product.id}-${itemIndex}-${productIndex}`}
                  >
                    {productIndex === 0 && (
                      <TableCell
                        rowSpan={
                          expandedItems[item.id] ? filteredProducts.length : 1
                        }
                        sx={{
                          textAlign: 'left',
                          height: 'auto',
                          whiteSpace: 'normal',
                          verticalAlign: 'top',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          {item.image_url ? (
                            <Box
                              sx={{
                                width: 46,
                                height: 64,
                                marginRight: 5,
                                marginLeft: 2,
                                flexShrink: 0,
                              }}
                            >
                              <ItemImage
                                imageUrl={item.image_url}
                                fill
                                height={64}
                              />
                            </Box>
                          ) : (
                            <Box
                              sx={{
                                width: 50,
                                height: 50,
                                marginRight: 5,
                                marginLeft: 2,
                                flexShrink: 0,
                                backgroundColor: 'grey.300',
                              }}
                            />
                          )}
                          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                            {/* 0番目は"全て"の状態のため、1番目の商品の名前を表示 */}
                            <ItemText
                              text={
                                filteredProducts[modalType === 'arrival' ? 0 : 1]?.displayNameWithMeta || '-'
                              }
                              sx={{
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                lineHeight: '1.2em',
                                maxHeight: '2.4em',
                              }}
                            />
                          </Box>
                        </Box>
                      </TableCell>
                    )}
                    <TableCell
                      sx={{
                        borderBottom:
                          (!expandedItems[item.id] && productIndex === 0) ||
                          (expandedItems[item.id] &&
                            productIndex === filteredProducts.length - 1)
                            ? undefined
                            : 'none',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography
                          sx={{
                            flexGrow: 1,
                            textAlign: 'center',
                            ...(productIndex === 0 && { marginLeft: '24px' }),
                          }}
                        >
                          {getConditionDisplayName(product)}
                        </Typography>
                        {productIndex === 0 && (
                          <IconButton
                            onClick={() => handleToggleExpand(item.id)}
                            size="small"
                          >
                            {expandedItems[item.id] ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )}
                          </IconButton>
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{
                        borderBottom:
                          (!expandedItems[item.id] && productIndex === 0) ||
                          (expandedItems[item.id] &&
                            productIndex === filteredProducts.length - 1)
                            ? undefined
                            : 'none',
                      }}
                    >
                      <Typography variant="body2">
                        ¥
                        {product.sell_price != null
                          ? (modalType === 'sell' || modalType === 'arrival'
                              ? product.sell_price
                              : product.buy_price ?? '-'
                            ).toLocaleString()
                          : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>{product.stock_number}個</TableCell>
                    <TableCell
                      sx={{
                        borderBottom:
                          (!expandedItems[item.id] && productIndex === 0) ||
                          (expandedItems[item.id] &&
                            productIndex === filteredProducts.length - 1)
                            ? undefined
                            : 'none',
                      }}
                    >
                      <Button
                        variant="contained"
                        color="inherit"
                        size="small"
                        onClick={() => handleAdd(product, filteredProducts)}
                      >
                        追加
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
              );
            })}
            {/* ローディングインジケータ */}
            {searchState.isLoading && (
              <TableRow>
                <TableCell colSpan={9}>
                  <Box
                    sx={{
                      height: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '100%',
                      flexDirection: 'column',
                    }}
                  >
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      読み込み中...
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};
