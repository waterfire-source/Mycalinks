'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { PATH } from '@/constants/paths';
import {
  GuestOrderCartProvider,
  useGuestOrderCart,
} from '@/contexts/GuestOrderCartContext';
import { Header } from '@/app/guest/[storeId]/stock/components/Header';
import { GenreListContent } from '@/app/guest/[storeId]/stock/components/GenreListContent';
import { ItemListContent } from '@/app/guest/[storeId]/stock/components/ItemListContent';
import { OrderCompleteContent } from '@/app/guest/[storeId]/stock/components/OrderCompleteContent';
import { CartConfirmationModal } from '@/app/guest/[storeId]/stock/components/CartConfirmationModal';
import { ResetCartModal } from '@/app/guest/[storeId]/stock/components/ResetCartModal';
import { useParamsInGuest } from '@/app/guest/[storeId]/stock/hooks/useParamsInGuest';
import { useEposDevice } from '@/contexts/EposDeviceContext';

export default function StockPage() {
  return (
    <GuestOrderCartProvider>
      <StockPageContent />
    </GuestOrderCartProvider>
  );
}

const StockPageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cartItems, clearCart } = useGuestOrderCart();
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  // Use the proper param key: our URL now holds the encoded string in "storeId"
  const { encodedParams, printerSerialNumber } = useParamsInGuest();

  const genreId = searchParams.get('genreId');

  const IDLE_TIMEOUT = 120; // タイムアウト時間（秒）
  const [showResetModal, setShowResetModal] = useState(false);
  const [receptionNumber, setReceptionNumber] = useState<number | null>(null);

  const { setSerialCode, serialCode, setUpEpos } = useEposDevice();

  //シリアルコードを設定
  useEffect(() => {
    if (printerSerialNumber) {
      console.log(printerSerialNumber);
      setSerialCode(printerSerialNumber);
    }
  }, [printerSerialNumber]);

  //eposをセットアップ
  useEffect(() => {
    setUpEpos();
  }, [serialCode]);

  // タイムアウト処理
  useEffect(() => {
    // タイムアウト処理をスキップする条件：
    // - `注文完了後
    if (orderCompleted) {
      return;
    }

    // タイムアウト処理を実行する条件：以下の OR 条件
    // - `genreId` がある（ジャンル選択後）
    // - `cartItems.length > 0`（カートに商品がある）
    if (!genreId && cartItems.length === 0) {
      return;
    }

    let timeoutId: NodeJS.Timeout;

    const startTimeout = () => {
      timeoutId = setTimeout(() => {
        setShowResetModal(true);
      }, IDLE_TIMEOUT * 1000);
    };

    const resetTimer = () => {
      clearTimeout(timeoutId);
      startTimeout();
    };

    startTimeout();

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('touchstart', resetTimer);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, [cartItems.length, genreId, orderCompleted]);

  const handleResetCart = () => {
    clearCart();
    setShowResetModal(false);
    setIsCartOpen(false);
    router.push(PATH.GUEST_STOCK.root(encodedParams));
  };

  // ジャンル選択時のURL更新処理
  const handleGenreSelect = (selectedGenreId: string) => {
    router.push(
      `${PATH.GUEST_STOCK.root(
        encodedParams,
      )}?genreId=${selectedGenreId}&hasStock=true`,
    );
  };

  // 注文確定時に完了画面を表示
  const handleOrderComplete = (receptionNumber: number) => {
    setReceptionNumber(receptionNumber);
    setOrderCompleted(true);
    clearCart();
    setIsCartOpen(false);
  };

  // 注文完了画面から戻る処理
  const handleBackToGenreSelect = () => {
    setOrderCompleted(false);
    setReceptionNumber(null);
    clearCart();
    router.push(PATH.GUEST_STOCK.root(encodedParams));
  };

  return (
    <>
      <Header openCart={openCart} isOrderCompleted={orderCompleted} />
      {orderCompleted ? (
        <OrderCompleteContent
          receptionNumber={receptionNumber}
          onBackToGenreSelect={handleBackToGenreSelect}
        />
      ) : genreId ? (
        // ジャンルが選択済みの場合は在庫検索を表示
        <ItemListContent />
      ) : (
        // ジャンルが未選択の場合はジャンル一覧を表示
        <GenreListContent onSelect={handleGenreSelect} />
      )}
      <CartConfirmationModal
        open={isCartOpen}
        onClose={closeCart}
        onOrderComplete={handleOrderComplete}
      />
      <ResetCartModal
        open={showResetModal}
        onClose={() => setShowResetModal(false)}
        onResetCart={handleResetCart}
      />
    </>
  );
};
