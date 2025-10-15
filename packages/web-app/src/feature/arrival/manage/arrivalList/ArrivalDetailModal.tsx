import { BackendStockingAPI } from '@/app/api/store/[store_id]/stocking/api';
import { HelpIcon } from '@/components/common/HelpIcon';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { useCancelStocking } from '@/feature/arrival/hooks/useCancelStocking';
import { useUpdateStocking } from '@/feature/arrival/hooks/useUpdateStocking';
import { EditContent } from '@/feature/arrival/manage/arrivalList/cell/actions/detail/NotYet/EditContent';
import { StockingStatus } from '@prisma/client';
import { useEffect, useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  stocking: BackendStockingAPI[5]['response']['200'][0];
  search: () => Promise<void>;
}

export const ArrivalDetailModal = ({
  isOpen,
  onClose,
  stocking,
  search,
}: Props) => {
  const {
    cancelStocking,
    isLoading: isCancelling,
    rollbackStocking,
  } = useCancelStocking();

  const isFromStoreShipment = !!stocking.from_store_shipment_id;

  const {
    editStocking,
    setEditStocking,
    updateStocking,
    isLoading: isUpDating,
  } = useUpdateStocking(stocking);

  useEffect(() => {
    setEditStocking(stocking);
  }, [setEditStocking, stocking]);

  const handleUpdateStocking = async () => {
    const res = await updateStocking();
    if (res) {
      search();
      onClose();
    }
  };

  const handleCancelStocking = async () => {
    const res = await cancelStocking({ stocking });
    if (res) {
      search();
      onClose();
    }
  };

  const handleRollbackStocking = async () => {
    const res = await rollbackStocking({ stocking });
    if (res) {
      search();
      onClose();
    } else {
      setWhichDialogOpen('rollbackFailed');
    }
  };

  const updateProps =
    stocking.status === StockingStatus.NOT_YET
      ? {
          onActionButtonClick: handleUpdateStocking,
          actionButtonText: isFromStoreShipment ? undefined : '編集内容を保存',
        }
      : {};

  const isNotYet = stocking.status === StockingStatus.NOT_YET;
  const [whichDialogOpen, setWhichDialogOpen] = useState<
    'rollbackFailed' | 'confirmRollback' | 'confirmCancel' | null
  >(null);

  return (
    <CustomModalWithIcon
      open={isOpen}
      onClose={onClose}
      title={isNotYet ? '納品予定詳細' : '納品詳細'}
      {...updateProps}
      cancelButtonText={
        isNotYet && !isFromStoreShipment ? '編集内容を破棄' : 'もどる'
      }
      cancelCustomActionButton={<HelpIcon helpArchivesNumber={1368} />}
      secondActionButtonText={isNotYet ? '発注キャンセル' : '納品取り消し'}
      secondCustomActionButton={
        isNotYet ? (
          <>
            <HelpIcon helpArchivesNumber={1381} />
            
          </>
        ) : null
      }
      onSecondActionButtonClick={
        isNotYet
          ? () => setWhichDialogOpen('confirmCancel')
          : () => setWhichDialogOpen('confirmRollback')
      }
      loading={isCancelling || isUpDating}
      width="95%"
      height="85%"
    >
      <EditContent
        isFromStoreShipment={isFromStoreShipment}
        editStocking={editStocking}
        setEditStocking={setEditStocking}
      />

      {/* 三項演算子にすると、とじるボタンを押した時にテキスト内容が変わってしまうため3つ作る */}
      {whichDialogOpen === 'confirmCancel' && (
        <ConfirmationDialog
          isLoading={isCancelling}
          open
          onClose={() => setWhichDialogOpen(null)}
          title="発注キャンセル"
          message="発注をキャンセルしますか？"
          onConfirm={handleCancelStocking}
          confirmButtonText="発注キャンセル"
        />
      )}
      {whichDialogOpen === 'confirmRollback' && (
        <ConfirmationDialog
          isLoading={isCancelling}
          open
          onClose={() => setWhichDialogOpen(null)}
          title="納品取り消し"
          message="納品を取り消し、納品時の在庫状態に戻しますか"
          onConfirm={handleRollbackStocking}
          confirmButtonText="取り消す"
          cancelButtonText="取り消さない"
        />
      )}
      {whichDialogOpen === 'rollbackFailed' && (
        <ConfirmationDialog
          isLoading={isCancelling}
          open
          onClose={() => setWhichDialogOpen(null)}
          title="納品取り消しができません"
          message="登録された商品が取引や在庫変換等の処理を受けたため、この納品は取り消しができません"
          onConfirm={handleCancelStocking}
          cancelButtonText="閉じる"
        />
      )}
    </CustomModalWithIcon>
  );
};
