// 必要なReactフックとコンポーネントをインポート
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  ChangeEvent,
} from 'react';
import {
  Box,
  Typography,
  CardMedia,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Checkbox,
} from '@mui/material';
import { useItemSearch } from '@/feature/item/hooks/useItemSearch';
import SearchField from '@/components/inputFields/SearchField';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { ItemText } from '@/feature/item/components/ItemText';

// コンポーネントのプロップスの型定義
interface ProductSearchTableProps {
  width: string;
  height: string;
  onAddProducts: (newProducts: ProductType[]) => void;
  storeID: number;
}

// 選択した商品の詳細型定義
export interface ProductType {
  id: number;
  itemId: number;
  displayName: string;
  cardNumber: string;
  rarity: string;
  imageUrl: string;
  sellPrice: number | null;
  buyPrice: number | null;
  specificSellPrice: number | null;
  specificBuyPrice: number | null;
  condition: ProductConditionType;
  isChecked: boolean;
}

// 商品の状態の型定義
export interface ProductConditionType {
  conditionOptionId: number | null;
  conditionOptionName: string | null;
}

export const ProductSearchTable: React.FC<ProductSearchTableProps> = ({
  width,
  height,
  onAddProducts,
  storeID,
}) => {
  // 状態変数の定義
  const [products, setProducts] = useState<ProductType[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const tableRef = useRef<HTMLDivElement>(null);

  const { searchState, setSearchState, performSearch } = useItemSearch(
    storeID!,
  );

  useEffect(() => {
    // 新しい商品を既存の商品リストに追加
    setProducts((prevProdcuts) => {
      const newItems = searchState.searchResults.filter(
        (newItem) =>
          !prevProdcuts.some(
            (prevProduct) => prevProduct.itemId === newItem.id,
          ),
      );
      const newProducts: ProductType[] = [];
      for (const item of newItems) {
        const productsInNewItem: ProductType[] = item.products?.map(
          (product) => ({
            id: product.id,
            itemId: item.id,
            displayName: item.display_name ?? '',
            cardNumber: item.cardnumber ?? '',
            rarity: item.rarity ?? '',
            imageUrl: item.image_url ?? '',
            sellPrice: product.sell_price ?? null,
            buyPrice: product.buy_price ?? null,
            specificSellPrice: product.specific_sell_price ?? null,
            specificBuyPrice: product.specific_buy_price ?? null,
            condition: {
              conditionOptionId: product.conditions[0]
                ? product.conditions[0].option_id
                : null,
              conditionOptionName: product.conditions[0]
                ? product.conditions[0].option_name
                : null,
            },
            isChecked: false,
          }),
        );
        newProducts.push(...productsInNewItem);
      }
      return [...prevProdcuts, ...newProducts];
    });
    setHasMore(searchState.searchResults.length === searchState.itemsPerPage);
  }, [searchState.searchResults]);

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

  // 検索ハンドラ
  const handleSearch = () => {
    setHasMore(true);
    setProducts([]);
    performSearch();
  };

  // チェックボックスのハンドラ
  const handleIsCheckedTrue = (product: ProductType) => {
    setProducts((prevProducts) =>
      prevProducts.map((prevProduct) =>
        prevProduct.id === product.id
          ? { ...prevProduct, isChecked: true }
          : prevProduct,
      ),
    );
  };

  const handleIsCheckedFalse = (product: ProductType) => {
    setProducts((prevProducts) =>
      prevProducts.map((prevProduct) =>
        prevProduct.id === product.id
          ? { ...prevProduct, isChecked: false }
          : prevProduct,
      ),
    );
  };

  // 全選択ボタンのハンドラ
  const handleCheckAll = () => {
    setProducts((prevProducts) =>
      prevProducts.map((prevProduct) => ({
        ...prevProduct,
        isChecked: true,
      })),
    );
  };

  const handleAddProduct = (product: ProductType) => {
    onAddProducts([product]);
  };

  const handleAddCheckedProducts = () => {
    const checkedProducts = products.filter((product) => product.isChecked);
    onAddProducts(checkedProducts);

    // チェックを外す
    setProducts((prevProducts) =>
      prevProducts.map((prevProduct) => ({
        ...prevProduct,
        isChecked: false,
      })),
    );
  };

  return (
    <Box sx={{ width, height, display: 'flex', flexDirection: 'column' }}>
      {/* 検索フォーム */}
      <SearchField
        searchState={searchState}
        onSearch={handleSearch}
        setSearchState={setSearchState}
        additions={
          <PrimaryButton variant="contained" onClick={handleAddCheckedProducts}>
            選択した商品を追加
          </PrimaryButton>
        }
      />
      {/* 商品テーブル */}
      <TableContainer
        component={Paper}
        sx={{
          flexGrow: 1,
          height: `calc(${height} - 72px)`, // 56pxの検索ボックスの高さ + 16pxのmarginTop(gapを使うようにしたい)
          marginTop: '16px',
          overflow: 'auto',
        }}
        ref={tableRef}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  color: 'white',
                  width: '10%',
                  backgroundColor: 'grey.700',
                  textAlign: 'center',
                }}
              >
                <PrimaryButton
                  variant="contained"
                  size="small"
                  onClick={() => handleCheckAll()}
                >
                  全選択
                </PrimaryButton>
              </TableCell>
              <TableCell
                sx={{
                  color: 'white',
                  width: '30%',
                  backgroundColor: 'grey.700',
                  textAlign: 'center',
                }}
              >
                商品
              </TableCell>
              <TableCell
                sx={{
                  color: 'white',
                  width: '15%',
                  backgroundColor: 'grey.700',
                  textAlign: 'center',
                }}
              >
                型番
              </TableCell>
              <TableCell
                sx={{
                  color: 'white',
                  width: '10%',
                  backgroundColor: 'grey.700',
                  textAlign: 'center',
                }}
              >
                レアリティ
              </TableCell>
              <TableCell
                sx={{
                  color: 'white',
                  width: '15%',
                  backgroundColor: 'grey.700',
                  textAlign: 'center',
                }}
              >
                状態
              </TableCell>
              <TableCell
                sx={{
                  color: 'white',
                  width: '10%',
                  backgroundColor: 'grey.700',
                  textAlign: 'center',
                }}
              >
                販売価格
              </TableCell>
              <TableCell
                sx={{
                  color: 'white',
                  width: '10%',
                  backgroundColor: 'grey.700',
                  textAlign: 'center',
                }}
              >
                買取価格
              </TableCell>
              <TableCell
                sx={{
                  color: 'white',
                  width: '10%',
                  backgroundColor: 'grey.700',
                  textAlign: 'center',
                }}
              ></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={`${product.itemId}-${product.id}`}>
                <TableCell
                  rowSpan={1}
                  sx={{
                    textAlign: 'center',
                    borderBottom: `1px solid grey.700`,
                  }}
                >
                  <Checkbox
                    sx={{
                      '& .MuiSvgIcon-root': { color: 'primary.main' },
                    }}
                    checked={product.isChecked}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      if (e.target.checked) {
                        handleIsCheckedTrue(product);
                      } else {
                        handleIsCheckedFalse(product);
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>

                {/* 商品画像と商品名 */}
                <TableCell rowSpan={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CardMedia
                      component="img"
                      src={product.imageUrl || ''}
                      alt={product.displayName || ''}
                      sx={{
                        width: 50,
                        height: 70,
                        objectFit: 'cover',
                        marginRight: 2,
                      }}
                    />
                    <ItemText text={product.displayName} />
                  </Box>
                </TableCell>
                {/* 商品の型番 */}
                <TableCell rowSpan={1} sx={{ textAlign: 'center' }}>
                  <Typography>{`${product.cardNumber || '-'}`}</Typography>
                </TableCell>
                {/* 商品のレアリティ */}
                <TableCell rowSpan={1} sx={{ textAlign: 'center' }}>
                  {product.rarity || '-'}
                </TableCell>
                {/* 商品の状態 */}
                <TableCell
                  sx={{
                    borderBottom: `1px solid grey.700`,
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
                    <Typography sx={{ flexGrow: 1, textAlign: 'center' }}>
                      {product.condition.conditionOptionName || '-'}
                    </Typography>
                  </Box>
                </TableCell>
                {/* 商品の販売価格 */}
                <TableCell
                  sx={{
                    textAlign: 'center',
                    borderBottom: `1px solid grey.700`,
                  }}
                >
                  {product.sellPrice !== null
                    ? `¥${
                        product.specificSellPrice
                          ? product.specificSellPrice.toLocaleString()
                          : product.sellPrice.toLocaleString()
                      }`
                    : '-'}
                </TableCell>
                {/* 商品の買取価格 */}
                <TableCell
                  sx={{
                    textAlign: 'center',
                    borderBottom: `1px solid grey.700`,
                  }}
                >
                  {product.buyPrice !== null
                    ? `¥${
                        product.specificBuyPrice
                          ? product.specificBuyPrice.toLocaleString()
                          : product.buyPrice.toLocaleString()
                      }`
                    : '-'}
                </TableCell>
                {/* 追加ボタン */}
                <TableCell
                  sx={{
                    borderBottom: `1px solid grey.700`,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PrimaryButton
                      variant="contained"
                      size="small"
                      onClick={() => handleAddProduct(product)}
                    >
                      追加
                    </PrimaryButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* ローディングインジケータ */}
        {searchState.isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress />
          </Box>
        )}
      </TableContainer>
    </Box>
  );
};
