import SecondaryButton from '@/components/buttons/SecondaryButton';
import { useParamsAsState } from '@/hooks/useParamsAsState';
import { useTheme } from '@mui/material';
import { StockingStatus } from '@prisma/client';

interface Props {
  title: string;
  status?: StockingStatus;
}
export const ArrivalTabButton = ({ status, title }: Props) => {
  const [params, setParams] = useParamsAsState('status');
  const { palette } = useTheme();
  // 現在選択されているかを判定する関数
  const isActive = (status?: StockingStatus) => {
    if (status === undefined) {
      // "全て"の場合はstatusはundefined, paramsがnull
      return params === null;
    }
    return params === status;
  };
  const onClick = (status?: StockingStatus) => {
    if (!status) {
      setParams('');
      return;
    }
    setParams(status);
  };
  return (
    <SecondaryButton
      sx={{
        backgroundColor: isActive(status)
          ? palette.grey[700]
          : palette.grey[300],
        color: isActive(status) ? palette.common.white : palette.grey[700],
        ':focus': {
          color: palette.common.white,
        },
      }}
      onClick={() => onClick(status)}
    >
      {title}
    </SecondaryButton>
  );
};
