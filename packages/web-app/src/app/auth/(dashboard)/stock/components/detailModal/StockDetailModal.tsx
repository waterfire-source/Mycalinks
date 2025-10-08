import { CategoryAPIRes } from '@/api/frontend/category/api';
import { GenreAPIRes } from '@/api/frontend/genre/api';
import { StockDetail } from '@/app/auth/(dashboard)/stock/components/detailModal/StockDetail';
import { StockChangeLogModal } from '@/app/auth/(dashboard)/stock/components/detailModal/StockChangeLogModal';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { useLabelPrinterHistory } from '@/contexts/LabelPrinterContext';
import { useStore } from '@/contexts/StoreContext';
import { useCreateTransfer } from '@/feature/products/hooks/useCreateTransfer';
import { useStockSearch } from '@/feature/products/hooks/useNewProductSearch';
import { useUpdateProduct } from '@/feature/products/hooks/useUpdateProduct';
import {
  useUpdateProductImages,
  ProductImageData,
} from '@/feature/products/hooks/useUpdateProductImages';
import { Product } from '@prisma/client';
import { useState, useEffect } from 'react';
import { useItemSearch } from '@/feature/item/hooks/useItemSearch';
import { useAlert } from '@/contexts/AlertContext';
import { CancelConsignmentModal } from '@/feature/consign/components/cancelConsignment/CancelConsignmentModal';
import { HelpIcon } from '@/components/common/HelpIcon';

interface Props {
  productId: number;
  isOpen: boolean;
  onClose: () => void;
  category: CategoryAPIRes['getCategoryAll'];
  genre: GenreAPIRes['getGenreAll'];
  fetchAllProducts?: () => Promise<void>;
  customCancelButtonText?: string;
  customStockLogButtonText?: string;
}

export interface transferProduct {
  id?: number;
  productId: number;
  itemCount: number;
  specificWholesalePrice?: number;
  stockNumber: number;
  infiniteStock: boolean;
  sourceProductId?: number; // n→1転送の場合の転送元商品ID
  managementNumber?: string; // 管理番号
  itemId?: number; // itemIdを追加
  conditionOptionId?: number; // 状態ID
}

export const StockTabValue = {
  HISTORY: 'history',
  INFO: 'info',
  DETAIL: 'detail',
  TRANSFER: 'transfer',
} as const;
export type StockTabValue = (typeof StockTabValue)[keyof typeof StockTabValue];

export const StockDetailModal = ({
  isOpen,
  onClose,
  productId,
  category,
  genre,
  fetchAllProducts,
  customCancelButtonText,
  customStockLogButtonText,
}: Props) => {
  const { store } = useStore();
  const [selectedTab, setSelectedTab] = useState<StockTabValue>(
    StockTabValue.HISTORY,
  );
  const { pushQueue } = useLabelPrinterHistory();

  const {
    performSearch,
    searchState: searchItemState,
    setSearchState: setSearchItemState,
  } = useItemSearch(store.id);

  const { createTransferForMultipleItems, createTransferWithManagementNumber } =
    useCreateTransfer();
  const [formData, setFormData] = useState<Partial<Product>>();
  const [isStockSaveModalOpen, setIsStockSaveModalOpen] = useState(false);
  const [transferItems, setTransferItems] = useState<transferProduct[]>([]);
  //在庫が変更されたかを判定するフラグ
  const [isStockChange, setIsStockChange] = useState<boolean>(false);
  //在庫変換後、使用した値を空にするフラグ
  const [isReset, setIsReset] = useState<boolean>(false);
  //ローディング機能の追加
  const [loading, setLoading] = useState(false);
  // 画像関連のstate
  const [productImages, setProductImages] = useState<ProductImageData[]>([]);
  const [isImagesChanged, setIsImagesChanged] = useState<boolean>(false);
  // 委託取り消しモーダルのstate
  const [isOpenCancelConsignmentModal, setIsOpenCancelConsignmentModal] =
    useState(false);
  const [isRefetchHistories, setIsRefetchHistories] = useState(false);
  // 独自価格リセットのためのstate。独自価格をリセットボタン→在庫数修正モーダルの際に使用
  const [isResetSpecificPrice, setIsResetSpecificPrice] = useState(false);

  const { updateProduct } = useUpdateProduct();
  const { setAlertState } = useAlert();
  const { updateProductImages } = useUpdateProductImages();
  const { searchState, fetchProducts } = useStockSearch(
    store.id,
    {
      itemPerPage: 30, // 1ページあたりのアイテム数
      currentPage: 0, // 初期ページ
    },
    productId,
  );

  const isConsignment =
    !!searchState?.searchResults?.[0]?.consignment_client_id;
  const actionButtonText =
    selectedTab === StockTabValue.INFO
      ? '変更を保存'
      : selectedTab === StockTabValue.TRANSFER
      ? '在庫変換'
      : undefined;
  const cancelButtonText =
    customCancelButtonText !== undefined
      ? customCancelButtonText
      : selectedTab === StockTabValue.INFO ||
        selectedTab === StockTabValue.TRANSFER
      ? '変更を破棄して閉じる'
      : '';
  const secondActionButtonText =
    customStockLogButtonText !== undefined
      ? customStockLogButtonText
      : selectedTab === StockTabValue.TRANSFER
      ? '在庫変換ログを表示'
      : selectedTab === StockTabValue.HISTORY && isConsignment
      ? '委託を取り消し'
      : '';
  const thirdActionButtonText =
    selectedTab === StockTabValue.INFO ? '独自価格をリセット' : '';

  // 初期画像データの設定
  useEffect(() => {
    const product = searchState.searchResults[0];

    if (product?.images && product.images.length > 0) {
      const images: ProductImageData[] = product.images.map((img) => ({
        image_url: img.image_url!,
        description: img.description,
        order_number: img.order_number,
      }));
      setProductImages(images);
    } else {
      // 画像データがない場合は空配列に設定
      setProductImages([]);
    }
  }, [searchState.searchResults]);
  // 在庫変動ログモーダルの表示
  const [isStockChangeLogModalOpen, setIsStockChangeLogModalOpen] =
    useState(false);

  const handleRefetchProductAndHistories = () => {
    fetchProducts();
    setIsRefetchHistories(true);
  };

  useEffect(() => {
    if (isRefetchHistories) {
      setIsRefetchHistories(false);
    }
  }, [isRefetchHistories]);

  const onSecondActionButtonClick = () => {
    selectedTab === StockTabValue.TRANSFER
      ? setIsStockChangeLogModalOpen(true)
      : selectedTab === StockTabValue.HISTORY && isConsignment
      ? setIsOpenCancelConsignmentModal(true)
      : undefined;
  };
  // 更新処理
  const handleUpdate = async () => {
    if (selectedTab === StockTabValue.INFO) {
      if (productId && !isStockChange) {
        // メモと画像の保存
        try {
          // 商品情報の更新（メモを含む）
          await updateProduct(store.id, productId, {
            displayName: formData?.display_name ?? undefined,
            specificSellPrice: formData?.specific_sell_price ?? null,
            specificBuyPrice: formData?.specific_buy_price ?? null,
            retailPrice: formData?.retail_price ?? null,
            description: formData?.description ?? undefined, // メモを保存
            readonlyProductCode: formData?.readonly_product_code ?? undefined,
            tabletAllowed: formData?.tablet_allowed ?? undefined,
            allowSellPriceAutoAdjustment: (formData as any)
              ?.allow_sell_price_auto_adjustment,
            allowBuyPriceAutoAdjustment: (formData as any)
              ?.allow_buy_price_auto_adjustment,
          });

          // 画像の保存（変更がある場合のみ）
          if (isImagesChanged) {
            await updateProductImages(store.id, productId, productImages);
            setIsImagesChanged(false);
          }

          fetchProducts();
          if (fetchAllProducts) {
            fetchAllProducts();
          }
        } catch (error) {
          setAlertState({
            message: '保存中にエラーが発生しました。もう一度お試しください。',
            severity: 'error',
          });
        }
      } else if (isStockChange) {
        // 在庫数を変更した場合は、変更を保存するモーダルを表示
        setIsStockSaveModalOpen(true);
      }
    }
    //在庫変換処理
    if (selectedTab === StockTabValue.TRANSFER) {
      if (productId && transferItems.length > 0) {
        try {
          setLoading(true);

          // n→1転送かどうかを判定（sourceProductIdがある場合はn→1）
          const isNToOne = transferItems.some((item) => item.sourceProductId);

          if (isNToOne) {
            // n→1転送の場合: 各転送元商品から現在の商品に転送
            const responses = await Promise.all(
              transferItems.map((item) =>
                createTransferForMultipleItems(
                  store.id,
                  item.sourceProductId!, // 転送元商品ID
                  [
                    {
                      productId: productId, // 転送先（現在の商品）
                      itemCount: item.itemCount,
                      specificWholesalePrice: item.specificWholesalePrice,
                      description: `n→1転送: ${item.sourceProductId} → ${productId}`,
                    },
                  ],
                ),
              ),
            );

            const allSuccessful = responses.every((res) => res.success);
            if (allSuccessful) {
              fetchProducts();
              if (fetchAllProducts) {
                fetchAllProducts();
              }
              if (!isReset) {
                setIsReset(true);
              }
            } else {
              setIsReset(false);
            }
          } else {
            // 1→n転送の場合（従来の処理）
            const transferProduct = transferItems.map(({ id, ...rest }) => ({
              ...rest,
            }));

            // 管理番号付きアイテムと通常アイテムを分離
            const itemsWithManagementNumber = transferProduct.filter(
              (item) => item.managementNumber && item.managementNumber.trim(),
            );
            const itemsWithoutManagementNumber = transferProduct.filter(
              (item) => !item.managementNumber || !item.managementNumber.trim(),
            );

            let allProcessingSuccessful = true;

            // 管理番号付きアイテムの処理
            if (itemsWithManagementNumber.length > 0) {
              const sourceProduct = searchState.searchResults[0];
              if (!sourceProduct) {
                setAlertState({
                  message: '転送元の商品情報が見つかりません',
                  severity: 'error',
                });
                return;
              }

              // 各管理番号付きアイテムを個別に処理
              for (const transferItem of itemsWithManagementNumber) {
                const res = await createTransferWithManagementNumber(
                  store.id,
                  productId,
                  {
                    ...transferItem,
                  },
                  transferItem.managementNumber!,
                  transferItem.conditionOptionId || 1, // デフォルトの状態ID
                );

                if (!res.success) {
                  allProcessingSuccessful = false;
                  setAlertState({
                    message: `管理番号「${transferItem.managementNumber}」の在庫変換に失敗しました`,
                    severity: 'error',
                  });
                  break;
                }
              }
            }

            // 通常アイテムの処理（管理番号なし）
            if (
              itemsWithoutManagementNumber.length > 0 &&
              allProcessingSuccessful
            ) {
              const res = await createTransferForMultipleItems(
                store.id,
                productId,
                itemsWithoutManagementNumber,
              );

              if (!res.success) {
                allProcessingSuccessful = false;
                setAlertState({
                  message: '一部の在庫変換に失敗しました',
                  severity: 'error',
                });
              }
            }

            // 処理結果に応じて状態更新
            if (allProcessingSuccessful) {
              fetchProducts();
              if (fetchAllProducts) {
                fetchAllProducts();
              }
              if (!isReset) {
                setIsReset(true);
              }

              // ラベル印刷処理を追加
              handleLabelPrinting(transferProduct);
            } else {
              setIsReset(false);
            }
          }
        } catch (error) {
          console.error(error);
        } finally {
          await performSearch();
          setLoading(false);
        }
      }
    }
  };

  // 独自価格をリセットする処理
  const handleResetSpecificPrice = async () => {
    if (selectedTab === StockTabValue.INFO) {
      if (productId && !isStockChange) {
        await updateProduct(store.id, productId, {
          displayName: formData?.display_name ?? undefined,
          specificSellPrice: null,
          specificBuyPrice: null,
        });
        fetchProducts();
        if (fetchAllProducts) {
          fetchAllProducts();
        }
      } else if (isStockChange) {
        // 在庫数を変更した場合は、変更を保存するモーダルを表示
        setIsResetSpecificPrice(true);
        setIsStockSaveModalOpen(true);
      }
    }
  };

  // ラベル印刷処理
  const handleLabelPrinting = (transferProducts: transferProduct[]) => {
    transferProducts.forEach((item) => {
      // infiniteStock が true の場合、印刷処理をスキップ
      if (item.infiniteStock) {
        console.log(`商品ID: ${item.productId} は無限在庫のため印刷スキップ`);
        return;
      }

      const productId = item.productId;
      const printCount = item.itemCount ?? 1;
      const stockNumber = item.stockNumber ?? 0;

      let isFirstStock = stockNumber <= printCount;

      for (let i = 0; i < printCount; i++) {
        pushQueue({
          template: 'product',
          data: productId,
          meta: {
            isFirstStock,
            isManual: true,
          },
        });

        // 2 枚目以降は価格なしラベル
        isFirstStock = false;
      }
    });
  };

  return (
    <>
      {/* 在庫変動ログモーダル */}
      <StockChangeLogModal
        open={isStockChangeLogModalOpen}
        onClose={() => {
          setIsStockChangeLogModalOpen(false);
        }}
        productId={productId}
        searchState={searchState}
        setFormData={setFormData}
      />
      {/* 委託取り消しモーダル */}
      <CancelConsignmentModal
        open={isOpenCancelConsignmentModal}
        onClose={() => setIsOpenCancelConsignmentModal(false)}
        detailData={searchState.searchResults}
        fetchProductsData={handleRefetchProductAndHistories}
      />
      <CustomModalWithIcon
        open={isOpen}
        onClose={onClose} // 商品登録モーダルを閉じる
        title="在庫詳細"
        titleInfo={<HelpIcon helpArchivesNumber={1423} />}
        onActionButtonClick={handleUpdate}
        actionButtonText={actionButtonText}
        cancelButtonText={cancelButtonText}
        secondActionButtonText={secondActionButtonText}
        thirdActionButtonText={thirdActionButtonText}
        onSecondActionButtonClick={onSecondActionButtonClick}
        onThirdActionButtonClick={() => {
          handleResetSpecificPrice();
        }}
        width="95%"
        height="95%"
        loading={loading}
      >
        <StockDetail
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          storeId={store.id}
          productId={productId}
          stockNumber={searchState.searchResults[0]?.stock_number}
          isStockSaveModalOpen={isStockSaveModalOpen}
          setIsStockSaveModalOpen={setIsStockSaveModalOpen}
          isResetSpecificPrice={isResetSpecificPrice}
          setIsResetSpecificPrice={setIsResetSpecificPrice}
          formData={formData}
          setFormData={setFormData}
          setIsStockChange={setIsStockChange}
          transferItems={transferItems}
          searchItemState={searchItemState}
          setSearchItemState={setSearchItemState}
          performSearch={performSearch}
          setTransferItems={setTransferItems}
          category={category}
          genre={genre}
          searchState={searchState}
          fetchProducts={fetchProducts}
          fetchAllProducts={fetchAllProducts}
          isReset={isReset}
          setIsReset={setIsReset}
          productImages={productImages}
          setProductImages={setProductImages}
          setIsImagesChanged={setIsImagesChanged}
          isRefetchHistories={isRefetchHistories}
        />
      </CustomModalWithIcon>
    </>
  );
};
