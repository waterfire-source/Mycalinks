import SecondaryButton from '@/components/buttons/SecondaryButton';
import CustomDialog from '@/components/dialogs/CustomDialog';
import { useTaskProgress } from '@/contexts/TaskProgressContext';
import { formatDate } from '@/utils/day';
import { Typography, SxProps } from '@mui/material';
import dayjs from 'dayjs';
import { useState } from 'react';

interface Props {
  sx?: SxProps;
}
export const StoreStatus = ({ sx }: Props) => {
  const { taskProgress } = useTaskProgress();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <SecondaryButton onClick={() => setIsOpen(true)} sx={sx}>
        店舗状況
      </SecondaryButton>
      <CustomDialog
        isOpen={isOpen}
        title="店舗状況"
        onClose={() => setIsOpen(false)}
      >
        <Typography variant="h4">{taskProgress?.status_description}</Typography>
        <Typography variant="h4">
          最終更新日時:
          {formatDate(dayjs(taskProgress?.finished_at))}
        </Typography>
      </CustomDialog>
    </>
  );
};
