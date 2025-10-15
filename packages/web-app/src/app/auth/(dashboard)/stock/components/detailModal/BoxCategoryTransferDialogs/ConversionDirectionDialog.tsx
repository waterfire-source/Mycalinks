import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { Stack, Typography } from '@mui/material';
import { AvailableAction } from '@/app/auth/(dashboard)/stock/hooks/useCheckBoxInfo';

type Props = {
  open: boolean;
  onClose: () => void;
  productType: string;
  targetType: string;
  availableActions: AvailableAction[];
  onDirectionSelect: (direction: string) => void;
};

export const ConversionDirectionDialog = ({
  open,
  onClose,
  productType,
  targetType,
  availableActions,
  onDirectionSelect,
}: Props) => {
  // 選択された変換先に関連するアクションを取得
  const relevantActions = availableActions.filter(action => {
    if (targetType === 'PACK') {
      return action.type.includes('PACK');
    }
    if (targetType === 'BOX') {
      return action.type.includes('BOX');
    }
    if (targetType === 'CARTON') {
      return action.type.includes('CARTON');
    }
    return false;
  });

  // 純粋な方向選択として、2つの方向を取得
  const getDirectionOptions = () => {
    const directions = [];
    const currentTypeName = getTypeName(productType);
    const targetTypeName = getTypeName(targetType);

    // 現在のproductTypeからtargetTypeへの変換
    if (relevantActions.find(a => a.type === `${productType}_TO_${targetType}`)) {
      directions.push({
        value: `${productType}_TO_${targetType}`,
        label: `${currentTypeName} → ${targetTypeName}`
      });
    }

    // targetTypeから現在のproductTypeへの変換
    if (relevantActions.find(a => a.type === `${targetType}_TO_${productType}`)) {
      directions.push({
        value: `${targetType}_TO_${productType}`,
        label: `${targetTypeName} → ${currentTypeName}`
      });
    }

    return directions;
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'PACK':
        return 'パック';
      case 'BOX':
        return 'ボックス';
      case 'CARTON':
        return 'カートン';
      default:
        return type;
    }
  };

  const directionOptions = getDirectionOptions();

  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      title="変換の方向を選択してください"
      isCancelButtonVisible={false}
      content={
        <>
          <Typography sx={{ mb: 2 }}>
            変換の方向を選択してください
          </Typography>
          <Stack direction="column" spacing={2}>
            {directionOptions.map((option) => (
              <SecondaryButton
                key={option.value}
                onClick={() => onDirectionSelect(option.value)}
              >
                {option.label}
              </SecondaryButton>
            ))}
          </Stack>
        </>
      }
    />
  );
};