import { Stack } from '@mui/material';
import { RequiredChip } from '@/components/inputFields/RequiredChip';
import { ItemText } from '@/feature/item/components/ItemText';
interface Props {
  title: string;
}
export const RequiredTitle = ({ title }: Props) => {
  return (
    <Stack direction="row" gap={1}>
      <ItemText text={title} />
      <RequiredChip />
    </Stack>
  );
};
