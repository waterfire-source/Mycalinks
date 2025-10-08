'use client';

import { useEffect, useState } from 'react';
import { Box, Tabs } from '@mui/material';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { SecondaryCustomTabTableStyle } from '@/components/tabs/CustomTabTableStyle';
import { TransactionContentsCard } from '@/app/auth/(dashboard)/transaction/components/TransactionContentsCard';
import { TransactionContentsCardForEachProduct } from '@/app/auth/(dashboard)/transaction/product/components/TransactionContentsCardForEachProduct';

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </Box>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  customerId: number;
  title: string;
}

export function CustomerTransactionModal({
  open,
  onClose,
  customerId,
  title,
}: Props) {
  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    if (open) {
      setTabValue(0);
    }
  }, [open]);

  return (
    <CustomModalWithIcon
      open={open}
      onClose={onClose}
      title={title}
      width="90%"
      height="90%"
      cancelButtonText="閉じる"
    >
      {/* タブ表示 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            margin: 0,
            padding: 0,
            minHeight: '31px',
          }}
        >
          <SecondaryCustomTabTableStyle label="取引別" />
          <SecondaryCustomTabTableStyle label="商品別" />
        </Tabs>
      </Box>

      {/* 取引別タブ */}
      <TabPanel value={tabValue} index={0}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            overflowY: 'auto',
            flexGrow: 1,
          }}
        >
          <TransactionContentsCard customerId={customerId} isShow={false} />
        </Box>
      </TabPanel>

      {/* 商品別タブ */}
      <TabPanel value={tabValue} index={1}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            overflowY: 'auto',
            flexGrow: 1,
          }}
        >
          <TransactionContentsCardForEachProduct
            customerId={customerId}
            isShow={false}
          />
        </Box>
      </TabPanel>
    </CustomModalWithIcon>
  );
}
