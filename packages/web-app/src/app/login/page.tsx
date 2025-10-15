'use client';
import { useState, useEffect } from 'react';
import { Stack, Typography, useMediaQuery, useTheme } from '@mui/material';

import { createClientAPI, CustomError } from '@/api/implement';
import { AuthApiRes } from '@/api/frontend/auth/api';
import { ModeSelectModal } from '@/app/login/components/ModeSelectModal';
import { PosRunMode } from '@/types/next-auth';
import { LoginRegisterSelect } from '@/app/login/components/LoginRegisterSelect';
import { LoginForm } from '@/app/login/components/LoginForm';
import { LoginStoreSelect } from '@/app/login/components/LoginStoreSelect';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { useAlert } from '@/contexts/AlertContext';
import { signIn } from 'next-auth/react';
import { StaffCode } from '@/utils/staffCode';
import { LocalStorageManager } from '@/utils/localStorage';

export interface LoginInfo {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [loginInfo, setLoginInfo] = useState<LoginInfo>({
    email: '',
    password: '',
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const clientAPI = createClientAPI();

  const [launchRes, setLaunchRes] = useState<AuthApiRes['launch'] | null>(null);
  const [modeSelectModalOpen, setModeSelectModalOpen] = useState(false);
  const [posRunMode, setPosRunMode] = useState<PosRunMode | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [selectedRegisterId, setSelectedRegisterId] = useState<number | null>(
    null,
  );
  useEffect(() => {
    // ログインページ初回レンダリング時は従業員バーコードをクッキーから削除
    StaffCode.deleteStaffCode();
    // ログインページ初回レンダリング時は店舗関連のデータを削除
    const storeLocalStorageManager = new LocalStorageManager('store');
    storeLocalStorageManager.removeItem();
  }, []);
  // 選択した店舗
  const selectedStore = launchRes?.account.stores.find(
    (store) => store.store.id === selectedStoreId,
  )?.store;
  const { setAlertState } = useAlert();
  // アカウント情報の取得
  const launch = async (): Promise<void> => {
    try {
      const res = await clientAPI.auth.launch(loginInfo);
      if (res instanceof CustomError) {
        setAlertState({
          message: res.message,
          severity: 'error',
        });
        throw res;
      }
      // availableModesが空の場合は、ログインが許可されていない
      if (res.availableModes.length === 0) {
        setAlertState({
          message: 'このアカウントではログインが許可されていません',
          severity: 'error',
        });
        return;
      }
      setLaunchRes(res);
      // アカウント権限が一つのみならモード選択を開かない
      if (res.availableModes.length === 1) {
        setPosRunMode(res.availableModes[0]);
        return;
      }
      setModeSelectModalOpen(true);
    } catch (error) {
      console.error(error);
    }
  };
  const login = async (): Promise<void> => {
    try {
      // cookieにcodeを追加する
      if (launchRes?.account.code) {
        // ログイン時はデフォルト設定を利用することとする
        StaffCode.setStaffCode(launchRes?.account.code, null);
      }
      await signIn('credentials', {
        email: loginInfo.email,
        password: loginInfo.password,
        mode: posRunMode, // adminモードの時はこれが叩かれないのでsalesモードのみ
        store_id: selectedStoreId,
        register_id: selectedRegisterId,
      });
    } catch (error) {
      console.error(error);
      setAlertState({
        message:
          error instanceof Error ? error.message : 'ログインに失敗しました',
        severity: 'error',
      });
    }
  };
  return (
    <Stack
      height="100lvh"
      justifyContent="center"
      alignItems="center"
      gap={isMobile ? '16px' : '32px'}
      padding={isMobile ? '16px' : '0'}
    >
      {/* TODO ロゴを追加 */}
      {/* <Image src="/logo.png" alt="logo" width={100} height={100} /> */}
      <Typography id="login_heading" variant="h1" fontSize="1.5rem">
        ログイン
      </Typography>
      <Stack
        width={isMobile ? '100%' : 560}
        gap={isMobile ? '16px' : '24px'}
        aria-labelledby="login_heading"
      >
        {posRunMode && launchRes?.account.stores[0].store.id ? (
          <Stack gap={1}>
            <LoginStoreSelect
              stores={launchRes?.account.stores}
              storeId={selectedStoreId}
              setStoreId={setSelectedStoreId}
            />
            {/* 店舗を設定してからレジを選択 */}
            <LoginRegisterSelect
              registers={selectedStore?.registers ?? []}
              registerId={selectedRegisterId}
              setRegisterId={setSelectedRegisterId}
              disabled={!selectedStoreId}
            />
            {/* 店舗、レジを選択してから起動 */}
            <PrimaryButton
              disabled={!selectedStoreId || !selectedRegisterId}
              onClick={() => login()}
            >
              MycalinksPOSを起動
            </PrimaryButton>
          </Stack>
        ) : (
          <LoginForm
            loginInfo={loginInfo}
            setLoginInfo={setLoginInfo}
            launch={launch}
          />
        )}
        <ModeSelectModal
          open={modeSelectModalOpen}
          onClose={() => setModeSelectModalOpen(false)}
          posRunMode={posRunMode}
          setPosRunMode={setPosRunMode}
          adminLogin={() =>
            // 管理者モードのログイン(管理者モードでは店舗の選択、レジの選択が不要なのでこの時点でログイン処理を走らせる)
            signIn('credentials', {
              email: loginInfo.email,
              password: loginInfo.password,
              mode: PosRunMode.admin,
            })
          }
        />
      </Stack>
    </Stack>
  );
}
