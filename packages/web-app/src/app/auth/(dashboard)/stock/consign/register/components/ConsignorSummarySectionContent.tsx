'use client';

import { Stack, Typography, Select, MenuItem, Divider } from '@mui/material';
import { CommonCard } from '@/components/cards/CustomCard';
import { ConsignmentClient } from '@/feature/consign/hooks/useConsignment';

const SpacingFormItem = ({
  title,
  node,
  variant = 'body1',
}: {
  title: string;
  node: React.ReactNode;
  variant?: 'body1' | 'body2' | 'caption' | 'subtitle1' | 'subtitle2';
}) => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      width="100%"
      sx={{ mb: 2 }}
    >
      <Typography width="100px" variant={variant}>
        {title}
      </Typography>
      {node}
    </Stack>
  );
};

const DisplayItem = ({ title, value }: { title: string; value: string }) => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      width="100%"
      sx={{
        borderBottom: '1px solid #ccc',
        paddingY: 1,
      }}
    >
      <Typography variant="body1">{title}</Typography>
      <Typography variant="body1">{value}</Typography>
    </Stack>
  );
};

interface ConsignorSummarySectionContentProps {
  selectedConsignmentClient: ConsignmentClient | null;
  consignmentClients: ConsignmentClient[] | undefined;
  displayItem: Array<{ title: string; value: string }>;
  isSubmitting: boolean;
  onConfirmOrder: () => Promise<void>;
  onConsignmentClientChange: (client: ConsignmentClient | null) => void;
}

export function ConsignorSummarySectionContent({
  selectedConsignmentClient,
  consignmentClients,
  displayItem,
  isSubmitting,
  onConfirmOrder,
  onConsignmentClientChange,
}: ConsignorSummarySectionContentProps) {
  return (
    <CommonCard
      title=""
      rightButtonText="登録確定"
      height="100%"
      width="100%"
      onRightButtonClick={onConfirmOrder}
      loading={isSubmitting}
    >
      <Stack flexDirection="column" width="100%" gap={2}>
        <Typography variant="h4">発注詳細</Typography>

        <Stack spacing={2}>
          <SpacingFormItem
            title="委託者"
            node={
              <Select
                fullWidth
                size="small"
                value={selectedConsignmentClient?.id || null}
                onChange={(e) => {
                  const target =
                    consignmentClients?.find(
                      (client) => client.id === Number(e.target.value),
                    ) ?? null;
                  onConsignmentClientChange(target);
                }}
                displayEmpty
              >
                <MenuItem value="">委託者を選択してください</MenuItem>
                {consignmentClients?.map((client: any) => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.full_name}
                  </MenuItem>
                ))}
              </Select>
            }
          />

          <Divider sx={{ my: 1 }} />

          <Stack width="100%" gap={1}>
            {displayItem.map((i) => (
              <DisplayItem key={i.title} title={i.title} value={i.value} />
            ))}
          </Stack>
        </Stack>
      </Stack>
    </CommonCard>
  );
}
