'use client';

import { useState } from 'react';
import { Box, Button, Container, Divider } from '@mui/material';
import { StockChangeCard } from '@/feature/stock/components/StockChange/StockChangeCard';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { MobileItemSearchSection } from '@/components/common/MobileItemSearchSection';
import { BackendItemAPI } from '@/app/api/store/[store_id]/item/api';
import { useAlert } from '@/contexts/AlertContext';
import { createClientAPI } from '@/api/implement';
import { useSession } from 'next-auth/react';
import { useStore } from '@/contexts/StoreContext';
import { CustomError } from '@/api/implement';

interface CardData {
  id: number; // カードの一意のID
  productId: number; // 取得した商品のID
  stockChange: number; // 変更在庫数情報
  stockChangeInfo: string; // 変動数
  destination: string; // 商品名
  condition: string; // 商品の状態
  note: string; // 備考
  conditionDisplayName: string; // コンディションの表示名
}

interface Props {
  originalProductID: number | undefined;
  stock: number | undefined;
  fetchStockChangeHistory: () => void;
}

export function StockChange({
  originalProductID,
  stock,
  fetchStockChangeHistory,
}: Props) {
  const { data: session } = useSession();
  const [cards, setCards] = useState<CardData[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [currentStock, setCurrentStock] = useState<number | undefined>(stock);
  const { setAlertState } = useAlert();
  const clientAPI = createClientAPI();
  const staffAccountID = session?.user?.id;
  const { store } = useStore();

  const handleAddToCart = (
    productId: number,
    row: BackendItemAPI[0]['response']['200']['items'][0],
    registerCount: number,
  ) => {
    console.info(
      '現状の在庫数',
      currentStock,
      '取得したプロダクトID:',
      productId,
      'プロダクト情報:',
      row,
      '変動在庫数:',
      registerCount,
    );

    const selectedProduct = row.products.find(
      (product) => product.id === productId,
    );

    if (!selectedProduct) {
      console.warn('対象の商品が見つかりません');
      return;
    }

    if (!currentStock || currentStock - registerCount < 0) {
      setAlertState({
        message: '在庫が不足しています',
        severity: 'error',
      });
      return;
    }

    // 変動在庫部分
    const updatedStockNumber = currentStock - registerCount;
    setCurrentStock(updatedStockNumber);

    const newCard: CardData = {
      id: cards.length + 1,
      productId: productId,
      stockChange: registerCount,
      stockChangeInfo: `(${currentStock}→${updatedStockNumber})`,
      destination: selectedProduct.display_name || '不明な商品名',
      condition: selectedProduct.condition_option_display_name || '不明',
      note: '',
      conditionDisplayName:
        selectedProduct.condition_option_display_name || '不明なコンディション',
    };

    setCards((prevCards) => [...prevCards, newCard]);
    setShowSearch(false);
  };

  // 在庫変更の取り消し
  const deleteCard = (id: number) => {
    const cardToDelete = cards.find((card) => card.id === id);
    if (cardToDelete) {
      setCurrentStock((prevStock) =>
        prevStock !== undefined
          ? prevStock + cardToDelete.stockChange
          : prevStock,
      );
    }
    setCards((prevCards) => prevCards.filter((card) => card.id !== id));
  };

  // 在庫変更の実行
  const confirmChanges = async () => {
    if (!originalProductID) {
      setAlertState({
        message: '商品が設定されていません。',
        severity: 'error',
      });
      return;
    }

    console.info('確定された変更内容:', cards);
    let hasError = false;

    // 在庫数を並列で変更しようとするとエラー吐かれるので逐次処理で実行
    for (const card of cards) {
      // 商品変更を行う
      const response = await clientAPI.product.createTransfer({
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        storeID: store?.id!,
        productID: originalProductID,
        body: {
          to_product_id: card.productId,
          item_count: card.stockChange,
          description: card.note || null,
          staff_account_id: Number(staffAccountID),
        },
      });

      if (response instanceof CustomError) {
        hasError = true;
        setAlertState({
          message: `エラーが発生しました。`,
          severity: 'error',
        });
      } else {
        console.info(
          `成功: 商品ID ${response.id}, 変更先在庫数: ${response.resultStockNumber}`,
        );
      }
    }

    if (!hasError) {
      setAlertState({
        message: 'すべての変更が正常に確定されました。',
        severity: 'success',
      });
      setCards([]); // カードをリセット
      fetchStockChangeHistory(); // 在庫変動履歴を再取得
    }
  };

  // 備考欄記載処理
  const handleNoteChange = (id: number, newNote: string) => {
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === id ? { ...card, note: newNote } : card,
      ),
    );
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        paddingLeft: 0,
        paddingRight: 0,
        marginTop: 1,
      }}
    >
      {showSearch ? (
        <MobileItemSearchSection onRegister={handleAddToCart} height="600px" />
      ) : (
        <>
          {cards.map((card) => (
            <Box key={card.id}>
              <StockChangeCard
                id={card.id}
                stockChange={`${card.stockChange} ${card.stockChangeInfo}`}
                destination={card.destination}
                condition={card.condition}
                note={card.note}
                onDelete={deleteCard}
                onNoteChange={handleNoteChange}
              />
              {card.id !== cards[cards.length - 1].id && (
                <Divider sx={{ marginY: 2 }} />
              )}
            </Box>
          ))}
          <Divider sx={{ marginY: 2 }} />
          <Box textAlign="center" mt={2}>
            <Button
              variant="outlined"
              onClick={() => setShowSearch(true)}
              sx={{
                minWidth: '45px',
                height: '25px',
                marginBottom: 2,
                color: 'black',
                borderColor: 'black',
                backgroundColor: 'white',
                '&:hover': {
                  borderColor: 'black',
                },
              }}
            >
              +
            </Button>
          </Box>
          <Box textAlign="center">
            <PrimaryButton
              variant="contained"
              sx={{ width: '60%' }}
              onClick={confirmChanges}
              disabled={!originalProductID || cards.length === 0}
            >
              確定
            </PrimaryButton>
          </Box>
        </>
      )}
    </Container>
  );
}
