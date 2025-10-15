import { DateField } from '@/components/inputFields/DateField';
import { Stack, Typography } from '@mui/material';

interface Props {
  startLabel?: string;
  endLabel?: string;
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
}
export const DateRangeField = ({
  startLabel = '開始日',
  endLabel = '終了日',
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}: Props) => {
  return (
    <Stack direction="row" gap={1} alignItems="center">
      <DateField label={startLabel} value={startDate} onChange={setStartDate} />
      <Typography>～</Typography>
      <DateField label={endLabel} value={endDate} onChange={setEndDate} />
    </Stack>
  );
};
