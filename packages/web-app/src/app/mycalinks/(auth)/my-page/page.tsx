'use client';

import { useEffect, useState } from 'react';
import { Box, Container } from '@mui/material';
import { StoreSelection } from '@/app/mycalinks/(core)/components/StoreSelection';
import { SettingsContent } from '@/app/mycalinks/(core)/components/SettingsContent';
import { HistoryContent } from '@/app/mycalinks/(core)/components/HistoryContent';
import { MembershipCardContent } from '@/app/mycalinks/(core)/components/MembershipCardContent';
import { CustomError } from '@/api/implement';
import { ChangeStoreModal } from '@/app/mycalinks/(core)/components/modals/ChangeStoreModal';
import Loader from '@/components/common/Loader';
import { FixedMyPageButton } from '@/app/mycalinks/(core)/components/buttons/FixedMyPageButton';
import { PosCustomerInfo } from '@/app/mycalinks/(core)/types/customer';
import { MyPageTabs } from '@/app/mycalinks/(core)/components/tabs/MyPageTabs';
import { myPageCustomerImplement } from '@/api/frontend/mycalinks/myPage/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useAppAuth } from '@/providers/useAppAuth';
import { useMycaUserBarcode } from '@/feature/mycalinks/hooks/useMycaUserBarcode';

export default function MyPage() {
  const { setAlertState } = useAlert();
  const { getUserId } = useAppAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [openChangeStoreModal, setOpenChangeStoreModal] =
    useState<boolean>(false);
  const [selectedStore, setSelectedStore] = useState<PosCustomerInfo | null>(
    null,
  );
  // 顧客情報
  const [posCustomerInfo, setPosCustomerInfo] = useState<PosCustomerInfo[]>([]);

  // バーコード情報
  const { isLoading, barcodeInfo, getBarcodeToken } = useMycaUserBarcode();

  const handleTabChange = (newValue: number) => {
    setActiveTab(newValue);
  };

  //  ストア変更
  const handleStoreChangeClick = () => {
    setOpenChangeStoreModal(true);
  };

  //顧客情報を取得
  const fetchPosCustomer = async () => {
    const res = await myPageCustomerImplement().getAllCustomer();
    if (!res?.length) return false;
    if (res instanceof CustomError) {
      setAlertState({
        message: `${res.status}:${res.message}`,
        severity: 'error',
      });
      return;
    }

    const converted: PosCustomerInfo[] = res.map((info) => ({
      id: info.id,
      store_id: info.store_id,
      myca_user_id: info.myca_user_id,
      birthday: info.birthday || undefined,
      address: info.address || undefined,
      zip_code: info.zip_code || undefined,
      full_name: info.full_name || undefined,
      full_name_ruby: info.full_name_ruby || undefined,
      email: info.email || undefined,
      phone_number: info.phone_number || undefined,
      gender: info.gender || undefined,
      career: info.career || undefined,
      owned_point: info.owned_point ?? undefined,
      created_at: info.created_at, // ISO文字列でOK
      updated_at: info.updated_at, // 同上
      store: info.store
        ? {
            id: info.store.id,
            display_name: info.store.display_name || undefined,
            receipt_logo_url: info.store.receipt_logo_url ?? null,
          }
        : undefined,
    }));

    // 1店舗のみの場合は、選択店舗を自動で設定する
    if (converted.length == 1) {
      setSelectedStore(converted[0]);
    }
    setPosCustomerInfo(converted);
  };

  // 初回実行
  useEffect(() => {
    fetchPosCustomer();
  }, []);

  // 顧客情報が入ってきたら発火
  useEffect(() => {
    getBarcodeToken();
  }, [posCustomerInfo]);

  if (!barcodeInfo.value) return <Loader />;

  const renderContent = (): React.ReactNode => {
    switch (activeTab) {
      case 0: // メニュー
        return (
          <MembershipCardContent
            barcodeValue={barcodeInfo.value ?? ''}
            posCustomerInfo={posCustomerInfo}
            selectedStore={selectedStore}
            getBarcodeToken={getBarcodeToken}
          />
        );
      case 1: // 購・買履歴
        return (
          <>
            <HistoryContent
              selectedStore={selectedStore}
              posCustomerInfo={posCustomerInfo}
            />
            <FixedMyPageButton
              barcodeValue={barcodeInfo.value}
              getBarcodeToken={getBarcodeToken}
              isLoading={isLoading}
            />
          </>
        );
      case 2: // 設定
        return <SettingsContent />;
      default:
        return null;
    }
  };

  return (
    <>
      <Container maxWidth="md" disableGutters sx={{ pt: 2 }}>
        <Box>
          <MyPageTabs onTabChange={handleTabChange} />

          <StoreSelection
            selectedStore={selectedStore}
            onStoreChangeClick={handleStoreChangeClick}
          />

          {renderContent()}
        </Box>
      </Container>

      {/* 店舗変更モーダル */}
      <ChangeStoreModal
        open={openChangeStoreModal}
        onClose={() => setOpenChangeStoreModal(false)}
        posCustomerInfo={posCustomerInfo}
        selectedStore={selectedStore}
        setSelectedStore={setSelectedStore}
      />
    </>
  );
}
