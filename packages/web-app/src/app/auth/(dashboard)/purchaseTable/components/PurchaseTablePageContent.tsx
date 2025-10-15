import { CreatePurchaseTableModal } from '@/app/auth/(dashboard)/purchaseTable/components/CreatePurchaseTableModal/CreatePurchaseTableModal';
import { PurchaseTableList } from '@/app/auth/(dashboard)/purchaseTable/components/PurchaseTableList';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
// import { useConfirmationModal } from '@/contexts/ConfirmationModalContext';
import { useStore } from '@/contexts/StoreContext';
import { usePurchaseTable } from '@/feature/purchaseTable/hooks/usePurchaseTable';
import { Box, TextField, Stack } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useEffect, useState } from 'react';

export type PurchaseTableInfo = {
  title: string;
  color: string;
  comment?: string;
  customTemplateImageUrl?: string;
  format: string;
  order: string;
  showStoreName: boolean;
  items: {
    itemId: number;
    displayPrice: number;
    anyModelNumber: boolean;
    isPsa10: boolean;
    orderNumber: number;
    imageUrl?: string;
    displayName?: string;
  }[];
};

export const PurchaseTablePageContent = () => {
  const { store } = useStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [itemsInfo, setItemsInfo] = useState<PurchaseTableInfo>();
  const { results, fetchPurchaseTable, isLoading } = usePurchaseTable(store.id);
  const [isCreated, setIsCreated] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPurchaseTable(20, 0, searchTerm);
  }, [fetchPurchaseTable, store.id, searchTerm]);

  useEffect(() => {
    if (itemsInfo) {
      setIsCreateModalOpen(true);
    }
  }, [itemsInfo]);

  return (
    <ContainerLayout
      title="買取表一覧"
      helpArchivesNumber={2202}
      actions={
        <PrimaryButtonWithIcon
          sx={{ width: '220px', ml: 2 }}
          onClick={() => {
            setItemsInfo(undefined); // 新規作成時は既存データをクリア
            setIsCreateModalOpen(true);
          }}
        >
          新規買取表作成
        </PrimaryButtonWithIcon>
      }
    >
      <Stack
        sx={{
          backgroundColor: 'white',
          flex: 1,
          overflow: 'scroll',
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="買取表のタイトルで検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#f5f5f5',
              },
            }}
          />
        </Box>

        {/* 買取表リスト */}
        {results ? (
          <PurchaseTableList
            purchaseTableData={results}
            setItemsInfo={setItemsInfo}
            fetchPurchaseTable={fetchPurchaseTable}
            isCreated={isCreated}
            setIsCreated={setIsCreated}
            isLoading={isLoading}
          />
        ) : null}
      </Stack>

      {/* モーダル */}
      <CreatePurchaseTableModal
        isOpen={isCreateModalOpen}
        setIsModalOpen={setIsCreateModalOpen}
        itemsInfo={itemsInfo}
        fetchPurchaseTable={fetchPurchaseTable}
        setIsCreated={setIsCreated}
      />
    </ContainerLayout>
  );
};
