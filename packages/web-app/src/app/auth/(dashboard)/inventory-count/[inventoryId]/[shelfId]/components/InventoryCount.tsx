import { InventoryAPIRes } from '@/api/frontend/inventory/api';
import { ItemAPIRes } from '@/api/frontend/item/api';
import { ProductApiRes } from '@/api/frontend/product/api';
import { SelectedProducts } from '@/app/auth/(dashboard)/inventory-count/[inventoryId]/[shelfId]/components/SelectedProducts';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { ColumnDef, CustomTable } from '@/components/tables/CustomTable';
import { ItemImage } from '@/feature/item/components/ItemImage';
import {
  ItemSearchState,
  useItemSearch,
} from '@/feature/item/hooks/useItemSearch';
import { ProductCountSearchLayout } from '@/feature/products/components/searchTable/ProductCountSearchLayout';
import { useStore } from '@/contexts/StoreContext';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Button, IconButton, Stack, Typography } from '@mui/material';
import {
  useState,
  useCallback,
  useMemo,
  Dispatch,
  SetStateAction,
} from 'react';
import { ScanAddProductButton } from '@/feature/products/components/ScanAddProductButton';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { MultipleProductModal } from '@/feature/products/components/MultipleProductModal';
import { ItemText } from '@/feature/item/components/ItemText';
import { getConditionDisplayName } from '@/feature/products/utils/conditionDisplayName';

export interface CountableItemType {
  id: ItemAPIRes['get']['items'][number]['id'];
  display_name: ItemAPIRes['get']['items'][number]['display_name'];
  expansion: ItemAPIRes['get']['items'][number]['expansion'];
  cardnumber: ItemAPIRes['get']['items'][number]['cardnumber'];
  rarity: ItemAPIRes['get']['items'][number]['rarity'];
  sell_price: ItemAPIRes['get']['items'][number]['sell_price'];
  image_url: ItemAPIRes['get']['items'][number]['image_url'];
  products?: Array<CountableProductType>;
  displayNameWithMeta: string;
}

export interface CountableProductType {
  id: ProductApiRes['listProducts']['products'][number]['id'];
  display_name: ItemAPIRes['get']['items'][number]['display_name'];
  displayNameWithMeta: string;
  genre: {
    id: ItemAPIRes['get']['items'][number]['genre_id'];
    displayName: ItemAPIRes['get']['items'][number]['genre_display_name'];
  };
  category: {
    id: ItemAPIRes['get']['items'][number]['category_id'];
    displayName: ItemAPIRes['get']['items'][number]['category_display_name'];
  };
  expansion: ItemAPIRes['get']['items'][number]['expansion'];
  cardnumber: ItemAPIRes['get']['items'][number]['cardnumber'];
  rarity: ItemAPIRes['get']['items'][number]['rarity'];
  stock_number: ProductApiRes['listProducts']['products'][number]['stock_number'];
  real_stock_number?: number; //追加実際の在庫数を表示
  sell_price: ProductApiRes['listProducts']['products'][number]['sell_price'];
  specific_sell_price: ProductApiRes['listProducts']['products'][number]['specific_sell_price']; //独自価格
  condition: {
    id: ProductApiRes['listProducts']['products'][number]['condition_option_id'];
    displayName: ProductApiRes['listProducts']['products'][number]['condition_option_display_name'];
  };
  image_url: ItemAPIRes['get']['items'][number]['image_url'];
  current_stock_number?: number | null;
  product__average_wholesale_price?: number | null;
  is_injected_wholesale_price?: boolean;
  wholesale_price_history_id?: number;
}

interface ProductCountProps {
  shelfs: InventoryAPIRes['getShelfs']['shelfs'];
  selectedShelf: InventoryAPIRes['getShelfs']['shelfs'][number] | null;
  setSelectedShelf: Dispatch<
    SetStateAction<InventoryAPIRes['getShelfs']['shelfs'][number] | null>
  >;
  productsByShelf: {
    [key: number]: CountableProductType[];
  };
  handleAddProducts: (newProduct: CountableProductType) => void;
  handleRemoveProduct: (shelfId: number, productId: number) => void;
  handleUpdateProductStock: (
    shelfId: number,
    productId: number,
    newStock: number,
  ) => void;
  handleAddProductsByShelf: () => Promise<void>;
  handleEditInventory: () => void;
  isPostLoading?: boolean;
}

export const InventoryCount = ({
  shelfs,
  selectedShelf,
  setSelectedShelf,
  productsByShelf,
  handleAddProducts,
  handleRemoveProduct,
  handleUpdateProductStock,
  handleAddProductsByShelf,
  handleEditInventory,
  isPostLoading,
}: ProductCountProps) => {
  const { store } = useStore();

  // 検索状態を管理
  const { searchState, setSearchState, performSearch } = useItemSearch(
    store.id,
    {
      isActive: true,
    },
  );
  const [countableItems, setCountableItems] = useState<CountableItemType[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [expandedItemIds, setExpandedItemIds] = useState<Set<number>>(
    new Set(),
  );
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isMultipleProductModalOpen, setIsMultipleProductModalOpen] =
    useState<boolean>(false);
  const [multipleProducts, setMultipleProducts] = useState<
    BackendProductAPI[0]['response']['200']['products']
  >([]);

  // 検索結果を追加するコールバック関数
  const addSearchResult = useCallback((searchState: ItemSearchState) => {
    setCountableItems((prevItems) => {
      const newItems = searchState.searchResults
        .filter(
          (newItem) =>
            !prevItems.some((prevItem) => prevItem.id === newItem.id),
        )
        .map((item) => {
          const products: CountableProductType[] = item.products?.map(
            (product) => ({
              id: product.id,
              sell_price: product.sell_price,
              specific_sell_price: product.specific_sell_price,
              stock_number: 1, // デフォルトの在庫数を1に設定
              real_stock_number: product.stock_number, //実際の在庫数を保存
              display_name: item.display_name,
              displayNameWithMeta: product.displayNameWithMeta,
              genre: {
                id: item.genre_id,
                displayName: item.genre_display_name,
              },
              category: {
                id: item.category_id,
                displayName: item.category_display_name,
              },
              expansion: item.expansion,
              cardnumber: item.cardnumber,
              rarity: item.rarity,
              image_url: item.image_url,
              condition: {
                id: product.condition_option_id,
                displayName: getConditionDisplayName(product),
              },
            }),
          );
          return {
            id: item.id,
            display_name: item.display_name,
            expansion: item.expansion,
            cardnumber: item.cardnumber,
            rarity: item.rarity,
            sell_price: item.sell_price,
            image_url: item.image_url,
            products,
            genre_display_name: item.genre_display_name,
            category_display_name: item.category_display_name,
            displayNameWithMeta: item.displayNameWithMeta,
          };
        });
      return [...prevItems, ...newItems];
    });
    setHasMore(searchState.searchResults.length === searchState.itemsPerPage);
  }, []);

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
                  ? { ...product, stock_number: newQuantity }
                  : product,
              ),
            }
          : item,
      ),
    );
  };

  // 商品の展開/折りたたみを切り替える関数
  const toggleExpand = (itemId: number) => {
    setExpandedItemIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // 商品の展開
  const expandedItems: CountableItemType[] = useMemo(() => {
    return countableItems.flatMap((item) =>
      expandedItemIds.has(item.id)
        ? [
            item,
            ...(item.products?.slice(1).map((product) => ({
              ...item,
              products: [product],
            })) || []),
          ]
        : [item],
    );
  }, [expandedItemIds, countableItems]);
  const columns: ColumnDef<CountableItemType>[] = [
    {
      header: '商品画像',
      key: 'image_url',
      render: (row) => <ItemImage imageUrl={row.image_url} height={70} />,
    },
    {
      header: '商品名',
      key: 'display_name',
      render: (row) => (
        <Stack direction="column" alignItems="center">
          <ItemText text={row.displayNameWithMeta ?? '-'} />
        </Stack>
      ),
    },
    {
      header: '状態',
      key: 'condition',
      render: (row) => (
        <>
          {row.products && row.products.length > 1 ? (
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="flex-start"
              gap={2}
            >
              <Typography noWrap>
                {row.products && row.products[0]
                  ? row.products[0].condition.displayName
                  : '-'}
              </Typography>
              <IconButton
                onClick={() => toggleExpand(row.id)}
                sx={{ ml: 'auto' }}
              >
                {expandedItemIds.has(row.id) ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Stack>
          ) : (
            <Typography noWrap>
              {row.products && row.products[0]
                ? row.products[0].condition.displayName
                : '-'}
            </Typography>
          )}
        </>
      ),
    },
    {
      header: '販売価格',
      key: 'sellPrice',
      render: (row) => (
        <Typography sx={{ minWidth: '70px' }}>
          ¥{(row.products?.[0].sell_price || 0).toLocaleString()}
        </Typography>
      ),
    },
    {
      header: '登録数',
      key: 'stockNumber',
      render: (row) => (
        <NumericTextField
          value={row.products?.[0].stock_number || 0}
          onChange={(e) =>
            handleQuantityChange(row.id, row.products?.[0].id || 0, e ?? 0)
          }
          sx={{ minWidth: '60px', maxWidth: '70px' }}
        />
      ),
    },
    {
      header: '登録',
      key: 'register',
      render: (row) => (
        <Button
          variant="contained"
          size="small"
          onClick={() =>
            row.products?.[0] && handleAddProducts(row.products[0])
          }
        >
          登録
        </Button>
      ),
    },
  ];

  const handleAddProductToResult = async (
    product: BackendProductAPI[0]['response']['200']['products'][0],
  ) => {
    const newProduct: CountableProductType = {
      ...product,
      stock_number: 1,
      genre: {
        id: product.item_genre_id,
        displayName: product.item_genre_display_name,
      },
      category: {
        id: product.item_category_id,
        displayName: product.item_category_display_name,
      },
      expansion: product.item_expansion,
      cardnumber: product.item_cardnumber,
      rarity: product.item_rarity,
      image_url: product.image_url,
      condition: {
        id: product.condition_option_id,
        displayName: product.condition_option_display_name,
      },
    };

    await handleAddProducts(newProduct);
  };

  const handleOpenMultipleProductModal = () => {
    setIsMultipleProductModalOpen(true);
  };

  const handleAddMultipleProducts = (
    multipleProduct: BackendProductAPI[0]['response']['200']['products'],
  ) => {
    setMultipleProducts(multipleProduct);
  };

  return (
    // 商品検索テーブル
    <>
      <ProductCountSearchLayout
        width="100%"
        height="100%"
        searchState={searchState}
        setSearchState={setSearchState}
        onSearch={performSearch}
        addSearchResult={addSearchResult}
        tableComponent={() => (
          <CustomTable
            columns={columns}
            rows={expandedItems}
            rowKey={(row) => `${row.id}_${row.products?.[0].id}`}
            onScrollToBottom={() => {
              hasMore && setCurrentPage((prev) => (prev += 1));
            }}
            sx={{ height: '500px' }}
          />
        )}
        resultComponent={
          <SelectedProducts
            shelfs={shelfs}
            selectedShelf={selectedShelf}
            setSelectedShelf={setSelectedShelf}
            products={productsByShelf[selectedShelf?.id || 0] || []}
            onRemoveProduct={(productId) =>
              handleRemoveProduct(selectedShelf?.id || shelfs[0]?.id, productId)
            }
            handleAddProducts={(productId, newStock) =>
              handleUpdateProductStock(
                selectedShelf?.id || shelfs[0]?.id,
                productId,
                newStock,
              )
            }
            handleAddProductsByShelf={handleAddProductsByShelf}
            handleEditInventory={handleEditInventory}
            isPostLoading={isPostLoading}
          />
        }
        resultHeaderComponent={
          <ScanAddProductButton
            handleOpenMultipleProductModal={handleOpenMultipleProductModal}
            handleAddMultipleProducts={handleAddMultipleProducts}
            handleAddProductToResult={handleAddProductToResult}
          />
        }
        resetItems={() => setCountableItems([])}
      />
      <MultipleProductModal
        open={isMultipleProductModalOpen}
        handleAddProductToResult={handleAddProductToResult}
        onClose={() => setIsMultipleProductModalOpen(false)}
        multipleProducts={multipleProducts}
      />
    </>
  );
};
