'use client';

import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { useAlert } from '@/contexts/AlertContext';
import { useSession } from 'next-auth/react';
import { useStore } from '@/contexts/StoreContext';
import { useStores } from '@/app/hooks/useStores';
import { useParams } from 'next/navigation';
import { PATH } from '@/constants/paths';
import { useRouter } from 'next/navigation';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { StoreInfoDisplay } from '@/components/common/StoreInfoDisplay';

export interface StoreData {
  storeId: string;
  storeName: string;
  logoData: string;
  leaderName: string;
  zipCode: string;
  address: string;
  phoneNumber: string;
  email: string;
  kobutsushoKoanIinkai: string;
  kobutsushoNumber: string;
  corporation: string;
  squareLocation: string;
}

export default function StoreAccount() {
  const { store, setStore } = useStore();
  const { stores, fetchStores } = useStores();
  const { data: session } = useSession();
  const accountID = String(session?.user.id) || '';
  const { setAlertState } = useAlert();
  const params = useParams();
  const router = useRouter();

  // 編集可能な店舗が設定されたかどうかを管理するstate
  const [isStoreSettingComplete, setIsStoreSettingComplete] =
    useState<boolean>(false);

  // モーダルの表示状態を管理するstate
  const [isStoreEditModalOpen, setIsStoreEditModalOpen] =
    useState<boolean>(false);

  // 店舗編集モーダルを開く
  const handleStoreEditModalOpen = () => {
    setIsStoreEditModalOpen(true);
  };

  // ストアの取得
  useEffect(() => {
    fetchStores();
    // 画面遷移時のみ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 店舗の設定
  useEffect(() => {
    if (stores.length > 0) {
      // 店舗の指定があれば切り替える
      if (params.store_id) {
        const foundStore = stores.find((s) => s.id === Number(params.store_id));
        if (!foundStore) {
          setAlertState({
            message: '店舗を取得できませんでした。',
            severity: 'error',
          });
          return;
        }
        setStore(foundStore);
      }
      // 店舗の切り替えが完了したらフラグをtrueにする
      setIsStoreSettingComplete(true);
    }
    // 店舗の設定が完了したらURLを更新
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stores]);

  // 店舗切り替えを監視
  useEffect(() => {
    if (isStoreSettingComplete) {
      router.push(
        PATH.SETTINGS.store.replace('[store_id]', store.id.toString()),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.id]);

  return (
    <ContainerLayout
      title="店舗アカウント設定"
      actions={
        <Box
          sx={{
            display: 'flex',
            gap: '20px',
            pl: 5,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <SecondaryButton
            variant="contained"
            onClick={handleStoreEditModalOpen}
          >
            店舗アカウント編集
          </SecondaryButton>
        </Box>
      }
    >
      <StoreInfoDisplay
        storeId={store.id}
        accountID={accountID}
        isStoreEditModalOpen={isStoreEditModalOpen}
        setIsStoreEditModalOpen={setIsStoreEditModalOpen}
      />
    </ContainerLayout>
  );
}
