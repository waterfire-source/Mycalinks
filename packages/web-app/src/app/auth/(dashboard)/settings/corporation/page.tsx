'use client';

import { useState, useEffect } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { InfoRow } from '@/components/fields/InfoRow';
import { StoreList } from '@/components/common/StoreList';
import { StoreManagementModal } from '@/components/modals/settings/corporation/StoreManagementModal';
import { useAccount } from '@/feature/account/hooks/useAccount';
import { useStore } from '@/contexts/StoreContext';
import { useGetOAuthUrl } from '@/feature/square/hooks/useGetOAuthUrl';
import { useUpdateCorporation } from '@/feature/corporation/hooks/useUpdateCorporation';
import { useSession } from 'next-auth/react';
import { CircularProgress } from '@mui/material';
import { useAlert } from '@/contexts/AlertContext';
import { CustomError } from '@/api/implement';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { CorporationEditModal } from '@/components/modals/settings/corporation/CorporationEditModal';
import { PATH } from '@/constants/paths';
import { useRouter } from 'next/navigation';
import { useCorporation } from '@/feature/corporation/hooks/useCorporation';

interface CorporationData {
  id: number;
  companyName: string;
  ceoName: string;
  headOfficeAddress: string;
  phoneNumber: string;
  email: string;
  kobutsushoKoanIinkai: string;
  kobutsushoNumber: string;
  stores: Array<{ id: number; name: string }>;
  invoiceNumber: string;
  zipCode: string;
  squareAvailable: boolean;
}

export default function CorporationAccount() {
  const { account, fetchAccountByID, updateAccount } = useAccount();
  const { updateCorporation } = useUpdateCorporation();
  const { getOAuthUrl } = useGetOAuthUrl();
  const { store } = useStore();
  const { data: session } = useSession();
  const accountID = session?.user.id || '';
  const { setAlertState } = useAlert();
  const router = useRouter();

  // 法人情報
  const { corporation, fetchCorporation } = useCorporation();

  // 画面に表示するデータの管理
  const [selectedStoreID, setSelectedStoreID] = useState<number>(0);
  const [corporationData, setCorporationData] = useState<CorporationData>({
    id: 0,
    companyName: '',
    ceoName: '',
    headOfficeAddress: '',
    phoneNumber: '',
    email: '',
    kobutsushoKoanIinkai: '',
    kobutsushoNumber: '',
    stores: [],
    invoiceNumber: '',
    zipCode: '',
    squareAvailable: false,
  });

  // モーダルの表示状態を管理するstate
  const [isStoreManagementModalOpen, setIsStoreManagementModalOpen] =
    useState<boolean>(false);
  const [isCorporationEditModalOpen, setIsCorporationEditModalOpen] =
    useState<boolean>(false);

  // 法人情報編集モーダルを開く処理
  const handleCorporationEditModalOpen = () => {
    setIsCorporationEditModalOpen(true);
  };

  // 店舗追加ボタン押下時の処理
  const handleAddStore = () => {
    router.push(PATH.SETUP.store.root);
  };

  // Squareアカウントと連携する(OAuth同意画面に遷移)
  const handleClickSquareAccount = async () => {
    try {
      // Squareアカウントと連携する(OAuth同意画面に遷移)
      await getOAuthUrl({
        succeedCallbackUrl: PATH.SETTINGS.corporation,
        failedCallbackUrl: PATH.SETTINGS.corporation,
      });
    } catch (error) {
      console.error('Squareアカウントと連携に失敗しました:', error);
    }
  };

  // 法人情報編集モーダーの確認ボタン押下時の処理
  const handleCorporationEditModalConfirm = async (
    data: {
      companyName: string;
      ceoName: string;
      zipCode: string;
      headOfficeAddress: string;
      phoneNumber: string;
      email: string;
      kobutsushoKoanIinkai: string;
      kobutsushoNumber: string;
      invoiceNumber: string;
    },
    password: string,
  ): Promise<boolean> => {
    if (!corporation?.id) {
      setAlertState({ message: '法人IDが取得できません。', severity: 'error' });
      return false;
    }

    // メールアドレスの更新
    const isAccountSuccess = await updateAccount(accountID, password, {
      email: data.email,
    });
    if (!isAccountSuccess) return false;

    // 法人情報の更新
    const corporationRes = await updateCorporation({
      corporationId: corporation.id,
      name: data.companyName,
      ceoName: data.ceoName,
      zipCode: data.zipCode,
      headOfficeAddress: data.headOfficeAddress,
      phoneNumber: data.phoneNumber,
      kobutsushoKoanIinkai: data.kobutsushoKoanIinkai,
      kobutsushoNumber: data.kobutsushoNumber,
      invoiceNumber: data.invoiceNumber,
    });
    if (corporationRes instanceof CustomError) return false;
    // 更新成功時の処理
    setCorporationData({
      ...corporationData,
      companyName: data.companyName,
      ceoName: data.ceoName,
      zipCode: data.zipCode,
      headOfficeAddress: data.headOfficeAddress,
      phoneNumber: data.phoneNumber,
      email: data.email,
      kobutsushoKoanIinkai: data.kobutsushoKoanIinkai,
      kobutsushoNumber: data.kobutsushoNumber,
      invoiceNumber: data.invoiceNumber,
    });
    setAlertState({
      message: '法人情報情報の更新に成功しました',
      severity: 'success',
    });
    setIsCorporationEditModalOpen(false);
    return true;
  };

  // 法人情報情報を取得
  useEffect(() => {
    if (store.id && accountID) {
      fetchAccountByID(accountID, false);
    }
  }, [store.id, accountID, fetchAccountByID]);

  // 法人情報を取得
  useEffect(() => {
    fetchCorporation();
  }, [fetchCorporation]);

  // 法人情報を画面に表示するデータに変換
  useEffect(() => {
    if (account && corporation) {
      setCorporationData({
        id: corporation.id,
        companyName: corporation.name,
        ceoName: corporation.ceo_name || '',
        headOfficeAddress: corporation.head_office_address || '',
        phoneNumber: corporation.phone_number || '',
        email: account.email,
        kobutsushoKoanIinkai: corporation.kobutsusho_koan_iinkai || '',
        kobutsushoNumber: corporation.kobutsusho_number || '',
        stores: account.stores.map((s) => ({
          id: s.store_id,
          name: s.store.display_name || '',
        })),
        invoiceNumber: corporation.invoice_number || '',
        zipCode: corporation.zip_code || '',
        squareAvailable: corporation.square_available || false,
      });
    }
  }, [account, corporation]);

  return (
    <ContainerLayout
      title="法人情報設定"
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
            onClick={handleCorporationEditModalOpen}
          >
            法人情報編集
          </SecondaryButton>
        </Box>
      }
    >
      <Box sx={{ width: '100%', p: 3 }}>
        {account ? (
          <Paper elevation={0} sx={{ borderRadius: 1, overflow: 'hidden' }}>
            <InfoRow label="法人名" value={corporationData.companyName} />
            <InfoRow label="代表者名" value={corporationData.ceoName} />
            <InfoRow label="本社郵便番号" value={corporationData.zipCode} />
            <InfoRow
              label="本社所在地"
              value={corporationData.headOfficeAddress}
            />
            <InfoRow label="電話番号" value={corporationData.phoneNumber} />
            <InfoRow label="メールアドレス" value={corporationData.email} />
            <InfoRow
              label="古物商公安委員会"
              value={corporationData.kobutsushoKoanIinkai}
            />
            <InfoRow
              label="古物商番号"
              value={corporationData.kobutsushoNumber}
            />
            <InfoRow
              label="インボイス登録番号"
              value={corporationData.invoiceNumber}
            />
            {/* 傘下店舗 */}
            <InfoRow
              label="店舗"
              buttonLabel="店舗追加"
              onEdit={handleAddStore}
              value={
                <StoreList
                  stores={corporationData.stores}
                  setSelectedStoreID={setSelectedStoreID}
                  setIsOpenModal={setIsStoreManagementModalOpen}
                />
              }
            />
            <InfoRow
              label="Squareアカウント"
              value={
                corporationData.squareAvailable ? (
                  <Typography variant="body1">連携済み</Typography>
                ) : (
                  <SecondaryButton onClick={handleClickSquareAccount}>
                    <Typography variant="body1">
                      すでに所持しているSquareアカウントと連携する
                    </Typography>
                  </SecondaryButton>
                )
              }
            />
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        )}
      </Box>
      <CorporationEditModal
        accountID={accountID.toString()}
        isOpen={isCorporationEditModalOpen}
        onClose={() => setIsCorporationEditModalOpen(false)}
        initialData={corporationData}
        onConfirm={handleCorporationEditModalConfirm}
      />
      <StoreManagementModal
        isOpen={isStoreManagementModalOpen}
        onClose={() => setIsStoreManagementModalOpen(false)}
        accountID={accountID.toString()}
        storeID={selectedStoreID}
      />
    </ContainerLayout>
  );
}
