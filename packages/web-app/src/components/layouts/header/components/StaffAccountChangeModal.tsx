import React, { useEffect, useRef } from 'react';
import { Stack } from '@mui/material';
import { FaIdCard } from 'react-icons/fa';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { useScanner } from '@/hooks/useScanner';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { useAlert } from '@/contexts/AlertContext';
import CustomDialog from '@/components/dialogs/CustomDialog';
import { StaffCode } from '@/utils/staffCode';
import { useStore } from '@/contexts/StoreContext';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { signOut } from 'next-auth/react';
interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const StaffAccountChangeModal: React.FC<Props> = ({
  isOpen,
  onClose,
}) => {
  const { setAlertState } = useAlert();
  const { store } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const { isScanning, setIsScanning } = useScanner(async (code) => {
    if (!code) return;
    // スキャンされた従業員バーコード(id)をCookieに追加
    if (!StaffCode.isStaffCode(parseInt(code))) {
      setAlertState({
        message: '従業員バーコードに不正な値が入力されました。',
        severity: 'error',
      });
      return;
    }
    // Cookieに従業員バーコードを追加
    StaffCode.setStaffCode(parseInt(code), store.staff_barcode_timeout_minutes);
    setAlertState({
      message: '従業員バーコードをスキャンしました',
      severity: 'success',
    });
    setIsScanning(false);
    onClose();
  });

  useEffect(() => {
    const handleOutsideInteraction = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsScanning(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideInteraction);
    document.addEventListener('touchstart', handleOutsideInteraction);

    return () => {
      document.removeEventListener('mousedown', handleOutsideInteraction);
      document.removeEventListener('touchstart', handleOutsideInteraction);
    };
  }, [setIsScanning, onClose]);

  return (
    <CustomDialog
      isOpen={isOpen}
      onClose={onClose}
      title="従業員バーコード読み取り"
    >
      <Stack ref={containerRef} direction="column" gap={2}>
        {isScanning ? (
          <SecondaryButtonWithIcon
            onClick={() => setIsScanning(false)}
            sx={{ height: '40px' }}
            icon={<FaIdCard size={20} />}
          >
            キャンセル
          </SecondaryButtonWithIcon>
        ) : (
          <PrimaryButtonWithIcon
            sx={{
              color: 'text.secondary',
              height: '40px',
            }}
            onClick={() => setIsScanning(true)}
            icon={<FaIdCard size={20} />}
          >
            従業員バーコードをスキャン
          </PrimaryButtonWithIcon>
        )}
        <SecondaryButton
          onClick={() => {
            signOut();
          }}
        >
          ログアウト
        </SecondaryButton>
      </Stack>
    </CustomDialog>
  );
};
