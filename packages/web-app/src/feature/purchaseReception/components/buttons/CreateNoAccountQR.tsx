import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { createClientAPI, CustomError } from '@/api/implement';
import { useEposDevice } from '@/contexts/EposDeviceContext';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import QrCode2Icon from '@mui/icons-material/QrCode2';

interface Props {
  text: string;
  isReservation?: boolean;
}
export const CreateNoAccountQR: React.FC<Props> = ({
  text,
  isReservation = false,
}) => {
  const { setAlertState } = useAlert();
  const { ePosDev } = useEposDevice();
  const { store } = useStore();
  const handleGenerateQRCodeForNonMembers = async () => {
    //フォームのURLを取得する
    const apiClient = createClientAPI();

    const getPurchaseFormUrlRes =
      await apiClient.transaction.getPurchaseFormUrl({
        params: {
          store_id: store!.id,
        },
        query: {
          type: isReservation ? 'reservation' : undefined,
        },
      });

    if (getPurchaseFormUrlRes instanceof CustomError) {
      setAlertState({
        severity: 'error',
        message: '非会員用フォームQRの発行に失敗しました',
      });
      return false;
    }

    const command = getPurchaseFormUrlRes.receiptCommand;

    if (ePosDev) {
      setAlertState({
        severity: 'success',
        message:
          '非会員用フォームQRの再発行に成功しました。\n再度お客様に入力いただいたらバーコードをスキャンし直してください。',
      });
      ePosDev.printWithCommand(command, store!.id);
    }
  };
  return (
    <SecondaryButtonWithIcon
      icon={<QrCode2Icon />}
      onClick={handleGenerateQRCodeForNonMembers}
      size="small"
    >
      {text}
    </SecondaryButtonWithIcon>
  );
};
