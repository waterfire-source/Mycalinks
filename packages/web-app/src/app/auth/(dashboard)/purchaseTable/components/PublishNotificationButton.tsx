import { useState } from 'react';
import { PublishNotificationModal } from '@/app/auth/(dashboard)/purchaseTable/components/PublishNotificationModal';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { Box } from '@mui/material';
import { PurchaseTableResponse } from '@/feature/purchaseTable/hooks/usePurchaseTable';

interface Props {
  purchaseTableId: number;
  genreHandle: string | null;
  displayOnApp: boolean;
  fetchPurchaseTable: (
    take?: number,
    skip?: number,
  ) => Promise<PurchaseTableResponse | undefined>;
}
export const PublishNotificationButton = ({
  purchaseTableId,
  genreHandle,
  displayOnApp,
  fetchPurchaseTable,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box onClick={(e) => e.stopPropagation()}>
      <SecondaryButton
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
      >
        {displayOnApp ? '通知' : '公開'}
      </SecondaryButton>

      {/* app公開/通知モーダル */}
      <PublishNotificationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        purchaseTableId={purchaseTableId}
        genreHandle={genreHandle}
        displayOnApp={displayOnApp}
        fetchPurchaseTable={fetchPurchaseTable}
      />
    </Box>
  );
};
