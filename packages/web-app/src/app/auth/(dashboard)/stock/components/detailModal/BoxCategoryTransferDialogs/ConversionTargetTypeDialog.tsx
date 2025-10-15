import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { Stack, Typography } from '@mui/material';

type Props = {
  open: boolean;
  onClose: () => void;
  availableTargets: string[];
  onTargetSelect: (targetType: string) => void;
};

export const ConversionTargetTypeDialog = ({
  open,
  onClose,
  availableTargets,
  onTargetSelect,
}: Props) => {
  const getTargetButtonText = (target: string) => {
    // 現在のproductTypeは必ずBOXなので、BOXとtargetの双方向表示
    switch (target) {
      case 'PACK':
        return 'ボックス⇔パック';
      case 'BOX':
        return 'ボックス⇔ボックス'; // このケースは通常あり得ない
      case 'CARTON':
        return 'ボックス⇔カートン';
      default:
        return `ボックス⇔${target}`;
    }
  };

  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      title="変換先を選択してください"
      isCancelButtonVisible={false}
      content={
        <>
          <Typography sx={{ mb: 2 }}>
            どちらに変換しますか？
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            {availableTargets.map((target) => (
              <SecondaryButton
                key={target}
                onClick={() => onTargetSelect(target)}
              >
                {getTargetButtonText(target)}
              </SecondaryButton>
            ))}
          </Stack>
        </>
      }
    />
  );
};