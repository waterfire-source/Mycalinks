import React, { useState, useEffect, useMemo } from 'react';
import { Box } from '@mui/material';
import {
  OriginalPackItemType,
  OriginalPackProduct,
} from '@/app/auth/(dashboard)/original-pack/page';
import { DetailCard } from '@/components/cards/DetailCard';
import { OriginalPackDisassemblyProductList } from '@/feature/originalPack/disassembly/components/OriginalPackDisassemblyProductList';
import { DetailCardContent } from '@/feature/originalPack/disassembly/components/DetailCardContent';
import { DetailCardBottomContent } from '@/feature/originalPack/disassembly/components/DetailCardBottomContent';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useSession } from 'next-auth/react';
import { useConfirmationModal } from '@/contexts/ConfirmationModalContext';

interface OriginalPackDisassemblyConfirmationProps {
  storeId: number;
  originalPack: OriginalPackItemType | null;
  originalPackProducts: OriginalPackProduct[];
  onPrevPage: () => void;
  onCompleted: () => void;
}
export const OriginalPackDisassemblyConfirmation: React.FC<
  OriginalPackDisassemblyConfirmationProps
> = ({
  storeId,
  originalPack,
  originalPackProducts,
  onPrevPage: handlePrevPage,
  onCompleted,
}: OriginalPackDisassemblyConfirmationProps) => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { data: session } = useSession();
  const staffAccountId = session?.user?.id;
  const { setAlertState } = useAlert();
  const [isDisabled, setIsDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  // 解体数
  const [numberOfDisassemblyItems, setNumberOfDisassemblyItems] = useState(0);
  // 画面遷移確認モーダル表示の制御
  const { setModalVisible } = useConfirmationModal();

  // バリデーション
  useEffect(() => {
    if (
      storeId &&
      staffAccountId &&
      originalPack &&
      originalPack.original_pack_products &&
      originalPackProducts &&
      originalPackProducts.length > 0
    ) {
      setIsDisabled(false);
      return;
    }
    setIsDisabled(true);
  }, [
    storeId,
    staffAccountId,
    originalPack,
    originalPackProducts,
    numberOfDisassemblyItems,
  ]);

  //登録処理
  const handleConfirm = async () => {
    if (
      !storeId ||
      !staffAccountId ||
      !originalPack ||
      !originalPack.original_pack_products ||
      !originalPackProducts
    ) {
      setAlertState({
        message: '必要な情報が不足しています。',
        severity: 'error',
      });
      return;
    }

    setIsLoading(true);
    const toProducts = originalPackProducts.map((product) => ({
      product_id: product.id,
      item_count: product.item_count,
      staff_account_id: Number(staffAccountId),
    }));
    //※[スマホ版対応]パラメーター追加
    const response = await clientAPI.product.disassemblyOriginalPack({
      storeID: storeId,
      productID: originalPack.products[0].id,
      body: {
        staff_account_id: Number(staffAccountId),
        itemCount: numberOfDisassemblyItems,
        to_products: toProducts,
      },
    });

    setIsLoading(false);
    if (response instanceof CustomError) {
      console.error('オリパの解体に失敗しました。');
      setAlertState({
        message: `${response.status}:${response.message}`,
        severity: 'error',
      });
      return;
    }

    // 成功時の処理
    setAlertState({
      message: `解体が完了しました。`,
      severity: 'success',
    });

    // 2秒後に移動
    setTimeout(() => {
      onCompleted();
    }, 2000);

    // 画面遷移確認モーダル表示の制御
    setModalVisible(false);
  };
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        flexDirection: 'row',
        gap: 2,
        height: '100%',
      }}
    >
      <Box sx={{ flex: 2, minWidth: 0 }}>
        <OriginalPackDisassemblyProductList
          originalPackProducts={originalPackProducts}
        />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <DetailCard
          title="解体結果"
          content={
            <DetailCardContent
              originalPack={originalPack}
              originalPackProducts={originalPackProducts}
              numberOfDisassemblyItems={numberOfDisassemblyItems}
              setNumberOfDisassemblyItems={setNumberOfDisassemblyItems}
            />
          }
          bottomContent={
            <DetailCardBottomContent
              isLoading={isLoading}
              isDisabled={isDisabled}
              onNextPage={handleConfirm}
              onPrevPage={handlePrevPage}
            />
          }
        />
      </Box>
    </Box>
  );
};
