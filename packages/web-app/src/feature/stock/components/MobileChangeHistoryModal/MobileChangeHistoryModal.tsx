'use client';

import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { StockDetailsTab } from '@/feature/stock/components/StockDetailsTab/StockDetailsTab';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { Store } from '@/contexts/StoreContext';

interface MobileChangeHistoryModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editItem: BackendProductAPI[0]['response']['200']['products'][0] | null;
  store: Store | null;
  staffAccountID: string | undefined;
  setIsUpdated: React.Dispatch<React.SetStateAction<boolean>>;
}

export function MobileChangeHistoryModal({
  isOpen,
  setIsOpen,
  editItem,
  store,
  staffAccountID,
  setIsUpdated,
}: MobileChangeHistoryModalProps) {
  const handleClose = () => setIsOpen(false);

  return (
    <Dialog open={isOpen} onClose={handleClose} fullWidth>
      <DialogTitle
        sx={{
          textAlign: 'center',
          backgroundColor: 'grey.700',
          color: 'text.secondary',
          fontSize: '12px', // タイトルのフォントサイズ調整
          padding: '5px', // パディング調整
        }}
      >
        在庫詳細
      </DialogTitle>
      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        <StockDetailsTab
          editItem={editItem}
          store={store}
          staffAccountID={staffAccountID}
          setIsUpdated={setIsUpdated}
        />
      </DialogContent>
    </Dialog>
  );
}
