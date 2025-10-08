import { Box } from '@mui/material';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import TertiaryButtonWithIcon from '@/components/buttons/TertiaryButtonWithIcon';

interface DetailCardBottomContentProps {
  isDisabled: boolean;
  isLoading: boolean;
  onNextPage: () => void;
  onPrevPage: () => void;
}

export const DetailCardBottomContent = ({
  isDisabled,
  isLoading,
  onNextPage: handleNextPage,
  onPrevPage: handlePrevPage,
}: DetailCardBottomContentProps) => {
  return (
    <>
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'end',
          gap: 2,
        }}
      >
        <TertiaryButtonWithIcon onClick={handlePrevPage}>
          解体結果の登録に戻る
        </TertiaryButtonWithIcon>
        <PrimaryButtonWithIcon
          onClick={handleNextPage}
          disabled={isDisabled}
          loading={isLoading}
        >
          解体
        </PrimaryButtonWithIcon>
      </Box>
    </>
  );
};
