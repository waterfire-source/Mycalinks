import {
  useState,
  useEffect,
  useRef,
  useCallback,
  FC,
  Dispatch,
  SetStateAction,
} from 'react';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  Item,
  Product,
  ItemCategoryHandle,
  Item_Category,
  Item_Genre,
} from '@prisma/client';
import {
  ItemSearchState,
  useItemSearch,
} from '@/feature/item/hooks/useItemSearch';
import { ItemImage } from '@/feature/item/components/ItemImage';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { ItemText } from '@/feature/item/components/ItemText';

// 共通の商品タイプの定義
export interface CountableItemType {
  id: Item['id'];
  display_name: Item['display_name'];
  expansion: Item['expansion'];
  cardnumber: Item['cardnumber'];
  rarity: Item['rarity'];
  sell_price: Item['sell_price'];
  image_url: Item['image_url'];
  products?: Array<CountableProductType>;
  genre_display_name: Item_Genre['display_name']; //ジャンル
  category_display_name: Item_Category['display_name']; //商品種別
  infinite_stock: Item['infinite_stock'];
}

// 選択した商品の詳細型定義（個数指定可能）
export interface CountableProductType {
  id: Product['id'];
  display_name: Item['display_name'];
  displayNameWithMeta: string;
  expansion: Item['expansion'];
  cardnumber: Item['cardnumber'];
  rarity: Item['rarity'];
  stock_number: Product['stock_number'];
  real_stock_number?: number; //追加実際の在庫数を表示
  sell_price: Product['sell_price'];
  specific_sell_price: Product['specific_sell_price']; //独自価格
  condition: {
    id: number | null;
    displayName: string;
  };
  image_url: Item['image_url'];
  item_id?: Item['id'];
  isSpecialPriceProduct?: boolean;
}

// コンポーネントのプロップスの型定義
interface Props {
  width: string;
  height: string;
  handleAddProducts: (newProduct: CountableProductType) => void;
  searchState: ItemSearchState;
  setSearchState: Dispatch<SetStateAction<ItemSearchState>>;
  storeID: number;
  isActive?: boolean;
  category?: ItemCategoryHandle | ItemCategoryHandle[];
  countableItems: CountableItemType[]; //商品の状態
  setCountableItems: Dispatch<SetStateAction<CountableItemType[]>>; //商品の状態を更新する関数
}

// ProductCountSearchTableコンポーネントの定義
const ProductCountSearchTable: FC<Props> = ({
  handleAddProducts,
  storeID,
  isActive,
  category,
  searchState,
  setSearchState,
  countableItems,
  setCountableItems,
}: Props) => {
  // 状態変数の定義
  const [hasMore, setHasMore] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const tableRef = useRef<HTMLDivElement>(null);

  // 買取画面ではisActiveはundefine
  const { performSearch } = useItemSearch(storeID!, {
    isActive,
    category,
  });

  // スクロールハンドラ（テーブル下部までスクロールしたら商品を再取得）
  const handleScroll = useCallback((): void => {
    if (!tableRef.current || searchState.isLoading) return;
    const { scrollTop, scrollHeight, clientHeight } = tableRef.current;
    // スクロールが下端に近づいたら次のページを読み込む
    if (scrollTop + clientHeight >= scrollHeight - 50 && hasMore) {
      setSearchState((prev) => ({
        ...prev,
        currentPage: prev.currentPage + 1,
      }));
    }
  }, [hasMore, storeID, searchState.isLoading]);

  // スクロールイベントリスナーの設定
  useEffect(() => {
    const tableElement = tableRef.current;
    if (tableElement) {
      tableElement.addEventListener('scroll', handleScroll);
      return () => tableElement.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // 数量変更ハンドラ
  const handleQuantityChange = (
    itemId: number,
    productId: number,
    newQuantity: number,
  ) => {
    setCountableItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              products: item.products?.map((product) =>
                product.id === productId
                  ? {
                      ...product,
                      stock_number: item.infinite_stock
                        ? newQuantity
                        : Math.min(newQuantity, product.real_stock_number || 0),
                    }
                  : product,
              ),
            }
          : item,
      ),
    );
  };

  // 商品の展開/折りたたみを切り替える関数
  const toggleExpand = (itemId: number) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // 検索ハンドラ
  const handleSearch = () => {
    setHasMore(true);
    setCountableItems([]);
    performSearch();
  };

  // isActiveが変更された時にsearchStateを更新する
  useEffect(() => {
    setSearchState((prevState) => {
      const newState = {
        ...prevState,
        isActive: isActive,
      };
      return newState;
    });
  }, [isActive]);

  // searchStateのisActiveが変更されたら再検索をかける
  useEffect(() => {
    // ジャンルが取得されていない場合は検索を実行しない
    if (!searchState.selectedGenreId) return;
    if (searchState.isActive === isActive) {
      handleSearch();
    }
  }, [searchState.isActive]);

  // UIのレンダリング
  return (
    <TableContainer
      component={Paper}
      ref={tableRef}
      sx={{
        flexGrow: 1,
        height: '100%',
        overflow: 'auto',
      }}
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                width: '10%',
                textAlign: 'center',
              }}
            >
              商品画像
            </TableCell>
            <TableCell
              sx={{
                width: '40%',
                textAlign: 'center',
              }}
            >
              商品名
            </TableCell>
            <TableCell
              sx={{
                width: '15%',
                textAlign: 'left', // 左寄せに変更
                pl: 6, // 左に少しスペースを追加
              }}
            >
              状態
            </TableCell>
            <TableCell
              sx={{
                width: '10%',
                minWidth: '80px',
                textAlign: 'center',
              }}
            >
              販売価格
            </TableCell>
            {isActive && (
              <TableCell
                sx={{
                  minWidth: '70px',
                  width: '5%',
                  textAlign: 'center',
                }}
              >
                在庫数
              </TableCell>
            )}
            <TableCell
              sx={{
                width: '10%',
                textAlign: 'center',
              }}
            >
              登録数
            </TableCell>
            <TableCell
              sx={{
                width: '10%',
                textAlign: 'center',
              }}
            />
          </TableRow>
        </TableHead>
        <TableBody>
          {countableItems.length === 0 && !searchState.isLoading ? (
            <TableRow>
              <TableCell
                colSpan={isActive ? 6 : 5}
                sx={{
                  textAlign: 'center',
                  py: 4,
                  color: 'text.secondary',
                }}
              >
                {searchState.selectedGenreId
                  ? '該当する商品が見つかりませんでした'
                  : 'ジャンルを選択してください'}
              </TableCell>
            </TableRow>
          ) : (
            countableItems.map((item) => {
              const isExpanded = expandedItems.has(item.id);
              const productsToShow = isExpanded
                ? item.products
                : item.products?.slice(0, 1);
              return productsToShow?.map((product, index) => (
                <TableRow key={`${item.id}-${product.id}`}>
                  {index === 0 && (
                    <>
                      <TableCell
                        rowSpan={isExpanded ? item.products?.length || 1 : 1}
                      >
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <ItemImage imageUrl={item.image_url} height={70} />
                        </Box>
                      </TableCell>
                      <TableCell
                        rowSpan={isExpanded ? item.products?.length || 1 : 1}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="flex-start"
                          gap={2}
                        >
                          <ItemText
                            wrap={true}
                            text={product.displayNameWithMeta || '-'}
                          />
                        </Stack>
                      </TableCell>
                    </>
                  )}
                  <TableCell
                    sx={{
                      borderBottom:
                        !isExpanded ||
                        index === (item.products?.length || 1) - 1
                          ? `1px solid grey.700`
                          : 'none',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        height: '100%',
                        minWidth: 100,
                        maxWidth: 150,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          flexGrow: 1,
                          textAlign: 'center',
                          backgroundColor: '#b82a2a', // 背景色を赤に設定
                          color: 'white', // 文字色を白に設定
                          fontWeight: 'bold',
                          borderRadius: '4px', // 角を丸くする
                        }}
                      >
                        {product.condition.displayName || '-'}
                      </Typography>
                      {index === 0 &&
                      item.products &&
                      item.products.length > 1 ? (
                        <IconButton
                          onClick={() => toggleExpand(item.id)}
                          sx={{ ml: 'auto' }}
                        >
                          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      ) : (
                        <Box sx={{ ml: 'auto', width: 40, height: 40 }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: 'center',
                      borderBottom:
                        !isExpanded ||
                        index === (item.products?.length || 1) - 1
                          ? `1px solid grey.700`
                          : 'none',
                    }}
                  >
                    {product.sell_price !== null
                      ? `¥${
                          product.specific_sell_price
                            ? product.specific_sell_price.toLocaleString()
                            : product.sell_price.toLocaleString()
                        }`
                      : '-'}
                  </TableCell>
                  {isActive && (
                    <TableCell
                      sx={{
                        textAlign: 'center',
                        borderBottom:
                          !isExpanded ||
                          index === (item.products?.length || 1) - 1
                            ? `1px solid grey.700`
                            : 'none',
                      }}
                    >
                      {item.infinite_stock
                        ? '∞'
                        : product.real_stock_number
                        ? `${product.real_stock_number.toLocaleString()}`
                        : '-'}
                    </TableCell>
                  )}
                  <TableCell
                    sx={{
                      borderBottom:
                        !isExpanded ||
                        index === (item.products?.length || 1) - 1
                          ? `1px solid grey.700`
                          : 'none',
                    }}
                  >
                    <NumericTextField
                      value={product.stock_number || 1}
                      onChange={(e) =>
                        handleQuantityChange(item.id, product.id, e ?? 0)
                      }
                      sx={{ minWidth: '90px' }}
                      endSuffix="点"
                      InputProps={{
                        inputProps: {
                          max: item.infinite_stock
                            ? undefined
                            : product.real_stock_number,
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      borderBottom:
                        !isExpanded ||
                        index === (item.products?.length || 1) - 1
                          ? `1px solid grey.700`
                          : 'none',
                    }}
                  >
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleAddProducts(product)}
                    >
                      登録
                    </Button>
                  </TableCell>
                </TableRow>
              ));
            })
          )}
        </TableBody>
      </Table>
      {/* ローディングインジケータ */}
      {searchState.isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress />
        </Box>
      )}
    </TableContainer>
  );
};

export default ProductCountSearchTable;
