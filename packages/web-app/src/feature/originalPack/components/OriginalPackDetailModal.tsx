import React, { useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { OriginalPackSelectedPack } from '@/feature/originalPack/components/OriginalPackSelectedPack';
import { OriginalPackPackProductList } from '@/feature/originalPack/components/OriginalPackPackProductList';
import {
  OriginalPackItemType,
  OriginalPackProduct,
} from '@/app/auth/(dashboard)/original-pack/page';
import { useRouter } from 'next/navigation';
import { PATH } from '@/constants/paths';
import { ItemStatus, ItemType } from '@prisma/client';
import { useSaveLocalStorageOriginalPack } from '@/app/auth/(dashboard)/original-pack/create/components/confirm/hooks/useSaveLocalStorageOriginalPack';
import { useDeleteOriginalPackDraft } from '@/feature/originalPack/hooks/useDeleteOriginalPackDraft';
import { useStore } from '@/contexts/StoreContext';

interface OriginalPackDetailModalProps {
  open: boolean;
  onClose: () => void;
  handleSubmit: () => void;
  selectedItem: OriginalPackItemType | null;
  originalPackProducts: OriginalPackProduct[];
  setOriginalPackProducts: (products: OriginalPackProduct[]) => void;
  isLoading?: boolean;
  fetchTypeItems: (
    storeID: number,
    take?: number,
    type?: ItemType,
  ) => Promise<void>;
}

export const OriginalPackDetailModal: React.FC<
  OriginalPackDetailModalProps
> = ({
  open,
  onClose,
  handleSubmit,
  selectedItem,
  originalPackProducts,
  setOriginalPackProducts,
  isLoading = false,
  fetchTypeItems,
}) => {
  const [isComposing, setIsComposing] = useState(true);
  //補充機能
  const { push } = useRouter();
  const { store } = useStore();
  const { saveLocalStorageItem } = useSaveLocalStorageOriginalPack();
  const { deleteDraft, isLoading: isDeleting } = useDeleteOriginalPackDraft();
  const isDraftItem = useMemo<boolean>(
    () => selectedItem?.status === ItemStatus.DRAFT,
    [selectedItem],
  );
  const handleActionButtonClick = () => {
    if (!selectedItem) return; // null ガード
    localStorage.setItem('productInfo', JSON.stringify(selectedItem));
    if (isDraftItem) {
      // オリパ封入product情報をローカル保存
      saveLocalStorageItem(selectedItem.id, originalPackProducts);
      push(`${PATH.ORIGINAL_PACK.create}?id=${selectedItem.id}`);
    } else {
      push(`${PATH.ORIGINAL_PACK.create}?replenishment=true`);
    }
  };

  const handleDeleteDraft = async () => {
    //ドラフト削除処理をかませる
    if (!selectedItem) return;
    const { ok } = await deleteDraft(selectedItem.id);
    if (ok) {
      fetchTypeItems(store.id, undefined, ItemType.ORIGINAL_PACK);
      onClose();
    }
  };

  return (
    <CustomModalWithIcon
      open={open}
      onClose={onClose}
      title={'オリパ・福袋・デッキ詳細'}
      width="90%"
      height="90%"
      actionButtonText={isDraftItem ? '再開' : '補充'}
      onActionButtonClick={handleActionButtonClick}
      isAble={!isLoading && !isComposing}
      onCancelClick={onClose}
      cancelButtonText="とじる"
      secondActionButtonText={isDraftItem ? '破棄' : '解体'}
      isSecondActionButtonLoading={isDraftItem ? isDeleting : false}
      onSecondActionButtonClick={isDraftItem ? handleDeleteDraft : handleSubmit}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          gap: 2,
        }}
      >
        <OriginalPackSelectedPack
          selectedItem={selectedItem}
          originalPackProducts={originalPackProducts}
        />
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <OriginalPackPackProductList
            selectedItem={selectedItem}
            originalPackProducts={originalPackProducts}
            setOriginalPackProducts={setOriginalPackProducts}
            isComposing={isComposing}
            setIsComposing={setIsComposing}
          />
        </Box>
      </Box>
    </CustomModalWithIcon>
  );
};
