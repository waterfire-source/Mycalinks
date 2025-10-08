import PrimaryButton from '@/components/buttons/PrimaryButton';
import { Typography } from '@mui/material';
import { Stack, useTheme } from '@mui/material';

interface Props {
  handleClose: () => void;
}

export const NonDeletableAuthorityView = ({ handleClose }: Props) => {
  const { palette } = useTheme();

  return (
    <Stack pt="30px" px="36px" gap="40px" flex={1}>
      <Stack gap="20px" flex={1}>
        <Typography variant="h6" textAlign="center" color={palette.grey[700]}>
          既に従業員に割り当てられている権限は削除できません
        </Typography>
      </Stack>
      <PrimaryButton
        onClick={handleClose}
        sx={{ alignSelf: 'center', width: '120px' }}
      >
        戻る
      </PrimaryButton>
    </Stack>
  );
};
