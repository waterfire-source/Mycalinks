import { MutableRefObject, useEffect, useRef, useState } from 'react';
import { Stack } from '@mui/material';
import { Store } from '@prisma/client';
import { FaIdCard } from 'react-icons/fa';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { useScanner } from '@/hooks/useScanner';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { NoSpinTextField } from '@/components/common/NoSpinTextField';

type Props = {
  store: Store;
  fetchCustomerByMycaID: (
    storeID: number,
    mycaID?: number,
    mycaBarCode?: string,
  ) => Promise<void>;
  isShowInputField?: boolean;
  ref?: MutableRefObject<HTMLInputElement | null>;
  disabled?: boolean;
};

export const CustomerSearchField: React.FC<Props> = ({
  store,
  fetchCustomerByMycaID,
  isShowInputField = false,
  ref,
  disabled = false,
}) => {
  const [isSecondaryButtonVisible, setIsSecondaryButtonVisible] =
    useState<boolean>(false);
  const [customerScanCode, setCustomerScanCode] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  const { isScanning, setIsScanning } = useScanner(async (code) => {
    if (!code) return;
    await fetchCustomerByMycaID(
      store.id,
      parseInt(code),
      code.length === 24 || code.length === 12 ? code : undefined,
    );
    setIsScanning(false);
  });

  const handleButtonClick = () => {
    setIsScanning(true);
    setIsSecondaryButtonVisible(true);
  };

  const handleSecondaryButtonClick = () => {
    setIsSecondaryButtonVisible(false);
    setIsScanning(false);
    setCustomerScanCode('');
  };

  const handleCustomerSearch = async (code: string) => {
    if (!code) return;
    await fetchCustomerByMycaID(
      store.id,
      parseInt(code),
      code.length === 24 || code.length === 12 ? code : undefined,
    );
  };

  // コンポーネント外のクリック/タッチでスキャンモードを解除（ProductScanButton同様）
  useEffect(() => {
    const handleOutsideInteraction = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsSecondaryButtonVisible(false);
        // スキャンモードが終了したら、入力フィールドをクリア
        if (isScanning) {
          setCustomerScanCode('');
        }
        setIsScanning(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideInteraction);
    document.addEventListener('touchstart', handleOutsideInteraction);

    return () => {
      document.removeEventListener('mousedown', handleOutsideInteraction);
      document.removeEventListener('touchstart', handleOutsideInteraction);
    };
  }, [setIsScanning, isScanning]);

  return (
    <Stack direction="row" gap="16px" alignItems="center">
      <Stack ref={containerRef}>
        {isSecondaryButtonVisible ? (
          <SecondaryButtonWithIcon
            onClick={handleSecondaryButtonClick}
            size="small"
            icon={<FaIdCard size={20} />}
          >
            キャンセル
          </SecondaryButtonWithIcon>
        ) : (
          <PrimaryButtonWithIcon
            size="small"
            sx={{ color: 'text.secondary' }}
            onClick={handleButtonClick}
            icon={<FaIdCard size={20} />}
            disabled={disabled}
          >
            会員証スキャン
          </PrimaryButtonWithIcon>
        )}
      </Stack>

      {isShowInputField && (
        <>
          <NoSpinTextField
            type="number"
            variant="outlined"
            size="small"
            placeholder="会員コード"
            value={customerScanCode}
            onChange={(event) => setCustomerScanCode(event.target.value)}
            onKeyPress={(event) => {
              if (event.key === 'Enter' && customerScanCode) {
                handleCustomerSearch(customerScanCode);
              }
            }}
            inputRef={ref}
            disabled={disabled}
          />
          <SecondaryButtonWithIcon
            size="small"
            onClick={() =>
              customerScanCode && handleCustomerSearch(customerScanCode)
            }
            disabled={disabled}
          >
            検索
          </SecondaryButtonWithIcon>
        </>
      )}
    </Stack>
  );
};
