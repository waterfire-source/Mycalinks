import PrimaryButton from '@/components/buttons/PrimaryButton';
import { useAlert } from '@/contexts/AlertContext';
import { StaffAccount } from '@/feature/account/hooks/useAccounts';
import { ExportAccountCodeModal } from '@/feature/settings/account/components/ExportAccountCode/Modal';
import { useState } from 'react';

interface Props {
  selectedAccounts: StaffAccount[];
}

export const ExportAccountCodeButton = ({ selectedAccounts }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { setAlertState } = useAlert();
  const [accountCodes, setAccountCodes] = useState<number[]>([]);

  const handleSelectedStaffExport = () => {
    const validAccounts = selectedAccounts.filter(
      (account): account is StaffAccount & { code: number } =>
        account.code !== null && account.code !== undefined,
    );

    // Now map the codes safely
    const codes: number[] = validAccounts.map((account) => account.code);
    if (codes.length === 0) {
      setAlertState({
        message: '全ての選択された従業員は従業員番号が登録されていません',
        severity: 'error',
      });
      return;
    } else if (codes.length !== selectedAccounts.length) {
      setAlertState({
        message:
          '選択された従業員の中に従業員番号が登録されていないものがあります',
        severity: 'error',
      });
    }
    setAccountCodes(codes);
    setIsOpen(true);
  };
  return (
    <>
      <PrimaryButton
        sx={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
        disabled={selectedAccounts.length === 0}
        onClick={handleSelectedStaffExport}
      >
        選択した従業員番号をまとめて出力
      </PrimaryButton>
      <ExportAccountCodeModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        barcodeNumbers={accountCodes}
        notExportButton={false}
      />
    </>
  );
};
