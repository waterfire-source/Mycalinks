import { InquiryStatus } from '@/feature/ec/inquiry/const';
import { Inquiry } from '@/feature/ec/inquiry/hooks/useInquiry';
import {
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { EcOrderContactStatus } from '@prisma/client';
import { useState } from 'react';

interface Props {
  currentStatus: Inquiry['orderContacts'][0]['status'];
  setCurrentStatus: React.Dispatch<
    React.SetStateAction<Inquiry['orderContacts'][0]['status']>
  >;
}

export const InquiryStatusSelectBox = ({
  currentStatus,
  setCurrentStatus,
}: Props) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = async (e: SelectChangeEvent<string>) => {
    setIsLoading(true);
    const newStatus = e.target.value as EcOrderContactStatus;
    setCurrentStatus(newStatus);
    setIsLoading(false);
  };

  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <Select
        value={currentStatus}
        onChange={handleChange}
        sx={{ color: InquiryStatus[currentStatus].color, fontWeight: 'bold' }}
        disabled={isLoading}
      >
        {Object.values(InquiryStatus).map((status) => (
          <MenuItem
            key={status.key}
            value={status.key}
            sx={{ color: status.color, fontWeight: 'bold' }}
          >
            {status.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
