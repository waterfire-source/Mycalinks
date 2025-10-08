import { InventoryAPIRes } from '@/api/frontend/inventory/api';
import { createClientAPI, CustomError } from '@/api/implement';
import { CountableProductType } from '@/app/auth/(dashboard)/inventory-count/[inventoryId]/[shelfId]/components/InventoryCount';
import { InventoryCountInfo } from '@/app/auth/(dashboard)/inventory-count/[inventoryId]/[shelfId]/components/InventoryCountInfo';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { PATH } from '@/constants/paths';
import { useAlert } from '@/contexts/AlertContext';
import { Store } from '@prisma/client';
import { ShelfButtons } from '@/feature/inventory-count/components/edit/ShelfButtons';
import { Stack } from '@mui/material';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ShelfSelectedModal } from '@/app/auth/(dashboard)/inventory-count/components/modal/ShelfSelectedModal';
import { ActionSelectModal } from '@/components/modals/ActionSelectModal';
import { DetailViewType } from '@/app/auth/(dashboard)/inventory-count/page';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { useInventoryProducts } from '@/feature/inventory-count/hook/useInventoryProducts';
import { InventoryCountData } from '@/feature/inventory-count/hook/useInventoryCount';
import { ConfirmCompletionModal } from '@/app/auth/(dashboard)/inventory-count/components/modal/ConfirmCompletionModal';
import { InjectWholesaleModal } from '@/app/auth/(dashboard)/inventory-count/components/modal/InjectWholesaleModal';
import { InventoryProductTable } from '@/app/auth/(dashboard)/inventory-count/components/InventoryProductTable';

export type CountableProductWithId = CountableProductType & {
  shelf_id: number;
  unique_id: string;
};

interface InventoryCountDetailModalProps {
  open: boolean;
  onClose: () => void;
  store: Store;
  selectedInventoryCount: InventoryCountData | null;
  fetchData: () => void;
  status: string; //csvボタンの表示で使用
  onDeleteButtonClick: () => void;
  detailViewType: DetailViewType;
  handleExportCsv: () => void;
  handleConfirm: (adjust: boolean) => Promise<{ ok: boolean }>;
}

export const InventoryCountDetailModal = ({
  open,
  onClose,
  store,
  selectedInventoryCount,
  status,
  fetchData,
  onDeleteButtonClick,
  detailViewType,
  handleExportCsv,
  handleConfirm,
}: InventoryCountDetailModalProps) => {
  const clientAPI = createClientAPI();
  const router = useRouter();
  const { setAlertState } = useAlert();
  const {
    inventoryProducts: unInjectedWholesalePriceProducts,
    fetchInventoryProducts,
    isLoadingInventoryProducts,
  } = useInventoryProducts();

  // 棚卸完了モーダル関連の状態
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isOpenInjectModal, setIsOpenInjectModal] = useState(false);
  const [isShelfModalOpen, setIsShelfModalOpen] = useState(false);
  const [isOpenModeSelectModal, setIsOpenModeSelectModal] = useState(false);

  // 棚のリストを管理
  const [shelfs, setShelfs] = useState<InventoryAPIRes['getShelfs']['shelfs']>(
    [],
  );
  // 選択された棚IDを管理
  const [selectedShelfId, setSelectedShelfId] = useState<number | 'all'>('all');

  //追加した商品の数量と合計
  const [totals, setTotals] = useState<{
    totalAmount: number | bigint; // 合計金額
    totalQuantity: number; // 合計数量
  }>({
    totalAmount: 0,
    totalQuantity: 0,
  });
  //在庫数の数量と合計
  const [stockTotals, setStockTotals] = useState<{
    totalAmount: number | bigint; // 合計金額
    totalQuantity: number; // 合計数量
  }>({
    totalAmount: 0,
    totalQuantity: 0,
  });

  // 棚卸情報取得後、productデータを取得
  useEffect(() => {
    if (selectedInventoryCount && open) {
      setStockTotals({
        totalAmount: Number(selectedInventoryCount.targetTotalWholesalePrice),
        totalQuantity: selectedInventoryCount.targetCount,
      });

      setTotals({
        totalAmount: Number(selectedInventoryCount.inputTotalWholesalePrice),
        totalQuantity: selectedInventoryCount.inputCount,
      });

      fetchInventoryProducts({
        inventoryId: selectedInventoryCount.id,
        isInjectedWholesalePrice: false,
      });
    }
  }, [selectedInventoryCount, open, store.id, fetchInventoryProducts]);

  // 棚のリストを取得
  useEffect(() => {
    if (!open) return;
    const fetchData = async () => {
      try {
        const shelfsResponse = await clientAPI.inventory.getShelfs({
          storeID: store.id,
        });
        if (shelfsResponse instanceof CustomError) {
          setAlertState({ message: shelfsResponse.message, severity: 'error' });
          return;
        }
        setShelfs(shelfsResponse.shelfs);
      } catch (error) {
        setAlertState({
          message: '棚情報の取得に失敗しました',
          severity: 'error',
        });
        return;
      }
    };
    fetchData();
  }, [open, store.id]);

  // ========== 関数 ==========
  // 棚ごとに登録するモーダル開始
  const handleRegisterByShelf = (shelfId: number | 'all') => {
    if (shelfId === 'all' || !selectedInventoryCount) return;
    router.push(
      `${PATH.INVENTORY_COUNT.root}/${selectedInventoryCount.id}/${shelfId}`,
    );
  };

  // 棚卸詳細モーダルを閉じる
  const handleCloseModal = () => {
    onClose();
    setSelectedShelfId('all');
    setIsOpenModeSelectModal(false);
    setIsCompleteModalOpen(false);
    setIsOpenInjectModal(false);
  };

  // 棚卸し完了後の動線管理
  const handleCompleteInventory = async (adjust: boolean) => {
    const { ok } = await handleConfirm(adjust);
    if (ok && selectedInventoryCount && adjust) {
      // fetchInventoryProductsの戻り値から直接判定
      const updatedProducts = await fetchInventoryProducts({
        inventoryId: selectedInventoryCount.id,
        isInjectedWholesalePrice: false,
        take: -1, // -1で全件取得
      });

      if (updatedProducts) {
        const hasUnInjected = updatedProducts.products.some(
          (product) => product.wholesale_price_injected === false,
        );

        if (hasUnInjected) {
          handleCloseModal();
          setIsOpenInjectModal(true);
        } else {
          handleCloseModal();
          fetchData();
        }
      } else {
        handleCloseModal();
      }
    } else {
      handleCloseModal();
      fetchData();
    }
  };

  // ==================== 表データ類 ===================
  // 棚の選択変更ハンドラ
  const handleShelfChange = useCallback((shelfId: number | 'all') => {
    setSelectedShelfId(shelfId);
  }, []);
  // ------------------- その他 -------------------
  // モーダルボタンの設定
  const modalButtonConfig = useMemo(() => {
    const isCompleteMode = detailViewType === 'complete';
    const hasWholesalePriceIssues = !!unInjectedWholesalePriceProducts.length;

    return {
      // ボタン全体の表示制御
      hideButtons: isCompleteMode && !hasWholesalePriceIssues,

      // メインボタン（右端）
      actionButtonText: isCompleteMode
        ? undefined
        : detailViewType === 'create'
        ? '開始'
        : '再開・完了',
      onActionButtonClick: isCompleteMode
        ? undefined
        : detailViewType === 'create'
        ? () => setIsShelfModalOpen(true)
        : () => setIsOpenModeSelectModal(true),

      // セカンドボタン（中央）
      secondActionButtonText: isCompleteMode
        ? undefined
        : detailViewType === 'edit'
        ? '削除'
        : '一時中断',
      onSecondActionButtonClick: isCompleteMode
        ? undefined
        : detailViewType === 'edit'
        ? onDeleteButtonClick
        : handleCloseModal,

      // サードボタン（仕入れ値入力用）
      thirdActionButtonText: hasWholesalePriceIssues
        ? '仕入れ値入力'
        : undefined,
      onThirdActionButtonClick: hasWholesalePriceIssues
        ? () => setIsOpenInjectModal(true)
        : undefined,
    };
  }, [detailViewType, onDeleteButtonClick, unInjectedWholesalePriceProducts]);

  return (
    <>
      <CustomModalWithIcon
        title={selectedInventoryCount?.title ?? '棚卸詳細'}
        open={open}
        onClose={handleCloseModal}
        hideButtons={modalButtonConfig.hideButtons}
        cancelButtonText="キャンセル"
        actionButtonText={modalButtonConfig.actionButtonText}
        onActionButtonClick={modalButtonConfig.onActionButtonClick}
        secondActionButtonText={modalButtonConfig.secondActionButtonText}
        onSecondActionButtonClick={modalButtonConfig.onSecondActionButtonClick}
        thirdActionButtonText={modalButtonConfig.thirdActionButtonText}
        onThirdActionButtonClick={modalButtonConfig.onThirdActionButtonClick}
        width="90%"
        height="90%"
      >
        <Stack spacing={2} width="100%" height="100%">
          <InventoryCountInfo totals={totals} stockTotals={stockTotals} />
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="space-between"
          >
            <ShelfButtons
              shelfs={shelfs}
              selectedShelfId={selectedShelfId}
              onShelfChange={handleShelfChange}
            />
            {/* CSV出力ボタンの追加 */}
            {status === '完了' && (
              <SecondaryButton onClick={handleExportCsv}>
                CSV出力
              </SecondaryButton>
            )}
          </Stack>

          {/* テーブル */}
          <Stack
            sx={{
              flex: 1,
              minWidth: 0,
              width: '100%',
              overflow: 'hidden',
            }}
          >
            <InventoryProductTable
              selectedInventoryCount={selectedInventoryCount}
              selectedShelfId={selectedShelfId}
              isLoading={isLoadingInventoryProducts}
            />
          </Stack>
        </Stack>
      </CustomModalWithIcon>

      {/* 棚選択モーダル（→棚ごとに商品追加へ） */}
      <ShelfSelectedModal
        open={isShelfModalOpen}
        onClose={() => setIsShelfModalOpen(false)}
        onConfirm={handleRegisterByShelf}
        shelfs={shelfs}
      />

      <ActionSelectModal
        isOpen={isOpenModeSelectModal}
        onClose={() => setIsOpenModeSelectModal(false)}
        option1={{ label: '再開', onClick: () => setIsShelfModalOpen(true) }}
        option2={{
          label: '完了',
          onClick: () => {
            setIsCompleteModalOpen(true);
          },
        }}
      />

      {/* 棚卸完了モーダル */}
      <ConfirmCompletionModal
        isCompleteModalOpen={isCompleteModalOpen}
        setIsCompleteModalOpen={setIsCompleteModalOpen}
        handleConfirm={handleCompleteInventory}
      />

      {selectedInventoryCount && (
        <InjectWholesaleModal
          open={isOpenInjectModal}
          onClose={() => setIsOpenInjectModal(false)}
          handleCloseModal={() => {
            fetchData();
            handleCloseModal();
          }}
          inventoryId={selectedInventoryCount.id}
          unInjectedProducts={unInjectedWholesalePriceProducts}
        />
      )}
    </>
  );
};
