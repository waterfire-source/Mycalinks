// TODO: 型定義とかlinetエラーとかの整備、component化も
'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  CircularProgress,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { PATH } from '@/app/ec/(core)/constants/paths';
import { useAppAuth } from '@/providers/useAppAuth';
import { StatusIcon } from '@/app/ec/(core)/components/icons/statusIcon';
import { useCart } from '@/app/ec/(core)/hooks/useCart';
import { useEcOrder } from '@/app/ec/(core)/hooks/useEcOrder';
import { useEcPayment } from '@/app/ec/(core)/hooks/useEcPayment';
import { PaymentMethodManager } from '@/app/ec/(core)/feature/order/PaymentMethodManager';
import { CustomError } from '@/api/implement';
import { EcPaymentMethod, Gmo_Credit_Card } from '@prisma/client';
import { useAlert } from '@/contexts/AlertContext';
import { StoreCard } from '@/app/ec/(core)/components/cards/StoreCard';
import { ConvenienceCode } from '@/app/ec/(core)/constants/convenience';
import { AddressEditModal } from '@/app/ec/(core)/feature/order/AddressEditModal';
import {
  getLastPaymentMethod,
  savePaymentMethod,
  getLastConvenienceCode,
  saveConvenienceCode,
  getInsufficientProducts,
  clearInsufficientProducts,
} from '@/app/ec/(core)/utils/ecStorage';
import { InsufficientProduct } from '@/feature/deck/useDeckPurchaseOptionForm';
import { InsufficientProductsModal } from '@/feature/deck/InsufficientProductsModal';

export interface DisplayAccountInfo {
  id: number;
  fullName: string;
  prefecture: string;
  city: string;
  address: string;
  address2: string;
  building: string;
  zipCode: string;
}

export default function OrderPage() {
  const router = useRouter();
  const { getAccountInfo } = useAppAuth();
  const { createOrUpdateEcOrder } = useEcOrder();
  const { confirmOrder, isProcessing } = useEcPayment();
  const { setAlertState } = useAlert();
  const { draftCart, draftCartDetails, fetchDraftCartDetails, isLoading } =
    useCart();
  const [convenienceCode, setConvenienceCode] =
    useState<ConvenienceCode | null>(null);
  const [paymentMethodCandidates, setPaymentMethodCandidates] = useState<
    EcPaymentMethod[]
  >([]);

  // カート情報から計算される値
  const totalAmount =
    draftCart?.cart_stores.reduce(
      (sum, store) => sum + (store.total_price || 0),
      0,
    ) || 0;
  const totalShippingFee =
    draftCart?.cart_stores.reduce(
      (sum, store) => sum + (store.shipping_fee || 0),
      0,
    ) || 0;
  const [displayAccountInfo, setDisplayAccountInfo] =
    useState<DisplayAccountInfo>({
      id: 0,
      fullName: '',
      prefecture: '',
      city: '',
      address: '',
      address2: '',
      building: '',
      zipCode: '',
    });
  const [isAccountInfoLoading, setIsAccountInfoLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<EcPaymentMethod | null>(
    null,
  );
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  // 在庫不足商品のステート
  const [insufficientProducts, setInsufficientProducts] = useState<
    InsufficientProduct[]
  >([]);
  const [modalOpen, setModalOpen] = useState(false);

  // 注文情報を都道府県で更新し、paymentMethodCandidatesを取得する
  const updateOrderWithPrefecture = async (prefecture: string) => {
    if (!draftCart || !prefecture) {
      return null;
    }
    try {
      // カートストア情報を準備
      const cartStores = draftCart.cart_stores.map((store) => ({
        storeId: store.store_id,
        shippingMethodId: store.shipping_method_id ?? undefined,
        products: store.products.map((product) => ({
          productId: product.product_id,
          originalItemCount: product.original_item_count,
        })),
      }));

      // createOrUpdateEcOrderを呼び出してpaymentMethodCandidatesを取得
      const response = await createOrUpdateEcOrder({
        includesPaymentMethodCandidates: true,
        includesShippingMethodCandidates: true,
        body: {
          shippingAddressPrefecture: prefecture,
          cartStores: cartStores,
        },
      });

      if (response instanceof CustomError) {
        setAlertState({
          message: 'カート情報の更新に失敗しました',
          severity: 'error',
        });
        return null;
      }

      // paymentMethodCandidatesを設定
      if (response && response.paymentMethodCandidates) {
        setPaymentMethodCandidates(response.paymentMethodCandidates);
      }

      return response;
    } catch (error) {
      setAlertState({
        message: 'カート情報の更新中にエラーが発生しました',
        severity: 'error',
      });
      return null;
    }
  };

  // 決済方法候補がセットされた時に前回の決済方法を復元
  useEffect(() => {
    // paymentMethodCandidatesが空でない場合のみ処理を実行
    if (paymentMethodCandidates.length > 0) {
      const lastMethod = getLastPaymentMethod();
      const lastConvenienceCode = getLastConvenienceCode();

      if (lastMethod) {
        // 前回の決済方法が現在の候補に含まれているかチェック
        const isMethodAvailable = paymentMethodCandidates.includes(lastMethod);

        if (isMethodAvailable) {
          setPaymentMethod(lastMethod);
          if (
            lastMethod === EcPaymentMethod.CONVENIENCE_STORE &&
            lastConvenienceCode
          ) {
            setConvenienceCode(lastConvenienceCode);
          }
        }
      }
    }
  }, [paymentMethodCandidates]);

  // 画面初期化時のみ実行
  useEffect(() => {
    const fetchAccountInfo = async () => {
      setIsAccountInfoLoading(true);
      const accountInfo = await getAccountInfo();
      if (accountInfo instanceof CustomError) {
        setIsAccountInfoLoading(false);
        return null;
      }

      const info = {
        id: accountInfo.id,
        fullName: accountInfo.full_name ?? '',
        prefecture: accountInfo.prefecture ?? '',
        city: accountInfo.city ?? '',
        address: accountInfo.address ?? '',
        address2: accountInfo.address2 ?? '',
        building: accountInfo.building ?? '',
        zipCode: accountInfo.zip_code ?? '',
      };

      // アカウント情報の必須項目をチェック
      const requiredFields = [
        { field: 'display_name', value: accountInfo.display_name },
        { field: 'full_name', value: accountInfo.full_name },
        { field: 'full_name_ruby', value: accountInfo.full_name_ruby },
        { field: 'birthday', value: accountInfo.birthday },
        { field: 'phone_number', value: accountInfo.phone_number },
        { field: 'mail', value: accountInfo.mail },
        { field: 'zip_code', value: accountInfo.zip_code },
        { field: 'prefecture', value: accountInfo.prefecture },
        { field: 'city', value: accountInfo.city },
        { field: 'address2', value: accountInfo.address2 },
      ];

      const missingFields = requiredFields.filter(
        ({ value }) => !value || value.trim() === '',
      );

      if (missingFields.length > 0) {
        // 必須項目が未設定の場合、アカウント編集ページにリダイレクト
        // 未入力項目をクエリパラメータで渡す
        const missingFieldNames = missingFields.map(({ field }) => field);
        const queryParams = new URLSearchParams({
          missing: missingFieldNames.join(','),
        });
        router.push(`${PATH.ACCOUNT.edit}?${queryParams.toString()}`);
        return null;
      }

      setDisplayAccountInfo(info);
      setIsAccountInfoLoading(false);
      return info;
    };

    const initializePage = async () => {
      setIsInitializing(true);
      try {
        // 不足商品をチェックしてモーダル表示
        const products = getInsufficientProducts();
        if (products) {
          setInsufficientProducts(products);
          setModalOpen(true);
        }

        const accountInfo = await fetchAccountInfo();
        if (accountInfo && accountInfo.prefecture && draftCart) {
          // 都道府県情報でカート詳細を更新
          await updateOrderWithPrefecture(accountInfo.prefecture);
        }
      } finally {
        setIsInitializing(false);
      }
    };

    // draftCartが取得されてから初期化を実行
    if (draftCart) {
      initializePage();
    }
    // 初期化時のみ実行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftCart?.id]); // IDが変わった時のみ実行

  // 注文確定処理
  const handleConfirmOrder = async () => {
    if (!draftCart || !paymentMethod) {
      setAlertState({
        message: '注文情報または支払い方法が選択されていません',
        severity: 'error',
      });
      return;
    }

    try {
      // クレジットカード決済の場合はトークンが必要
      if (paymentMethod === EcPaymentMethod.CARD && !cardId) {
        setAlertState({
          message: 'クレジットカード情報が設定されていません',
          severity: 'error',
        });
        return;
      }

      // コンビニ決済の場合はコンビニコードが必要
      if (
        paymentMethod === EcPaymentMethod.CONVENIENCE_STORE &&
        !convenienceCode
      ) {
        setAlertState({
          message: 'コンビニエンスストアが選択されていません',
          severity: 'error',
        });
        return;
      }

      // 注文を確定する
      const result = await confirmOrder(
        draftCart.id,
        paymentMethod,
        totalAmount,
        cardId || undefined,
        convenienceCode || undefined,
      );

      if (result.success) {
        // クレジットカード決済でリダイレクトURLがある場合
        if (result.redirectUrl) {
          // 外部決済画面へリダイレクト
          window.location.href = result.redirectUrl;
        } else {
          // その他の決済方法または決済完了時は注文完了画面へ
          router.push(PATH.ORDER.result(draftCart.id.toString()));
        }
      }
    } catch (error) {
      setAlertState({
        message: '注文処理中にエラーが発生しました',
        severity: 'error',
      });
    }
  };

  const [cardId, setCardId] = useState<Gmo_Credit_Card['id'] | null>(null);
  const [cardLast4, setCardLast4] = useState<string | null>(null);

  const handleCloseModal = () => {
    setModalOpen(false);
    clearInsufficientProducts();
  };

  const handlePaymentMethodConfirm = (
    method: EcPaymentMethod,
    cardId?: Gmo_Credit_Card['id'],
    cardLast4?: string,
    convenienceCode?: ConvenienceCode,
  ) => {
    // 決済方法を保存
    savePaymentMethod(method);
    setPaymentMethod(method);

    // コンビニ決済の場合はconvenienceCodeも保存
    if (method === EcPaymentMethod.CONVENIENCE_STORE && convenienceCode) {
      saveConvenienceCode(convenienceCode);
    }

    // 既存の処理
    if (method === EcPaymentMethod.CARD && cardId) {
      setCardId(cardId);
      setCardLast4(cardLast4 || null);
      setConvenienceCode(null);
    } else if (
      method === EcPaymentMethod.CONVENIENCE_STORE &&
      convenienceCode
    ) {
      setCardId(null);
      setCardLast4(null);
      setConvenienceCode(convenienceCode);
    } else {
      setCardId(null);
      setCardLast4(null);
      setConvenienceCode(null);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ display: 'flex', alignItems: 'center', p: 0, mb: 1 }}>
        <StatusIcon current={2} total={3} />
        <Typography variant="h2" color="gray" sx={{ ml: 1, mr: 'auto' }}>
          ご注文内容の確認
        </Typography>
      </Box>

      <Box>
        {/* 注文完了時の表示 */}
        <Typography
          variant="body2"
          sx={{ textAlign: 'center', color: 'primary.main', mb: 1 }}
        >
          まだ注文は完了しておりません
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            sx={{ width: '100%', maxWidth: '350px' }}
            onClick={handleConfirmOrder}
            disabled={
              !draftCart?.cart_stores?.length || !paymentMethod || isProcessing
            }
          >
            {isProcessing ? '処理中...' : '注文を確定する'}
          </Button>
        </Box>

        {/* 注文確定前の表示 */}
        <Paper sx={{ p: 2, mb: 2 }}>
          {isLoading || isInitializing ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={36} />
            </Box>
          ) : (
            <>
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
              >
                <Typography variant="body2">商品の小計</Typography>
                <Typography variant="body2">
                  {(totalAmount - totalShippingFee).toLocaleString()}円
                </Typography>
              </Box>

              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
              >
                <Typography variant="body2">送料</Typography>
                <Typography variant="body2">
                  {totalShippingFee.toLocaleString()}円
                </Typography>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">ご請求額</Typography>
                <Typography variant="body2">
                  {totalAmount.toLocaleString()}円
                </Typography>
              </Box>
              {paymentMethod === EcPaymentMethod.CASH_ON_DELIVERY && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Typography variant="caption" color="grey.600">
                    ※別途代引き手数料がかかることがあります
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Paper>

        {/* 支払い方法選択 */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <PaymentMethodManager
            onPaymentMethodConfirm={handlePaymentMethodConfirm}
            paymentMethodCandidates={paymentMethodCandidates}
            cardLast4={cardLast4}
            convenienceCode={convenienceCode}
            initialPaymentMethod={paymentMethod}
          />
        </Paper>

        {/* お届け先 */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box>
            <Typography variant="body1" sx={{ mb: 1 }}>
              お届け先
            </Typography>
            {isAccountInfoLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={36} />
              </Box>
            ) : (
              <>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {/* 郵便番号がハイフンがある場合はそのまま表示、ない場合はハイフンを追加 */}
                    {displayAccountInfo.zipCode.includes('-')
                      ? displayAccountInfo.zipCode
                      : displayAccountInfo.zipCode.slice(0, 3) +
                        '-' +
                        displayAccountInfo.zipCode.slice(3)}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {displayAccountInfo.prefecture} {displayAccountInfo.city}{' '}
                    {displayAccountInfo.address2} {displayAccountInfo.building}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {displayAccountInfo.fullName}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="text"
                    color="primary"
                    size="small"
                    sx={{ textDecoration: 'underline', fontSize: '0.6rem' }}
                    onClick={() => setIsAddressModalOpen(true)}
                  >
                    お届け先を変更する
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Paper>

        {/* ショップごとの商品情報 */}
        {isLoading || isInitializing ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={36} />
          </Box>
        ) : !draftCart?.cart_stores?.length ? (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body1">商品情報がありません</Typography>
            </Box>
          </Paper>
        ) : (
          draftCart.cart_stores.map((store, storeIndex) => (
            <StoreCard
              key={store.store_id}
              store={store as any}
              storeIndex={storeIndex}
              totalStores={draftCart.cart_stores.length}
              onStockChange={() => {}}
              onDelete={() => {}}
              onShopChange={() => {}}
              onShippingMethodChange={() => {}}
              viewMode="order"
              enableUnification={true}
            />
          ))
        )}
      </Box>

      <AddressEditModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        currentAddress={displayAccountInfo}
        onUpdateSuccess={(newInfo) => {
          setDisplayAccountInfo({
            id: newInfo.id,
            fullName: newInfo.full_name ?? '',
            prefecture: newInfo.prefecture ?? '',
            city: newInfo.city ?? '',
            address: newInfo.address ?? '',
            address2: newInfo.address2 ?? '',
            building: newInfo.building ?? '',
            zipCode: newInfo.zip_code ?? '',
          });
        }}
      />

      <InsufficientProductsModal
        open={modalOpen}
        onClose={handleCloseModal}
        insufficientProducts={insufficientProducts}
      />
    </Container>
  );
}
