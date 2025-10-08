import { AppraisalItem } from '@/feature/appraisal/components/tables/PsaTable';
import { Stack, TextField, Typography } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';

type Props = {
  selectedAppraisal: AppraisalItem | undefined;
  updateDescription: () => void;
  description: string;
  setDescription: Dispatch<SetStateAction<string>>;
};

export const AppraisalDetailFeeData = ({
  selectedAppraisal,
  updateDescription,
  description,
  setDescription,
}: Props) => {
  return (
    <Stack sx={{ width: '100%', height: '100%', pt: 2, px: 2 }} spacing={2}>
      <Stack
        direction="row"
        justifyContent="space-between"
        borderBottom="1px solid black"
      >
        <Typography>鑑定料合計(税込)</Typography>
        <Typography>
          {selectedAppraisal?.appraisal_fee.toLocaleString() || 0}円
        </Typography>
      </Stack>
      <Stack
        direction="row"
        justifyContent="space-between"
        borderBottom="1px solid black"
      >
        <Typography>送料(税込)</Typography>
        <Typography>
          {selectedAppraisal?.shipping_fee.toLocaleString() || 0}円
        </Typography>
      </Stack>
      <Stack
        direction="row"
        justifyContent="space-between"
        borderBottom="1px solid black"
      >
        <Typography>保険料(税込)</Typography>
        <Typography>
          {selectedAppraisal?.insurance_fee.toLocaleString() || 0}円
        </Typography>
      </Stack>
      <Stack
        direction="row"
        justifyContent="space-between"
        borderBottom="1px solid black"
      >
        <Typography>事務手数料(税込)</Typography>
        <Typography>
          {selectedAppraisal?.handling_fee.toLocaleString() || 0}円
        </Typography>
      </Stack>
      <Stack
        direction="row"
        justifyContent="space-between"
        borderBottom="1px solid black"
      >
        <Typography>その他手数料(税込)</Typography>
        <Typography>
          {selectedAppraisal?.other_fee.toLocaleString() || 0}円
        </Typography>
      </Stack>
      <Stack sx={{ flex: 1 }}>
        <Typography>備考</Typography>
        <TextField
          sx={{ flex: 1, height: '100%' }}
          multiline
          fullWidth
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={updateDescription}
          InputProps={{
            sx: { height: '100%', alignItems: 'flex-start' },
          }}
        />
      </Stack>
    </Stack>
  );
};
