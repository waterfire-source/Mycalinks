import { useEposDevice } from '@/contexts/EposDeviceContext';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { useAlert } from '@/contexts/AlertContext';
export const OpenDrawerButton = () => {
  const { ePosDev } = useEposDevice();
  const { setAlertState } = useAlert();

  return (
    <SecondaryButton
      onClick={() => {
        if (ePosDev) {
          ePosDev.openDrawer();
        } else {
          setAlertState({
            message: 'ドロアーが接続されていません',
            severity: 'error',
          });
        }
      }}
    >
      ドロアーを開く
    </SecondaryButton>
  );
};
