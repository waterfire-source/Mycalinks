'use client';

import PrimaryButton from '@/components/buttons/PrimaryButton';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { useStore } from '@/contexts/StoreContext';
import { useRegister } from '@/contexts/RegisterContext';
import { CashContainer } from '@/feature/cash/components/CashContainer';
import { RegistrationModal } from '@/feature/cash/components/RegistrationModal';
import { useCashHistorySearch } from '@/feature/cash/hooks/useCashHistorySearch';
import { useEffect, useState } from 'react';
import { Stack } from '@mui/material';

//レジ関係の設定ページ
export default function Register() {
  const { register } = useRegister();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { store } = useStore();

  // モーダルハンドラー
  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    performSearch();
  };
  const [selectedCashRegisterId, setSelectedCashRegisterId] = useState<
    number | null
  >(null);

  // レジ履歴の絞り込みと取得を行うカスタムフック
  const { searchState, setSearchState, performSearch } = useCashHistorySearch(
    store.id,
  );

  // ログインアカウントに紐づくレジのIDをセット
  useEffect(() => {
    if (register) {
      setSelectedCashRegisterId(register?.id || null);
    }
  }, [register]);

  return (
    <ContainerLayout
      title="入出金"
      helpArchivesNumber={270}
      actions={
        <Stack direction="row" gap={2}>
          <PrimaryButton sx={{ width: '200px' }} onClick={handleModalOpen}>
            入出金登録
          </PrimaryButton>
        </Stack>
      }
    >
      <Stack sx={{ height: '100%', overflow: 'hidden' }}>
        {/* ページ内容 */}
        <CashContainer
          store={store}
          searchState={searchState}
          setSearchState={setSearchState}
          performSearch={performSearch}
        />
        {/* モーダル部分 */}
        {register && (
          <RegistrationModal
            open={isModalOpen}
            onClose={handleModalClose}
            selectedCashRegisterId={selectedCashRegisterId}
          />
        )}
      </Stack>
    </ContainerLayout>
  );
}
