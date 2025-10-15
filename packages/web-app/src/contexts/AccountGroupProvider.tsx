import { AccountApiRes } from '@/api/frontend/account/api';
import { AccountGroupApiRes } from '@/api/frontend/accountGroup/api';
import { createClientAPI, CustomError } from '@/api/implement';
import { StaffAccountChangeModal } from '@/components/layouts/header/components/StaffAccountChangeModal';
import { PATH } from '@/constants/paths';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { PosRunMode } from '@/types/next-auth';
import { StaffCode } from '@/utils/staffCode';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type AccountGroup = AccountGroupApiRes['getAccountGroupById'][0];
type Account = AccountApiRes['getAccountById'];

const AccountGroupContext = createContext<{
  account: Account | null;
  accountGroup: AccountGroup | null;
  resetAccountGroupContext: () => void;
  isOpenStaffAccountChangeModal: boolean;
  setIsOpenStaffAccountChangeModal: (isOpen: boolean) => void;
}>({
  account: null,
  accountGroup: null,
  resetAccountGroupContext: () => {},
  isOpenStaffAccountChangeModal: false,
  setIsOpenStaffAccountChangeModal: () => {},
});

interface AccountProviderProps {
  children: React.ReactNode;
}

// ポリシーの管理をするコンテキスト
export const AccountGroupProvider = ({ children }: AccountProviderProps) => {
  // 管理モードの時は従業員の設定はしなくてOK、店舗モードの時は従業員の設定を行い、操作されていない状態が10分続いたら従業員をnullにする
  const { data: session } = useSession();
  const clientAPI = useMemo(() => createClientAPI(), []);
  const staffCode = StaffCode.getStaffCode();

  const [isOpenStaffAccountChangeModal, setIsOpenStaffAccountChangeModal] =
    useState(false);
  const [account, setAccount] = useState<Account | null>(null);
  const [accountGroup, setAccountGroup] = useState<AccountGroup | null>(null);
  const { setAlertState } = useAlert();
  const { store } = useStore();
  const pathname = usePathname();
  // コンテキスト情報をリセットして従業員バーコードを読み取り直す
  const resetAccountGroupContext = useCallback(() => {
    // Cookieから従業員コードを削除
    StaffCode.deleteStaffCode();
    // stateから従業員情報を削除
    setAccount(null);
    setAccountGroup(null);
    // setIsOpenStaffAccountChangeModal(true);
  }, []);
  // 管理モードの時はセッションからアカウントのIDを取得し、そのアカウントのアカウントグループを取得する
  const fetchAdminAccountGroup = useCallback(async () => {
    if (session?.user.id === undefined || session?.user.id === null) {
      return;
    }
    const accountRes = await clientAPI.account.getAccountById({
      id: session?.user.id.toString(),
    });
    if (accountRes instanceof CustomError) return;
    const accountGroupRes = await clientAPI.accountGroup.getAccountGroupById({
      id: accountRes.group_id,
    });
    setAccount(accountRes);
    if (
      accountGroupRes instanceof CustomError ||
      accountGroupRes.length === 0
    ) {
      setAlertState({
        message: 'アカウントグループが見つかりません。',
        severity: 'error',
      });
      return;
    }
    setAccountGroup(accountGroupRes[0]);
  }, [
    clientAPI.account,
    clientAPI.accountGroup,
    session?.user.id,
    setAlertState,
  ]);

  // どこかしらのクリックを検知したら従業員バーコードの読み取り期限を延長する
  useEffect(() => {
    // セッションがロードされていない場合は何もしない
    if (!session?.user?.mode) return;

    const handleClick = () => {
      // 管理モードの場合は何もしない
      if (session.user.mode === PosRunMode.admin) return;

      if (StaffCode.getStaffCode() === null) {
        // すでにクッキーの有効期限が切れていたらモーダルを開く
        setIsOpenStaffAccountChangeModal(true);
        return;
      }
      StaffCode.resetCookieExpirationTime(store.staff_barcode_timeout_minutes);
    };

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [session, store.staff_barcode_timeout_minutes]);

  // 店舗モードの時は従業員バーコードを取得し、その従業員のアカウントグループを取得する
  const fetchSalesAccountGroup = useCallback(async () => {
    // Cookieに従業員コードがない時はモーダルを開く
    if (staffCode === null) {
      setIsOpenStaffAccountChangeModal(true);
      return;
    }
    const accountRes = await clientAPI.account.getAccountByStaffCode({
      staffCode: Number(staffCode),
    });
    // アカウントが見つからない場合はエラーを出して再度バーコード読み取りをさせる
    if (accountRes instanceof CustomError || accountRes.accounts.length === 0) {
      setAlertState({
        message: '従業員バーコードが存在しません。',
        severity: 'error',
      });
      setIsOpenStaffAccountChangeModal(true);
      return;
    }
    setAccount(accountRes.accounts[0]);
    const accountGroupRes = await clientAPI.accountGroup.getAccountGroupById({
      id: accountRes.accounts[0].group_id,
    });
    // アカウントグループが見つからない場合はエラーを出して再度バーコード読み取りをさせる
    if (
      accountGroupRes instanceof CustomError ||
      accountGroupRes.length === 0
    ) {
      setAlertState({
        message: 'アカウントグループが見つかりません。',
        severity: 'error',
      });
      StaffCode.deleteStaffCode();
      setIsOpenStaffAccountChangeModal(true);
      return;
    }
    setAccountGroup(accountGroupRes[0]);
  }, [clientAPI.account, clientAPI.accountGroup, setAlertState, staffCode]);

  // pathが買取査定だった場合従業員バーコードの読み取り期限を延長する
  useEffect(() => {
    if (pathname.includes(PATH.PURCHASE_RECEPTION.root)) {
      // 買取査定ページの場合は従業員バーコードの読み取り期限を無限にする
      StaffCode.setStaffCodeInfiniteExpirationTime();
    }
    // 該当のpathでないときは延長時間を店舗で設定した時間にする
    StaffCode.resetCookieExpirationTime(store.staff_barcode_timeout_minutes);
  }, [pathname, store.staff_barcode_timeout_minutes]);

  useEffect(() => {
    // セッションの中身がない場合はエラーを出す
    if (session?.user.id === undefined || session?.user.id === null) {
      return;
    }
    // 管理モードの時はアカウントグループを取得する
    if (session?.user.mode === PosRunMode.admin) {
      fetchAdminAccountGroup();
    }
    // 販売モードの時は従業員バーコードを取得し、その従業員のアカウントグループを取得する
    if (session.user.mode === PosRunMode.sales) {
      fetchSalesAccountGroup();
    }
  }, [
    fetchAdminAccountGroup,
    fetchSalesAccountGroup,
    session?.user.id,
    session?.user.mode,
    setAlertState,
  ]);
  const onClose = () => {
    // クッキーにstaffCodeがないときは閉じることができない(必ず従業員バーコードをスキャンさせる)
    if (StaffCode.getStaffCode() === null) {
      return;
    }
    setIsOpenStaffAccountChangeModal(false);
  };
  return (
    <AccountGroupContext.Provider
      value={{
        account,
        accountGroup,
        resetAccountGroupContext,
        isOpenStaffAccountChangeModal,
        setIsOpenStaffAccountChangeModal,
      }}
    >
      {children}
      <StaffAccountChangeModal
        isOpen={isOpenStaffAccountChangeModal}
        onClose={onClose}
      />
    </AccountGroupContext.Provider>
  );
};

export const useAccountGroupContext = () => {
  return useContext(AccountGroupContext);
};
