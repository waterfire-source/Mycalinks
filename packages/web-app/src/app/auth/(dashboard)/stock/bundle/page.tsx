'use client';

import { useState } from 'react';
import { useStore } from '@/contexts/StoreContext';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { Box } from '@mui/material';

import { EditBundleModal } from '@/app/auth/(dashboard)/stock/bundle/components/EditBundleModal';
import DismantleBundleModal from '@/feature/stock/bundle/components/DismantleBundleModal';
import {
  useSetDeals,
  UseSetDealParams,
} from '@/feature/stock/set/hooks/useSetDeals';
import { TableContainer } from '@/feature/stock/bundle/components/TableContainer';
import { BundleSetButton } from '@/feature/stock/bundle/components/BundleSetButton';
import { BundleSetProductType } from '@/feature/stock/bundle/components/TabTable';

export default function BundlePage() {
  const { store } = useStore();
  const [selectedBundle, setSelectedBundle] = useState<BundleSetProductType>();
  const [fetchTableDataTrigger, setFetchTableDataTrigger] = useState<number>(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDismantleModalOpen, setIsDismantleModalOpen] =
    useState<boolean>(false);
  const [isDismantleLoading, setIsDismantleLoading] = useState<boolean>(false);
  const { deleteSetDeal } = useSetDeals();

  const handleCloseEditModal = () => {
    // 選択中のバンドルをクリア
    setSelectedBundle(undefined);
    setIsEditModalOpen(false);
  };

  const handleCloseDismantleModal = (isDismantleSuccess: boolean) => {
    setIsDismantleModalOpen(false);
    // 解体成功時は選択中のバンドルをクリアして一覧を再取得
    if (isDismantleSuccess) {
      setSelectedBundle(undefined);
      //一覧を再取得
      setFetchTableDataTrigger((prev) => prev + 1);
    }
  };

  const handleDismantle = async () => {
    if (selectedBundle?.productType === 'bundle') {
      // バンドルの場合は解体モーダルを表示
      setIsDismantleModalOpen(true);
    } else if (selectedBundle?.productType === 'set') {
      // セットの場合はセットを解体
      setIsDismantleLoading(true);
      const deleteSetParams: UseSetDealParams['deleteSetDeal'] = {
        storeID: store.id,
        setDealID: selectedBundle.id,
      };
      const res = await deleteSetDeal(deleteSetParams);
      if (res) {
        // 解体成功時のみモーダルを閉じて選択中のバンドルをクリア
        handleCloseEditModal();
        setSelectedBundle(undefined);

        //一覧を再取得
        setFetchTableDataTrigger((prev) => prev + 1);
      }
      setIsDismantleLoading(false);
    }
  };

  const handleEditBundleProducts = (product: BundleSetProductType) => {
    setSelectedBundle(product);
    setIsEditModalOpen(true);
  };

  return (
    <ContainerLayout
      title="バンドル・セット一覧"
      helpArchivesNumber={4185}
      actions={<BundleSetButton />}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            overflow: 'auto',
          }}
        >
          {/* バンドル・セット一覧テーブル */}
          <TableContainer
            storeID={store.id}
            fetchTrigger={fetchTableDataTrigger}
            handleEditBundleProducts={handleEditBundleProducts}
          />
        </Box>

        {selectedBundle && (
          <EditBundleModal
            open={isEditModalOpen}
            storeID={store.id}
            bundle={selectedBundle}
            onClose={handleCloseEditModal}
            onDismantle={handleDismantle}
            isDismantleLoading={isDismantleLoading}
            setFetchTableDataTrigger={setFetchTableDataTrigger}
          />
        )}
        {selectedBundle && (
          <DismantleBundleModal
            open={isDismantleModalOpen}
            bundle={selectedBundle}
            onClose={handleCloseDismantleModal}
            storeID={store.id}
            setFetchTableDataTrigger={setFetchTableDataTrigger}
          />
        )}
      </Box>
    </ContainerLayout>
  );
}
