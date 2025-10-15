import { useParamsAsState } from '@/hooks/useParamsAsState';
import { Box, Tabs } from '@mui/material';
import { CustomTabTableStyle } from '@/components/tabs/CustomTabTableStyle';
import { StockingStatus } from '@prisma/client';

export const TabComponent = () => {
  const statusTabs = [
    { id: 0, label: 'すべて', key: 'all' },
    { id: 1, label: '未納品', key: StockingStatus.NOT_YET },
    { id: 2, label: '納品済み', key: StockingStatus.FINISHED },
    { id: 3, label: 'キャンセル', key: StockingStatus.CANCELED },
  ];

  const [params, setParams] = useParamsAsState('status');

  // 現在の選択中の status を判定
  const getCurrentIndex = () => {
    const currentStatus = params ?? 'all';
    return statusTabs.findIndex((tab) => tab.key === currentStatus);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    const selectedTab = statusTabs[newValue];
    if (selectedTab.key === 'all') {
      setParams('');
    } else {
      setParams(selectedTab.key);
    }
  };

  return (
    <Box
      sx={{
        borderBottom: '8px solid #b82a2a',
        display: 'flex',
        alignItems: 'center',
        padding: 0,
      }}
    >
      <Tabs
        value={getCurrentIndex()}
        onChange={handleTabChange}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{
          margin: 0,
          padding: 0,
          minHeight: '31px',
          '& .MuiTabs-scrollButtons': {
            display: 'none',
          },
        }}
      >
        {statusTabs.map((tab) => (
          <CustomTabTableStyle key={tab.key} label={<Box>{tab.label}</Box>} />
        ))}
      </Tabs>
    </Box>
  );
};
