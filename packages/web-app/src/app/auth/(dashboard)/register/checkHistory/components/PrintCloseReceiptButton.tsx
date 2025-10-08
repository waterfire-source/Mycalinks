import { useCloseReceipt } from '@/app/auth/(dashboard)/register/hooks/useCloseReceipt';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { RegisterAPIRes } from '@/api/frontend/register/api';

interface Props {
  title: string;
  settlement: RegisterAPIRes['listRegisterSettlement']['settlements'][0];
}

export const PrintCloseReceiptButton = ({ settlement, title }: Props) => {
  const { printCloseReceipt, isLoading: isPrinting } = useCloseReceipt();
  return (
    <SecondaryButton
      onClick={() => printCloseReceipt(settlement)}
      loading={isPrinting}
    >
      {title}
    </SecondaryButton>
  );
};
