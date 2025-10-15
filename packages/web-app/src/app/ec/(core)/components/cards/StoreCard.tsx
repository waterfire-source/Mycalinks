import {
  Box,
  Typography,
  Divider,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  Modal,
  IconButton,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { StockSelect } from '@/app/ec/(core)/components/selects/StockSelect';
import { DeleteButton } from '@/components/buttons/DeleteButton';
import { ConditionOptionHandle, SpecialtyHandle } from '@prisma/client';
import {
  ShopChangeModal,
  ShopChangeSelection,
} from '@/app/ec/(core)/components/modals/ShopChangeModal';
import { useState, useMemo } from 'react';
import { SpecialtyTag } from '@/app/ec/(core)/components/tags/SpecialtyTag';
import { ConditionTag } from '@/app/ec/(core)/components/tags/ConditionTag';
import {
  unifyCartProducts,
  type CartUnifiableProduct,
  type CartUnifiedProductGroup,
} from '@/app/ec/(core)/utils/unifyProducts';
import { ImageViewer } from '@/app/ec/(core)/components/viewer/ImageViewer';

// 統合判定用の拡張商品データ型
interface ExtendedProductData {
  ec_stock_number: number;
  condition_option: {
    handle: ConditionOptionHandle | null;
  };
  item: {
    myca_item_id: number | null;
  };
  mycaItem: {
    id: number;
    cardname: string | null;
    cardnumber: string | null;
    rarity: string | null;
    full_image_url: string | null;
    expansion: string | null;
  };
  specialty?: {
    handle: SpecialtyHandle;
  } | null;
  description?: string | null;
  images?: Array<{
    image_url: string;
    description: string;
    order_number: number;
  }> | null;
}

// カート表示用の型（APIレスポンスより簡略化）
type CartStoreProduct = {
  product_id: number;
  total_unit_price: number;
  original_item_count: number;
  store_id?: number;
  product: {
    ec_stock_number: number;
    condition_option: {
      handle: ConditionOptionHandle | null;
    };
    mycaItem: {
      id: number;
      cardname: string | null;
      cardnumber: string | null;
      rarity: string | null;
      full_image_url: string | null;
      expansion: string | null;
    };
    specialty?: {
      handle: SpecialtyHandle;
    } | null;
    description?: string | null;
    images?: Array<{
      image_url: string | null;
      description?: string | null;
    }> | null;
  };
  _isUnified?: boolean;
  _unifiedGroup?: CartUnifiedProductGroup;
};

export type CartStore = {
  store_id: number;
  store?: {
    display_name?: string | null;
  };
  products: CartStoreProduct[];
  total_price: number;
  shipping_fee: number;
  shipping_method_id: number | null;
  shippingMethodCandidates?: Array<{
    id: number;
    display_name: string;
    fee: number;
  }>;
};

/**
 * StoreCardの表示モード
 * - cart: カート画面用（数量変更可能）
 * - order: 注文確認画面用（数量表示のみ）
 */
type ViewMode = 'cart' | 'order';

// ショップ変更後のカート更新情報の型
export type ShopChangeUpdateInfo = {
  parentProductId: number; // 親商品ID
  parentStoreId: number; // 親ストアID
  parentRemainingCount: number; // 親商品の残り数量
  selections: ShopChangeSelection[]; // 選択した商品情報（価格情報を含む）
  shouldRemoveParent: boolean; // 親商品を削除するかどうか
};

type Props = {
  store: {
    store_id: number;
    store: {
      display_name: string | null;
    };
    total_price: number;
    shipping_method_id: number | null;
    shipping_fee: number;
    status: string;
    code: string;
    products: Array<{
      product_id: number;
      original_item_count: number;
      total_unit_price: number;
      product: {
        ec_stock_number: number;
        condition_option: {
          handle: ConditionOptionHandle | null;
        };
        item: {
          myca_item_id: number | null;
        };
        mycaItem: {
          id: number;
          cardname: string | null;
          cardnumber: string | null;
          rarity: string | null;
          full_image_url: string | null;
          expansion: string | null;
        };
        specialty?: {
          handle: SpecialtyHandle;
        } | null;
      };
    }>;
    shippingMethodCandidates?: Array<{
      id: number;
      display_name: string;
      fee: number;
      shipping_days: number;
    }>;
  };
  storeIndex: number;
  totalStores: number;
  onStockChange: (productId: number, value: number) => void;
  onDelete: (productId: number) => void;
  onShopChange: (updateInfo: ShopChangeUpdateInfo) => void;
  onShippingMethodChange: (storeId: number, methodId: number) => void;
  viewMode?: ViewMode;
  // すべてのカートストア情報
  allCartStores?: Array<{
    store_id: number;
    products: Array<{
      product_id: number;
      original_item_count: number;
    }>;
  }>;
  // 統合表示フラグ
  enableUnification?: boolean;
};

/**
 * カート内のストアカードコンポーネント
 * ストア情報、商品リスト、小計情報を表示する
 */
export const StoreCard = ({
  store,
  storeIndex,
  totalStores,
  onStockChange,
  onDelete,
  onShopChange,
  onShippingMethodChange,
  viewMode = 'cart',
  allCartStores = [],
  enableUnification = false,
}: Props) => {
  // ショップ変更モーダルの状態管理
  const [isShopChangeModalOpen, setIsShopChangeModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<CartStoreProduct | null>(null);

  // カート商品の統合処理
  const unifiedProducts = useMemo(() => {
    if (!enableUnification) {
      return null;
    }

    // StoreCardのproductsをCartUnifiableProduct形式に変換
    const cartProducts: CartUnifiableProduct[] = store.products.map(
      (product) => ({
        product_id: product.product_id,
        original_item_count: product.original_item_count,
        product: {
          condition_option: {
            handle: product.product.condition_option.handle || '',
          },
          mycaItem: {
            id: product.product.mycaItem.id,
            cardname: product.product.mycaItem.cardname,
            cardnumber: product.product.mycaItem.cardnumber,
          },
        },
        // 統合判定用の情報を追加
        description:
          (product.product as ExtendedProductData).description || null,
        images: (product.product as ExtendedProductData).images || null,
      }),
    );

    // 統合処理を実行
    return unifyCartProducts(cartProducts);
  }, [store.products, enableUnification]);

  // 表示用の商品リスト（統合有効時は統合済み、無効時は元の商品リスト）
  const displayProducts = useMemo(() => {
    if (enableUnification && unifiedProducts) {
      // 統合された商品グループを表示用フォーマットに変換
      return unifiedProducts
        .map((group) => {
          // グループ内の最初の商品をベースにして統合商品を作成
          const baseProduct = group.products[0];
          const originalProduct = store.products.find(
            (p) => p.product_id === baseProduct.product_id,
          );

          if (!originalProduct) return null;

          // 現在の実際の合計数量を計算（各商品の現在のカート数量の合計）
          const currentTotalQuantity = group.products.reduce((sum, product) => {
            const currentProduct = store.products.find(
              (p) => p.product_id === product.product_id,
            );
            return sum + (currentProduct?.original_item_count || 0);
          }, 0);

          // 更新されたグループ情報を作成
          const updatedGroup = {
            ...group,
            totalQuantity: currentTotalQuantity,
            products: group.products.map((product) => {
              const currentProduct = store.products.find(
                (p) => p.product_id === product.product_id,
              );
              return {
                ...product,
                original_item_count: currentProduct?.original_item_count || 0,
              };
            }),
          };

          return {
            ...originalProduct,
            product_id: originalProduct.product_id, // 元のproduct_idを保持
            original_item_count: currentTotalQuantity,
            _unifiedGroup: updatedGroup, // 更新された統合グループ情報を保持
            _isUnified: true, // 統合商品であることを示すフラグ
          };
        })
        .filter((product) => product !== null) as CartStoreProduct[];
    }

    return store.products.map((product) => ({
      ...product,
      _isUnified: false,
      _unifiedGroup: undefined,
    }));
  }, [store.products, enableUnification, unifiedProducts]);
  // ショップ変更モーダルを開く
  const handleOpenShopChangeModal = (product: CartStoreProduct) => {
    // store_idを設定
    product.store_id = store.store_id;
    setSelectedProduct(product);
    setIsShopChangeModalOpen(true);
  };

  // ショップ変更モーダルを閉じる
  const handleCloseShopChangeModal = () => {
    setIsShopChangeModalOpen(false);
    setSelectedProduct(null);
  };

  // 統合商品の数量変更処理
  const handleUnifiedStockChange = (
    group: CartUnifiedProductGroup,
    newTotalQuantity: number,
  ) => {
    // まず各商品の在庫制限と現在のカート数量を取得
    const productStockLimits = group.products.map((product) => {
      const storeProduct = store.products.find(
        (p) => p.product_id === product.product_id,
      );
      return {
        product_id: product.product_id,
        maxStock: storeProduct?.product?.ec_stock_number || 0,
        currentCount: storeProduct?.original_item_count || 0, // 実際の現在のカート数量を使用
      };
    });

    // 統合商品全体の最大在庫数を計算
    const totalMaxStock = productStockLimits.reduce(
      (sum, item) => sum + item.maxStock,
      0,
    );

    // 要求された数量が最大在庫数を超える場合は制限
    const limitedTotalQuantity = Math.min(newTotalQuantity, totalMaxStock);

    if (limitedTotalQuantity === 0) {
      // 数量が0の場合は全商品を削除
      group.products.forEach((product) => {
        onStockChange(product.product_id, 0);
      });
      return;
    }

    // 現在の実際の合計数量を計算（在庫制限を考慮）
    const currentValidTotalQuantity = productStockLimits.reduce(
      (sum, item) => sum + Math.min(item.currentCount, item.maxStock),
      0,
    );

    const distributions: { product_id: number; quantity: number }[] = [];
    let remainingQuantity = limitedTotalQuantity;

    // 優先度順でアルゴリズムを適用
    // 1. まず在庫制限内の現在の比率を維持しようと試みる
    productStockLimits.forEach((stockInfo, index) => {
      let newQuantity: number;

      if (index === productStockLimits.length - 1) {
        // 最後の商品は残り全てを割り当て（ただし在庫制限内）
        newQuantity = Math.min(remainingQuantity, stockInfo.maxStock);
      } else {
        // 現在の有効な比率で計算（在庫制限を超えている分は除外）
        const validCurrentCount = Math.min(
          stockInfo.currentCount,
          stockInfo.maxStock,
        );
        const ratio =
          currentValidTotalQuantity > 0
            ? validCurrentCount / currentValidTotalQuantity
            : 1 / productStockLimits.length;

        let proportionalQuantity = Math.round(limitedTotalQuantity * ratio);

        // 最低1個は保持（ただし総数が商品数より少ない場合や在庫がない場合は除く）
        if (
          proportionalQuantity === 0 &&
          limitedTotalQuantity >= productStockLimits.length &&
          stockInfo.maxStock > 0
        ) {
          proportionalQuantity = 1;
        }

        // 在庫制限を適用
        newQuantity = Math.min(proportionalQuantity, stockInfo.maxStock);
      }

      distributions.push({
        product_id: stockInfo.product_id,
        quantity: Math.max(0, newQuantity),
      });

      remainingQuantity -= newQuantity;
    });

    // 残り数量がある場合は、まだ余裕がある商品に追加配分
    if (remainingQuantity > 0) {
      for (const distribution of distributions) {
        const stockInfo = productStockLimits.find(
          (s) => s.product_id === distribution.product_id,
        );
        if (stockInfo && distribution.quantity < stockInfo.maxStock) {
          const canAdd = Math.min(
            remainingQuantity,
            stockInfo.maxStock - distribution.quantity,
          );
          distribution.quantity += canAdd;
          remainingQuantity -= canAdd;
          if (remainingQuantity <= 0) break;
        }
      }
    }

    // マイナス値の残り数量がある場合は、配分数量を減らす
    if (remainingQuantity < 0) {
      let excessQuantity = Math.abs(remainingQuantity);
      for (const distribution of [...distributions].reverse()) {
        if (excessQuantity <= 0) break;
        const canReduce = distribution.quantity;
        const reduceAmount = Math.min(excessQuantity, canReduce);
        distribution.quantity -= reduceAmount;
        excessQuantity -= reduceAmount;
      }
    }

    // 各商品の数量を更新
    distributions.forEach(({ product_id, quantity }) => {
      onStockChange(product_id, quantity);
    });
  };

  // 統合商品の削除処理
  const handleUnifiedDelete = (group: CartUnifiedProductGroup) => {
    // グループ内の全商品を削除
    group.products.forEach((product) => {
      onDelete(product.product_id);
    });
  };

  // ショップ変更の確定
  const handleConfirmShopChange = (selections: ShopChangeSelection[]) => {
    if (!selectedProduct) return;

    // 選択した商品の合計数量を計算
    const totalSelectedCount = selections.reduce(
      (sum, item) => sum + item.count,
      0,
    );

    // 親商品の残り数量を計算
    const parentRemainingCount = Math.max(
      0,
      selectedProduct.original_item_count - totalSelectedCount,
    );

    // 親商品を削除するかどうか判定（選択数量が親の数量以上の場合）
    const shouldRemoveParent =
      totalSelectedCount >= selectedProduct.original_item_count;

    // ショップ変更情報を作成
    const updateInfo: ShopChangeUpdateInfo = {
      parentProductId: selectedProduct.product_id,
      parentStoreId: store.store_id,
      parentRemainingCount,
      selections,
      shouldRemoveParent,
    };

    // 親コンポーネントにショップ変更情報を渡す
    onShopChange(updateInfo);
    handleCloseShopChangeModal();
  };

  return (
    <div key={store.store_id}>
      <Box
        sx={{
          width: 'fit-content',
          backgroundColor: 'primary.main',
          py: 1,
          px: 3,
          borderRadius: '4px 4px 0 0',
        }}
      >
        <Typography
          sx={{
            position: 'relative',
            color: '#fff',
            fontSize: '0.9rem',
            fontWeight: 'bold',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              right: '-30px',
              top: '-8px',
              width: '26px',
              height: '33px',
              borderRadius: '4px',
              bgcolor: 'primary.main',
              transform: 'skew(23deg)',
            }}
          ></Box>
          ショップ {storeIndex + 1}/{totalStores}
        </Typography>
      </Box>
      <Box
        sx={{
          width: '100%',
          backgroundColor: 'primary.main',
          height: '16px',
          borderRadius: '0px 4px 0 0',
          mt: -1,
        }}
      ></Box>
      <Paper sx={{ mt: -1, mb: 4 }}>
        <Box sx={{ px: 2, pt: 2, pb: 0 }}>
          {/* ショップ名 */}
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ textDecoration: 'underline', mb: 1 }}
          >
            {store.store?.display_name || `${store.store_id}番ショップ`}
          </Typography>

          {/* 商品リスト */}
          {displayProducts
            .slice() // 元の配列を変更しないようにコピーを作成
            .sort((a, b) => {
              if (!a || !b) return 0;
              // 1. 金額（price）の昇順でソート
              const priceA = a.total_unit_price ?? 0;
              const priceB = b.total_unit_price ?? 0;
              if (priceA !== priceB) {
                return priceA - priceB;
              }

              // 2. product_idの昇順でソート
              if (a.product_id !== b.product_id) {
                return a.product_id - b.product_id;
              }

              // 3. product_idが同じ場合、condition_option.handleの昇順でソート
              const handleA = a.product?.condition_option?.handle || '';
              const handleB = b.product?.condition_option?.handle || '';
              return handleA.localeCompare(handleB);
            })
            .map(
              (product) =>
                product && (
                  <ProductCard
                    key={`${product.product_id}-${
                      product._isUnified ? 'unified' : 'single'
                    }`}
                    product={product}
                    onStockChange={(value) => {
                      if (product._isUnified && product._unifiedGroup) {
                        // 統合商品の場合は、グループ内の商品に数量を分散
                        handleUnifiedStockChange(product._unifiedGroup, value);
                      } else {
                        onStockChange(product.product_id, value);
                      }
                    }}
                    onDelete={() => {
                      if (product._isUnified && product._unifiedGroup) {
                        // 統合商品の場合は、グループ内の全商品を削除
                        handleUnifiedDelete(product._unifiedGroup);
                      } else {
                        onDelete(product.product_id);
                      }
                    }}
                    onShopChange={() => handleOpenShopChangeModal(product)}
                    viewMode={viewMode}
                    storeProducts={store.products}
                  />
                ),
            )}
        </Box>

        <Divider />

        {/* ストア合計 */}
        <Box
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mb: 3,
            }}
          >
            <Typography variant="h2">ショップ小計</Typography>
            <Typography variant="h2">
              ¥{store.total_price?.toLocaleString() || '0'}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mb: 2,
              mt: 2,
            }}
          >
            <Typography variant="body2">商品点数</Typography>
            <Typography variant="body2" fontWeight="medium">
              {displayProducts.reduce(
                (sum, product) => sum + (product.original_item_count || 0),
                0,
              )}
              点
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mb: 2,
            }}
          >
            <Typography variant="body2">商品合計(税込)</Typography>
            <Typography variant="body2" fontWeight="medium">
              ¥
              {(store.total_price - store.shipping_fee)?.toLocaleString() ||
                '0'}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mb: 2,
            }}
          >
            <Typography variant="body2">送料</Typography>
            <Typography variant="body2" fontWeight="medium">
              ¥{store.shipping_fee?.toLocaleString() || '0'}
            </Typography>
          </Box>

          {/* 配送方法選択 */}
          {viewMode === 'cart' &&
            store.shippingMethodCandidates &&
            store.shippingMethodCandidates.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  配送方法
                </Typography>
                <RadioGroup
                  value={store.shipping_method_id || ''}
                  onChange={(e) =>
                    onShippingMethodChange(
                      store.store_id,
                      Number(e.target.value),
                    )
                  }
                >
                  {store.shippingMethodCandidates.map((method) => (
                    <Box
                      key={method.id}
                      sx={{
                        mb: 1,
                        pl: 1,
                        border: '1px solid',
                        borderColor:
                          store.shipping_method_id === method.id
                            ? 'primary.main'
                            : 'grey.300',
                        py: 1,
                        borderRadius: 1,
                        '&:hover': {
                          bgcolor: 'grey.50',
                        },
                      }}
                    >
                      <FormControlLabel
                        value={method.id}
                        control={<Radio size="small" />}
                        sx={{
                          width: '100%',
                          minWidth: '100%',
                          '& .MuiFormControlLabel-label': {
                            width: '100%',
                          },
                        }}
                        label={
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              pr: 2,
                              width: '100%',
                              minWidth: '100%',
                            }}
                          >
                            <Box sx={{ minWidth: '100px' }}>
                              <Typography>{method.display_name}</Typography>
                              <Typography>
                                {method.shipping_days === -1
                                  ? '発送日未定'
                                  : method.shipping_days === 0
                                  ? '即日発送'
                                  : `${method.shipping_days}営業日以内に発送`}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                              }}
                            >
                              <Typography>
                                {method.fee === 0 || !method.fee
                                  ? '無料'
                                  : `¥${method.fee.toLocaleString()}`}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </Box>
                  ))}
                </RadioGroup>
              </Box>
            )}
        </Box>
      </Paper>

      {/* ショップ変更モーダル */}
      {selectedProduct && (
        <ShopChangeModal
          isOpen={isShopChangeModalOpen}
          onClose={handleCloseShopChangeModal}
          product={selectedProduct}
          currentCartItems={
            // すべてのカートストアから商品情報を抽出して平坦化
            allCartStores.flatMap((store) =>
              store.products.map((product) => ({
                product_id: product.product_id,
                store_id: store.store_id,
                original_item_count: product.original_item_count,
              })),
            )
          }
          onConfirm={handleConfirmShopChange}
        />
      )}
    </div>
  );
};

/**
 * 個別商品カードコンポーネント
 * 商品情報と数量変更・削除などの操作UIを表示します
 */
const ProductCard = ({
  product,
  onStockChange,
  onDelete,
  onShopChange,
  viewMode = 'cart',
  storeProducts,
}: {
  product: CartStoreProduct;
  onStockChange: (value: number) => void;
  onDelete: () => void;
  onShopChange: () => void;
  viewMode?: ViewMode;
  storeProducts: Array<{
    product_id: number;
    original_item_count: number;
    total_unit_price: number;
    product?: {
      ec_stock_number?: number;
      condition_option?: {
        handle: ConditionOptionHandle | null;
      };
      item?: {
        myca_item_id: number | null;
      };
      mycaItem?: {
        id: number;
        cardname: string | null;
        cardnumber: string | null;
        rarity: string | null;
        full_image_url: string | null;
        expansion: string | null;
      };
      specialty?: {
        handle: SpecialtyHandle;
      } | null;
    };
  }>;
}) => {
  // 画像ビューアーの状態管理
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  // 説明モーダルの状態管理
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);

  // 商品画像があるかチェック
  const hasImages =
    product.product?.images &&
    Array.isArray(product.product.images) &&
    product.product.images.length > 0;

  // ImageViewer用の画像データ
  const imageViewerImages = useMemo(() => {
    const images = [];

    // 1枚目: メイン画像（mycaItem.full_image_url）
    if (product.product?.mycaItem?.full_image_url) {
      images.push({
        src: product.product.mycaItem.full_image_url,
        alt: '商品画像',
        description: product.product.mycaItem.cardname || '',
      });
    }

    // 2枚目以降: 追加画像（product.images）
    if (product.product?.images && Array.isArray(product.product.images)) {
      const additionalImages = product.product.images
        .filter((img) => img.image_url !== null)
        .map((img) => ({
          src: img.image_url!,
          alt: '商品画像',
          description: img.description || '',
        }));
      images.push(...additionalImages);
    }

    return images;
  }, [product.product?.mycaItem, product.product?.images]);

  // 画像クリック処理
  const handleImageClick = () => {
    if (imageViewerImages.length > 0) {
      setIsImageViewerOpen(true);
    }
  };

  return (
    <Box sx={{ mb: 5 }}>
      {/* 商品情報 */}
      <Box sx={{ display: 'flex', mb: 2 }}>
        {/* 左側: カード画像 */}
        <Box
          sx={{
            position: 'relative',
            width: 120,
            height: 120,
            mr: 2,
            mt: product.product.specialty?.handle ? 2 : 1,
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: '100%',
              bgcolor: 'white',
              borderRadius: 1,
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: imageViewerImages.length > 0 ? 'pointer' : 'default',
              border:
                imageViewerImages.length > 0
                  ? '2px solid transparent'
                  : '1px solid #e0e0e0',
              '&:hover':
                imageViewerImages.length > 0
                  ? {
                      border: '2px solid #1976d2',
                      transform: 'scale(1.02)',
                      transition: 'all 0.2s ease',
                    }
                  : {},
            }}
            onClick={handleImageClick}
          >
            {product.product?.mycaItem?.full_image_url ? (
              <Box
                component="img"
                src={product.product.mycaItem.full_image_url}
                alt={product.product.mycaItem.cardname || 'カード画像'}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                画像なし
              </Typography>
            )}
          </Box>

          {/* 画像数バッジ（1枚以上の場合に表示） */}
          {hasImages &&
            product.product?.images &&
            product.product.images.length > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 4,
                  right: 4,
                  bgcolor: 'primary.main',
                  color: 'white',
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  border: '2px solid white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                +{product.product.images.length}
              </Box>
            )}
        </Box>

        {/* 右側: カード情報 */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {product.product?.mycaItem?.cardname || 'カード名未設定'}
            </Typography>
            {product.product?.description &&
              product.product.description.trim() !== '' && (
                <IconButton
                  size="small"
                  onClick={() => setIsDescriptionModalOpen(true)}
                  sx={{
                    padding: '2px',
                    minWidth: 'unset',
                    '& .MuiSvgIcon-root': {
                      fontSize: '16px',
                    },
                  }}
                >
                  <InfoOutlinedIcon sx={{ color: 'grey.600' }} />
                </IconButton>
              )}
          </Box>
          <Typography variant="body2">
            {product.product?.mycaItem?.expansion &&
            product.product?.mycaItem?.cardnumber
              ? `${product.product?.mycaItem?.expansion} ${product.product?.mycaItem?.cardnumber}`
              : '型番未設定'}
          </Typography>
          <Typography variant="body2">
            {product.product?.mycaItem?.rarity || 'レア度未設定'}
          </Typography>
          {/* 状態 */}
          {product.product.specialty?.handle && (
            // 特殊状態
            <Box sx={{ width: 'fit-content' }}>
              <SpecialtyTag value={product.product.specialty?.handle} />
            </Box>
          )}
          <Box sx={{ width: 'fit-content' }}>
            <ConditionTag
              value={
                (product.product.condition_option
                  ?.handle as ConditionOptionHandle) ?? null
              }
            />
          </Box>
          <Typography variant="body2" fontWeight="bold">
            ¥{product.total_unit_price?.toLocaleString() || '0'}
          </Typography>
        </Box>
      </Box>

      {/* 下部コントロール */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {viewMode === 'cart' ? (
            <>
              {/* カート画面: 数量選択 */}
              <StockSelect
                maxStock={
                  product._isUnified && product._unifiedGroup
                    ? // 統合商品の場合：グループ内の全商品の在庫数合計
                      product._unifiedGroup.products.reduce(
                        (sum, groupProduct) => {
                          const storeProduct = storeProducts.find(
                            (p) => p.product_id === groupProduct.product_id,
                          );
                          return (
                            sum + (storeProduct?.product?.ec_stock_number ?? 0)
                          );
                        },
                        0,
                      )
                    : // 通常商品の場合：個別商品の在庫数
                      product.product?.ec_stock_number ?? 1
                }
                value={product.original_item_count}
                onChange={onStockChange}
              />
              {/* 削除ボタン */}
              <Box sx={{ ml: 2 }}>
                <DeleteButton onClick={onDelete} />
              </Box>
            </>
          ) : (
            /* オーダー画面: 数量表示 */
            <Typography variant="h3" sx={{ fontWeight: 'medium' }}>
              数量：{product.original_item_count}
            </Typography>
          )}
        </Box>

        {viewMode === 'cart' ? (
          <Box sx={{ ml: 'auto', textAlign: 'right' }}>
            <Typography variant="body2">合計(税込み)</Typography>
            <Typography variant="h2" fontWeight="bold">
              ¥
              {(
                product.total_unit_price * product.original_item_count
              )?.toLocaleString() || '0'}
            </Typography>
            {/* ショップ変更ボタン */}
            <Box sx={{ mt: 1 }}>
              <Typography
                variant="body1"
                onClick={onShopChange}
                sx={{
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
              >
                ショップを変更
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}
          >
            <Typography variant="body2">合計(税込み)：</Typography>
            <Typography variant="h2" fontWeight="bold">
              ¥
              {(
                product.total_unit_price * product.original_item_count
              )?.toLocaleString() || '0'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* 商品説明モーダル */}
      <Modal
        open={isDescriptionModalOpen}
        onClose={() => setIsDescriptionModalOpen(false)}
        aria-labelledby="description-modal-title"
        aria-describedby="description-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: '70%', md: '50%' },
            maxWidth: 600,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 3,
            maxHeight: '80vh',
            overflow: 'auto',
          }}
        >
          <Typography
            id="description-modal-title"
            variant="h6"
            component="h2"
            sx={{ mb: 2 }}
          >
            この商品について詳しく知る
          </Typography>
          <Typography
            id="description-modal-description"
            variant="body1"
            sx={{
              whiteSpace: 'pre-line',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              lineHeight: 1.6,
            }}
          >
            {product.product?.description}
          </Typography>
          <Box sx={{ mt: 3, textAlign: 'right' }}>
            <Typography
              variant="button"
              onClick={() => setIsDescriptionModalOpen(false)}
              sx={{
                cursor: 'pointer',
                color: 'primary.main',
                textDecoration: 'underline',
                '&:hover': {
                  opacity: 0.7,
                },
              }}
            >
              閉じる
            </Typography>
          </Box>
        </Box>
      </Modal>

      {/* 画像ビューアーモーダル */}
      {imageViewerImages.length > 0 && (
        <ImageViewer
          isOpen={isImageViewerOpen}
          onClose={() => setIsImageViewerOpen(false)}
          images={imageViewerImages}
          initialIndex={0}
        />
      )}
    </Box>
  );
};
