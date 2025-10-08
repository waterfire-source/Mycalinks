'use client';
import { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
} from '@mui/material';
import { PATH } from '@/app/ec/(core)/constants/paths';
import { useRouter, useSearchParams } from 'next/navigation';
import { StatusIcon } from '@/app/ec/(core)/components/icons/statusIcon';
import { PrefectureSelect } from '@/app/ec/(core)/components/selects/PrefectureSelect';
import { useAppAuth } from '@/providers/useAppAuth';
import { EcOrderData, useEcOrder } from '@/app/ec/(core)/hooks/useEcOrder';
import { CustomError } from '@/api/implement';
import { useCart } from '@/app/ec/(core)/hooks/useCart';
import {
  StoreCard,
  ShopChangeUpdateInfo,
} from '@/app/ec/(core)/components/cards/StoreCard';
import { getPrefectureName } from '@/app/ec/(core)/utils/prefecture';
import { InsufficientProduct } from '@/feature/deck/useDeckPurchaseOptionForm';
import { InsufficientProductsModal } from '@/feature/deck/InsufficientProductsModal';
import {
  getInsufficientProducts,
  clearInsufficientProducts,
} from '@/app/ec/(core)/utils/ecStorage';
import { Alert } from '@/app/ec/(core)/components/alerts/Alert';
import { CommonModal } from '@/app/ec/(core)/components/modals/CommonModal';
import { prefectures } from '@/constants/prefectures';
import { useAlert } from '@/contexts/AlertContext';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createOrUpdateEcOrder } = useEcOrder();
  const { getUserId, getAccountInfo } = useAppAuth();
  const { draftCart, draftCartDetails, fetchDraftCartDetails } = useCart();
  const { setAlertState } = useAlert();
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

  const [isLoading, setIsLoading] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  // カートの商品情報（画像やカード情報など）
  const [cartData, setCartData] = useState<EcOrderData | null>(null);
  // createOrUpdateEcOrderのレスポンス
  const [orderResult, setOrderResult] = useState<{
    id: number;
    code: string;
    shipping_total_fee: number;
    total_price: number;
    cart_stores: Array<{
      store_id: number;
      total_price: number;
      shipping_method_id: number | null;
      shipping_fee: number;
      shippingMethodCandidates?: Array<{
        id: number;
        display_name: string;
        fee: number;
        shipping_days?: number;
      }>;
    }>;
  } | null>(null);

  // アラート用のステート
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // 在庫不足商品のステート
  const [insufficientProducts, setInsufficientProducts] = useState<
    InsufficientProduct[]
  >([]);
  const [modalOpen, setModalOpen] = useState(false);

  // カートクリア確認モーダルのステート
  const [clearCartModalOpen, setClearCartModalOpen] = useState(false);

  // 配送方法未選択のストアIDを取得する関数
  const getUnselectedShippingMethodStoreId = () => {
    if (!displayCart?.cart_stores || displayCart.cart_stores.length === 0) {
      return null;
    }

    // 配送方法が未選択かつ候補がある店舗を検索
    const unselectedStore = displayCart.cart_stores.find(
      (store) =>
        store.shipping_method_id === null &&
        store.shippingMethodCandidates &&
        store.shippingMethodCandidates.length > 0,
    );

    return unselectedStore?.store_id || null;
  };

  const handlePaymentSelect = () => {
    if (!getUserId()) {
      router.push(PATH.LOGIN);
      return;
    }

    // 配送方法未選択のストアIDを取得
    const unselectedStoreId = getUnselectedShippingMethodStoreId();

    if (unselectedStoreId) {
      // 配送方法未選択のストアへスクロール
      const storeElement = document.getElementById(
        `store-${unselectedStoreId}`,
      );
      if (storeElement) {
        storeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // アラートを表示
      setAlertMessage('配送方法が未選択です');
      setAlertOpen(true);
      return;
    }

    // 問題なければ注文確認画面へ
    router.push(PATH.ORDER.root);
  };

  // アラートを閉じる処理
  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  // 画面遷移時 + 都道府県変更時
  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        // fetchDraftCartDetailsでカート情報と配送情報を同時に取得
        await fetchDraftCartDetails(getPrefectureName(prefecture));
      } catch (error) {
        console.error('カート情報の取得に失敗しました', error);
        setAlertState({
          message:
            error instanceof CustomError
              ? `カート情報の取得に失敗しました: ${error.message}`
              : 'カート情報の取得中にエラーが発生しました',
          severity: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    };

    const products = getInsufficientProducts();
    if (products) {
      setInsufficientProducts(products);
      setModalOpen(true);
    }

    fetchOrder();
  }, [prefecture]);

  /**
   * カートデータを再取得して更新する
   */
  const refreshCartData = async () => {
    await fetchDraftCartDetails(getPrefectureName(prefecture));
  };

  // draftCartが更新されたらcartDataも更新
  useEffect(() => {
    if (draftCart) {
      setCartData({
        orders: [draftCart],
      } as EcOrderData);
    }
  }, [draftCart]);

  // draftCartDetailsが更新されたらorderResultも更新
  useEffect(() => {
    if (draftCartDetails) {
      setOrderResult(draftCartDetails);
    }
  }, [draftCartDetails]);

  /**
   * カートの数量変更処理
   * @param productId 商品ID
   * @param value 変更後の数量
   */
  const handleStockChange = async (productId: number, value: number) => {
    if (!cartData?.orders?.[0] || isUpdate) return;

    setIsUpdate(true);
    try {
      // 既存のカートデータをクローンして更新用のデータを作成
      const updatedCart = structuredClone(cartData);
      const order = updatedCart.orders[0];

      // 対象の商品の数量を更新
      order.cart_stores = order.cart_stores.map((store) => ({
        ...store,
        products: store.products.map((product) => ({
          ...product,
          original_item_count:
            product.product_id === productId
              ? value
              : product.original_item_count,
        })),
      }));

      // APIリクエスト用のデータを作成
      const cartStores = order.cart_stores.map((store) => ({
        storeId: store.store_id,
        shippingMethodId: store.shipping_method_id ?? undefined,
        products: store.products.map((product) => ({
          productId: product.product_id,
          originalItemCount: product.original_item_count,
        })),
      }));

      // カート情報を更新
      const updatedOrderResult = await createOrUpdateEcOrder({
        includesShippingMethodCandidates: true,
        body: {
          shippingAddressPrefecture: getPrefectureName(prefecture),
          cartStores: cartStores,
        },
      });

      if (updatedOrderResult instanceof CustomError) {
        setAlertState({
          message: `カートの更新に失敗しました: ${updatedOrderResult.message}`,
          severity: 'error',
        });
        return;
      }

      // 更新されたカート情報をステートに反映
      setOrderResult(updatedOrderResult);

      // CartContextのdraftCartを更新（これによりuseEffectでcartDataも更新される）
      await refreshCartData();
    } catch (error) {
      setAlertState({
        message:
          error instanceof CustomError
            ? `カートの更新に失敗しました: ${error.message}`
            : 'カートの更新中にエラーが発生しました',
        severity: 'error',
      });
    } finally {
      setIsUpdate(false);
    }
  };

  /**
   * カートの商品削除処理
   * @param productId 商品ID
   */
  const handleDelete = async (productId: number) => {
    if (!cartData?.orders?.[0] || isUpdate) return;

    setIsUpdate(true);
    try {
      // 既存のカートデータをクローンして更新用のデータを作成
      const updatedCart = structuredClone(cartData);
      const order = updatedCart.orders[0];

      // 対象の商品を削除し、空になったストアも除外
      order.cart_stores = order.cart_stores
        .map((store) => ({
          ...store,
          products: store.products.filter(
            (product) => product.product_id !== productId,
          ),
        }))
        .filter((store) => store.products.length > 0);

      // APIリクエスト用のデータを作成
      const cartStores = order.cart_stores.map((store) => ({
        storeId: store.store_id,
        shippingMethodId: store.shipping_method_id ?? undefined,
        products: store.products.map((product) => ({
          productId: product.product_id,
          originalItemCount: product.original_item_count,
        })),
      }));

      // カート情報を更新
      const updatedOrderResult = await createOrUpdateEcOrder({
        includesShippingMethodCandidates: true,
        body: {
          shippingAddressPrefecture: getPrefectureName(prefecture),
          cartStores: cartStores,
        },
      });

      if (updatedOrderResult instanceof CustomError) {
        console.error('商品の削除に失敗しました', updatedOrderResult);
        setAlertState({
          message: `商品の削除に失敗しました: ${updatedOrderResult.message}`,
          severity: 'error',
        });
        return;
      }

      // 更新されたカート情報をステートに反映
      setOrderResult(updatedOrderResult);

      // CartContextのdraftCartを更新（これによりuseEffectでcartDataも更新される）
      await refreshCartData();
    } catch (error) {
      setAlertState({
        message:
          error instanceof CustomError
            ? `商品の削除に失敗しました: ${error.message}`
            : '商品の削除中にエラーが発生しました',
        severity: 'error',
      });
    } finally {
      setIsUpdate(false);
    }
  };

  /**
   * 配送方法変更処理
   * @param storeId ストアID
   * @param methodId 配送方法ID
   */
  const handleShippingMethodChange = async (
    storeId: number,
    methodId: number,
  ) => {
    if (!cartData?.orders?.[0] || isUpdate) return;

    setIsUpdate(true);
    try {
      // カートデータのコピーを作成して更新
      const updatedCart = structuredClone(cartData);
      const order = updatedCart.orders[0];

      // 指定されたストアの配送方法を更新
      const storeIndex = order.cart_stores.findIndex(
        (store) => store.store_id === storeId,
      );
      if (storeIndex !== -1) {
        order.cart_stores[storeIndex].shipping_method_id = methodId;
      }

      // APIリクエスト用のデータを作成
      const cartStores = order.cart_stores.map((store) => ({
        storeId: store.store_id,
        shippingMethodId: store.shipping_method_id ?? undefined,
        products: store.products.map((product) => ({
          productId: product.product_id,
          originalItemCount: product.original_item_count,
        })),
      }));

      const updatedOrderResult = await createOrUpdateEcOrder({
        includesShippingMethodCandidates: true,
        body: {
          shippingAddressPrefecture: getPrefectureName(prefecture),
          cartStores: cartStores,
        },
      });

      if (updatedOrderResult instanceof CustomError) {
        setAlertState({
          message: `配送方法の更新に失敗しました: ${updatedOrderResult.message}`,
          severity: 'error',
        });
        return;
      }

      // 更新されたカート情報をステートに反映
      setOrderResult(updatedOrderResult);

      // CartContextのdraftCartを更新（これによりuseEffectでcartDataも更新される）
      await refreshCartData();
    } catch (error) {
      setAlertState({
        message:
          error instanceof CustomError
            ? `配送方法の更新に失敗しました: ${error.message}`
            : '配送方法の更新中にエラーが発生しました',
        severity: 'error',
      });
    } finally {
      setIsUpdate(false);
    }
  };

  /**
   * ショップ変更処理
   * @param updateInfo ショップ変更情報
   */
  const handleShopChange = async (updateInfo: ShopChangeUpdateInfo) => {
    if (!cartData?.orders?.[0] || isUpdate) return;

    setIsUpdate(true);
    try {
      // 既存のカートデータをクローンして更新用のデータを作成
      const updatedCart = structuredClone(cartData);
      const order = updatedCart.orders[0];

      // 親商品の情報を更新する
      let parentStoreIndex = order.cart_stores.findIndex(
        (store) => store.store_id === updateInfo.parentStoreId,
      );

      if (parentStoreIndex === -1) {
        setAlertState({
          message: '親ストアが見つかりません',
          severity: 'error',
        });
        return;
      }

      const parentStore = order.cart_stores[parentStoreIndex];

      // 親商品を特定
      const parentProduct = parentStore.products.find(
        (product) => product.product_id === updateInfo.parentProductId,
      );

      if (!parentProduct) {
        setAlertState({
          message: '親商品が見つかりません',
          severity: 'error',
        });
        return;
      }

      // 親商品の数量を更新または削除
      if (updateInfo.shouldRemoveParent) {
        // 親商品を完全に削除
        parentStore.products = parentStore.products.filter(
          (product) => product.product_id !== updateInfo.parentProductId,
        );

        // ストア内の商品がなくなった場合、ストア自体を削除
        if (parentStore.products.length === 0) {
          order.cart_stores.splice(parentStoreIndex, 1);
        }
      } else {
        // 親商品の数量を減らす
        const parentProductIndex = parentStore.products.findIndex(
          (product) => product.product_id === updateInfo.parentProductId,
        );

        if (parentProductIndex !== -1) {
          parentStore.products[parentProductIndex].original_item_count =
            updateInfo.parentRemainingCount;
        }
      }

      // 選択された商品ごとに処理
      for (const selection of updateInfo.selections) {
        // 対象のストアを検索
        let targetStoreIndex = order.cart_stores.findIndex(
          (store) => store.store_id === selection.store_id,
        );

        // 対象のストアが存在しない場合は新規作成
        if (targetStoreIndex === -1) {
          // 新しいストアを追加
          order.cart_stores.push({
            store_id: selection.store_id,
            store: {
              display_name: null,
            },
            products: [],
            total_price: 0,
            shipping_fee: 0,
            shipping_method_id: null,
            shipping_method: null,
            status: 'DRAFT',
            code: '',
          });
          targetStoreIndex = order.cart_stores.length - 1;
        }

        const targetStore = order.cart_stores[targetStoreIndex];

        // ストア内に同じ商品が既に存在するか確認
        const existingProductIndex = targetStore.products.findIndex(
          (product) => product.product_id === selection.id,
        );

        if (existingProductIndex !== -1) {
          // 既存の商品の数量を増やす
          targetStore.products[existingProductIndex].original_item_count +=
            selection.count;
        } else {
          // 新しい商品として追加
          // 価格情報がモーダルから渡されていれば使用し、そうでなければ親商品の価格を使用
          const price = selection.price || parentProduct.total_unit_price;

          targetStore.products.push({
            product_id: selection.id,
            original_item_count: selection.count,
            total_unit_price: price,
            product: {
              ...parentProduct.product,
            },
          });
        }
      }

      // APIリクエスト用のデータを作成
      const cartStores = order.cart_stores.map((store) => ({
        storeId: store.store_id,
        shippingMethodId: store.shipping_method_id ?? undefined,
        products: store.products.map((product) => ({
          productId: product.product_id,
          originalItemCount: product.original_item_count,
        })),
      }));

      // カート情報を更新
      const updatedOrderResult = await createOrUpdateEcOrder({
        includesShippingMethodCandidates: true,
        body: {
          shippingAddressPrefecture: getPrefectureName(prefecture),
          cartStores: cartStores,
        },
      });

      if (updatedOrderResult instanceof CustomError) {
        console.error('ショップ変更の適用に失敗しました', updatedOrderResult);
        setAlertState({
          message: `ショップ変更の適用に失敗しました: ${updatedOrderResult.message}`,
          severity: 'error',
        });
        return;
      }

      // この時点でupdatedOrderResultはCustomErrorではないことが確定しているため、型アサーションを使用
      const orderResult = updatedOrderResult as {
        id: number;
        code: string;
        shipping_total_fee: number;
        total_price: number;
        cart_stores: Array<{
          store_id: number;
          total_price: number;
          shipping_method_id: number | null;
          shipping_fee: number;
          products: Array<{
            product_id: number;
            original_item_count: number;
          }>;
          shippingMethodCandidates?: Array<{
            id: number;
            display_name: string;
            fee: number;
          }>;
        }>;
      };

      // 配送方法の自動選択を行うためのデータを準備
      const autoSelectShippingMethods: Array<{
        storeId: number;
        methodId: number;
      }> = [];

      // 各ストアの配送方法を確認
      orderResult.cart_stores.forEach((store) => {
        // 配送方法候補があるか確認
        if (
          store.shippingMethodCandidates &&
          store.shippingMethodCandidates.length > 0
        ) {
          // 現在の配送方法が選択されているか
          const currentMethodId = store.shipping_method_id;

          // 現在選択されている配送方法が候補に含まれているかチェック
          const isCurrentMethodAvailable =
            currentMethodId !== null &&
            store.shippingMethodCandidates.some(
              (method) => method.id === currentMethodId,
            );

          if (!isCurrentMethodAvailable) {
            // 現在の配送方法がない場合、最も安い配送方法を選択
            const cheapestMethod = store.shippingMethodCandidates.reduce(
              (cheapest, current) =>
                current.fee < cheapest.fee ? current : cheapest,
              store.shippingMethodCandidates[0],
            );

            autoSelectShippingMethods.push({
              storeId: store.store_id,
              methodId: cheapestMethod.id,
            });
          }
        }
      });

      // 自動選択が必要な配送方法がある場合
      if (autoSelectShippingMethods.length > 0) {
        // 配送方法の自動選択を反映したカートストア情報を作成
        const updatedCartStores = orderResult.cart_stores.map((store) => {
          const autoSelectMethod = autoSelectShippingMethods.find(
            (item) => item.storeId === store.store_id,
          );

          return {
            storeId: store.store_id,
            shippingMethodId: autoSelectMethod
              ? autoSelectMethod.methodId
              : store.shipping_method_id ?? undefined,
            products: store.products.map((product) => ({
              productId: product.product_id,
              originalItemCount: product.original_item_count,
            })),
          };
        });

        // 自動選択した配送方法で再度API呼び出し
        const finalOrderResult = await createOrUpdateEcOrder({
          includesShippingMethodCandidates: true,
          body: {
            shippingAddressPrefecture: getPrefectureName(prefecture),
            cartStores: updatedCartStores,
          },
        });

        if (!(finalOrderResult instanceof CustomError)) {
          setOrderResult(finalOrderResult);
        } else {
          // エラーの場合は前回の結果を使用
          setOrderResult(orderResult);
        }
      } else {
        // 配送方法の自動選択が不要な場合は、そのまま結果を使用
        setOrderResult(orderResult);
      }

      // CartContextのdraftCartを更新（これによりuseEffectでcartDataも更新される）
      await refreshCartData();
    } catch (error) {
      console.error('ショップの変更に失敗しました', error);
    } finally {
      setIsUpdate(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    clearInsufficientProducts();
  };

  /**
   * カートを全て空にする処理
   */
  const handleClearCart = async () => {
    if (!cartData?.orders?.[0] || isUpdate) return;

    setIsUpdate(true);
    try {
      // 空のカートでAPI呼び出し
      const updatedOrderResult = await createOrUpdateEcOrder({
        includesShippingMethodCandidates: true,
        body: {
          shippingAddressPrefecture: getPrefectureName(prefecture),
          cartStores: [],
        },
      });

      if (updatedOrderResult instanceof CustomError) {
        setAlertState({
          message: `カートのクリアに失敗しました: ${updatedOrderResult.message}`,
          severity: 'error',
        });
        return;
      }

      // 更新されたカート情報をステートに反映
      setOrderResult(updatedOrderResult);

      // CartContextのdraftCartを更新
      await refreshCartData();

      setAlertState({
        message: 'カートを空にしました',
        severity: 'success',
      });
    } catch (error) {
      setAlertState({
        message:
          error instanceof CustomError
            ? `カートのクリアに失敗しました: ${error.message}`
            : 'カートのクリア中にエラーが発生しました',
        severity: 'error',
      });
    } finally {
      setIsUpdate(false);
      setClearCartModalOpen(false);
    }
  };

  // 表示用のカートデータを作成
  const displayCart = cartData?.orders?.[0]
    ? {
        ...cartData.orders[0],
        cart_stores: cartData.orders[0].cart_stores.map((store) => {
          // orderResultから該当するストアの情報を取得
          const orderStore = orderResult?.cart_stores.find(
            (s) => s.store_id === store.store_id,
          );

          return {
            ...store,
            // 配送方法の情報を最新のものに更新
            // orderResultの情報を優先（最新の配送料金情報）
            shipping_method_id:
              orderStore?.shipping_method_id ?? store.shipping_method_id,
            shipping_fee: orderStore?.shipping_fee ?? store.shipping_fee ?? 0,
            // 配送方法の候補はAPIからの最新情報を使用
            shippingMethodCandidates: orderStore?.shippingMethodCandidates?.map(
              (candidate) => ({
                ...candidate,
                shipping_days: candidate.shipping_days ?? 0,
              }),
            ),
            total_price: orderStore?.total_price ?? store.total_price ?? 0,
          };
        }),
        // 合計金額と送料合計を最新のものに更新（orderResultを優先）
        total_price:
          orderResult?.total_price ?? cartData.orders[0].total_price ?? 0,
        shipping_total_fee:
          orderResult?.shipping_total_fee ??
          cartData.orders[0].shipping_total_fee ??
          0,
      }
    : null;

  /**
   * 都道府県変更時の処理
   * @param prefectureId 変更後の都道府県ID
   */
  const handlePrefectureChange = async (prefectureId: number) => {
    if (!cartData?.orders?.[0] || isUpdate) return;

    setIsUpdate(true);
    try {
      // カートストア情報の取得（未使用の変数を削除）

      // 都道府県を更新してから、カート詳細情報を再取得
      setPrefecture(prefectureId);

      // fetchDraftCartDetailsで新しい都道府県の配送情報を取得
      await fetchDraftCartDetails(getPrefectureName(prefectureId));
    } catch (error) {
      console.error('都道府県変更処理に失敗しました', error);
      setAlertState({
        message:
          error instanceof CustomError
            ? `都道府県変更処理に失敗しました: ${error.message}`
            : '都道府県変更処理中にエラーが発生しました',
        severity: 'error',
      });
    } finally {
      setIsUpdate(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4, position: 'relative' }}>
        {/* アラートコンポーネント */}
        <Alert
          isOpen={alertOpen}
          onClose={handleAlertClose}
          message={alertMessage}
          severity="error"
          bgColor="#f44336"
        />

        {isUpdate && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              zIndex: 1300,
            }}
          >
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              更新中...
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <StatusIcon current={1} total={3} />
          <Typography variant="h2" color="gray" sx={{ ml: 1, mr: 'auto' }}>
            カート
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PrefectureSelect
              defaultPrefectureId={prefecture}
              setPrefectureId={setPrefecture}
              onPrefectureChange={handlePrefectureChange}
            />
          </Box>
        </Box>

        {isLoading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '200px',
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Paper sx={{ p: 2, mb: 4 }}>
              <Typography
                variant="body2"
                gutterBottom
                sx={{ mb: 3, textAlign: 'center' }}
              >
                カート詳細
              </Typography>

              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}
              >
                <Typography variant="body2">ショップ数</Typography>
                <Typography variant="body2">
                  {displayCart?.cart_stores?.length || 0}店舗
                </Typography>
              </Box>

              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}
              >
                <Typography variant="body2">商品</Typography>
                <Typography variant="body2">
                  {displayCart?.cart_stores?.reduce(
                    (sum, store) =>
                      sum +
                      store.products.reduce(
                        (productSum, product) =>
                          productSum + (product.original_item_count || 0),
                        0,
                      ),
                    0,
                  ) || 0}
                  点
                </Typography>
              </Box>

              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}
              >
                <Typography variant="body2">商品合計（税込み）</Typography>
                <Typography variant="body2">
                  ¥
                  {(
                    (displayCart?.total_price || 0) -
                    (displayCart?.shipping_total_fee || 0)
                  ).toLocaleString()}
                </Typography>
              </Box>

              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}
              >
                <Typography variant="body2">送料</Typography>
                <Typography variant="body2">
                  ¥{displayCart?.shipping_total_fee?.toLocaleString() || '0'}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #e0e0e0',
                  pt: 2,
                  mb: 3,
                }}
              >
                <Typography variant="body2">カート小計</Typography>
                <Typography variant="body2">
                  ¥{(displayCart?.total_price || 0).toLocaleString()}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  justifyContent: 'space-between',
                }}
              >
                <Button
                  size="small"
                  sx={{
                    flex: 1,
                    bgcolor: '#e0e0e0',
                    color: 'black',
                    border: '1px solid #9e9e9e',
                    '&:hover': {
                      bgcolor: '#bdbdbd',
                    },
                  }}
                  onClick={() => router.push(PATH.TOP)}
                >
                  買い物を続ける
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    flex: 1,
                    bgcolor: 'primary.main',
                  }}
                  onClick={handlePaymentSelect}
                  disabled={
                    !displayCart?.cart_stores ||
                    displayCart.cart_stores.length === 0
                  }
                >
                  お支払い方法の選択
                </Button>
              </Box>
            </Paper>

            {displayCart?.cart_stores?.map((store, storeIndex) => (
              <Box
                key={store.store_id}
                id={`store-${store.store_id}`}
                sx={{
                  opacity: isUpdate ? 0.6 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                <StoreCard
                  store={store}
                  storeIndex={storeIndex}
                  totalStores={displayCart.cart_stores.length}
                  onStockChange={handleStockChange}
                  onDelete={handleDelete}
                  onShopChange={handleShopChange}
                  onShippingMethodChange={handleShippingMethodChange}
                  allCartStores={displayCart.cart_stores}
                  enableUnification={true}
                />
              </Box>
            ))}

            {(!displayCart?.cart_stores ||
              displayCart.cart_stores.length === 0) && (
              <Paper sx={{ p: 2, mb: 4 }}>
                <Typography variant="body1" align="center" sx={{ py: 4 }}>
                  カートに商品がありません。商品を追加してください。
                </Typography>
              </Paper>
            )}

            {/* カートを空にするボタン */}
            {displayCart?.cart_stores && displayCart.cart_stores.length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Typography
                  variant="body2"
                  component="span"
                  onClick={() => setClearCartModalOpen(true)}
                  sx={{
                    cursor: 'pointer',
                    color: 'grey.600',
                    textDecoration: 'underline',
                    '&:hover': {
                      opacity: 0.7,
                    },
                  }}
                >
                  カートを空にする
                </Typography>
              </Box>
            )}
          </>
        )}
      </Box>
      <InsufficientProductsModal
        open={modalOpen}
        onClose={handleCloseModal}
        insufficientProducts={insufficientProducts}
      />
      {/* カートクリア確認モーダル */}
      <CommonModal
        isOpen={clearCartModalOpen}
        onClose={() => setClearCartModalOpen(false)}
        title="カートを空にする"
        onSubmit={handleClearCart}
        submitLabel="削除"
        isCancel={true}
        cancelLabel="キャンセル"
      >
        <Typography variant="body1" sx={{ mt: 2 }}>
          カート内の商品を全て削除しますか？
        </Typography>
      </CommonModal>
    </Container>
  );
}
