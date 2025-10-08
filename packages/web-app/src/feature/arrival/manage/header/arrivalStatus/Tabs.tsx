import { ArrivalTabButton } from '@/feature/arrival/manage/header/arrivalStatus/Button';
import { Stack } from '@mui/material';
import { StockingStatus } from '@prisma/client';

export const ArrivalStatusTabs = () => {
  return (
    <Stack direction="row" gap="16px">
      <ArrivalTabButton title="全て" />
      <ArrivalTabButton status={StockingStatus.NOT_YET} title="未入荷" />
      <ArrivalTabButton status={StockingStatus.FINISHED} title="入荷済" />
      <ArrivalTabButton status={StockingStatus.CANCELED} title="キャンセル" />
    </Stack>
  );
};
