import { Typography } from '@mui/material';
import { SpecialtyHandle } from '@prisma/client';
import { getSpecialtyLabel } from '@/app/ec/(core)/utils/specialtyCondition';

type Props = {
  value: SpecialtyHandle;
};

/**
 * スペシャルティタグコンポーネント
 * @param value - スペシャルティのハンドル
 */
export const SpecialtyTag = ({ value }: Props) => {
  return (
    <Typography
      variant="caption"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
        fontSize: '0.65rem !important',
        borderRadius: '4px',
        padding: '4px 6px',
        border: '1px solid',
        borderColor: 'grey.700',
        whiteSpace: 'nowrap',
      }}
    >
      {getSpecialtyLabel(value)}
    </Typography>
  );
};
