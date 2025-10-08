import React, { useEffect, useState } from 'react';
import { Box, Paper, CircularProgress } from '@mui/material';
import Image from 'next/image';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { InfoRow } from '@/components/fields/InfoRow';
import { useAccount } from '@/feature/account/hooks/useAccount';
import { useAllStoreInfo } from '@/feature/store/hooks/useAllStoreInfo';
import { StoreEditModal } from '@/components/modals/settings/store/StoreEditModal';
import { SquareLocationSelectModal } from '@/components/modals/common/SquareLocationSelectModal';
import { useCorporation } from '@/feature/corporation/hooks/useCorporation';
import { StoreData } from '@/app/auth/(dashboard)/settings/store/[store_id]/page';

interface Props {
  storeId: number;
  accountID: string;
  setStoreData?: (data: StoreData) => void;
  isStoreEditModalOpen?: boolean;
  setIsStoreEditModalOpen?: (open: boolean) => void;
}

export const StoreInfoDisplay: React.FC<Props> = ({
  storeId,
  accountID,
  setStoreData = () => {},
  isStoreEditModalOpen = false,
  setIsStoreEditModalOpen = () => {},
}) => {
  const { fetchAccountByID } = useAccount();
  const { fetchAllStoreInfo } = useAllStoreInfo();
  const [isLoading, setIsLoading] = useState(true);
  const [isSquareAvailable, setIsSquareAvailable] = useState(false);
  const { corporation, fetchCorporation } = useCorporation();
  const [isSquareLocationModalOpen, setIsSquareLocationModalOpen] =
    useState(false);
  const [displayStoreData, setDisplayStoreData] = useState<StoreData>({
    storeId: '',
    storeName: '',
    logoData: '',
    leaderName: '',
    zipCode: '',
    address: '',
    phoneNumber: '',
    email: '',
    kobutsushoKoanIinkai: '',
    kobutsushoNumber: '',
    corporation: '',
    squareLocation: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (storeId && accountID) {
        // アカウント情報を取得
        const account = await fetchAccountByID(parseInt(accountID), true);
        if (!account) return;

        // 法人情報を取得
        const corporation = await fetchCorporation(true);
        if (!corporation) return;

        // 店舗情報を取得
        const targetStore = await fetchAllStoreInfo(storeId);
        if (!targetStore) return;
        setDisplayStoreData({
          storeId: targetStore.id.toString(),
          storeName: targetStore.display_name || '',
          logoData: targetStore.receipt_logo_url || '',
          leaderName: targetStore.leader_name || '',
          zipCode: targetStore.zip_code || '',
          address: targetStore.full_address || '',
          phoneNumber: targetStore.phone_number || '',
          email: account.email || '',
          kobutsushoKoanIinkai: corporation?.kobutsusho_koan_iinkai || '',
          kobutsushoNumber: corporation?.kobutsusho_number || '',
          corporation: corporation?.name || '',
          squareLocation: targetStore.square_location_id || '',
        });
        setIsLoading(false);
        setIsSquareAvailable(corporation?.square_available || false);
      }
    };
    // 選択中の店舗IDに合わせてURLを更新
    fetchData();
    // アカウント・店舗情報が切り替わったら再取得
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, accountID]);

  useEffect(() => {
    if (setStoreData) {
      setStoreData(displayStoreData);
    }
  }, [displayStoreData]);

  const onSquareLocationClick = () => {
    setIsSquareLocationModalOpen(true);
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 1, overflow: 'hidden' }}>
          <InfoRow label="店舗ID" value={displayStoreData.storeId} />
          <InfoRow label="店舗名" value={displayStoreData.storeName} />
          <InfoRow
            label="ロゴデータ"
            value={
              <Box sx={{ width: 200, height: 40 }}>
                {displayStoreData.logoData && (
                  <Image
                    src={displayStoreData.logoData}
                    alt="logo"
                    width={200}
                    height={40}
                    style={{
                      width: '200px',
                      height: '40px',
                      objectFit: 'contain',
                    }}
                  />
                )}
              </Box>
            }
          />
          <InfoRow label="代表者名" value={displayStoreData.leaderName} />
          <InfoRow label="郵便番号" value={displayStoreData.zipCode} />
          <InfoRow label="所在地" value={displayStoreData.address} />
          <InfoRow label="電話番号" value={displayStoreData.phoneNumber} />
          {/* <InfoRow label="メールアドレス" value={displayStoreData.email} /> */}
          <InfoRow
            label="古物商公安委員会"
            value={displayStoreData.kobutsushoKoanIinkai}
          />
          <InfoRow
            label="古物商番号"
            value={displayStoreData.kobutsushoNumber}
          />
          <InfoRow label="本部" value={displayStoreData.corporation} />
          {isSquareAvailable && (
            <InfoRow
              label="Squareロケーション"
              value={
                <SecondaryButton
                  sx={{
                    backgroundColor: displayStoreData.squareLocation
                      ? 'grey.700'
                      : 'grey.300',
                    color: displayStoreData.squareLocation
                      ? 'white'
                      : 'grey.700',
                  }}
                  onClick={onSquareLocationClick}
                >
                  {displayStoreData.squareLocation ? '設定済み' : '設定'}
                </SecondaryButton>
              }
            />
          )}
        </Paper>
      )}
      <StoreEditModal
        isOpen={isStoreEditModalOpen}
        accountID={accountID}
        storeData={displayStoreData}
        setStoreData={setDisplayStoreData}
        onClose={() => setIsStoreEditModalOpen(false)}
      />
      <SquareLocationSelectModal
        isOpen={isSquareLocationModalOpen}
        onClose={() => setIsSquareLocationModalOpen(false)}
        storeId={storeId}
        currentLocationId={displayStoreData.squareLocation}
      />
    </Box>
  );
};
