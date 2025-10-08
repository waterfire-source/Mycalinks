import { Menu } from '@mui/icons-material';
import {
  Box,
  IconButton,
  Stack,
  Typography,
  useTheme,
  Select,
  MenuItem,
  SelectChangeEvent,
  useMediaQuery,
} from '@mui/material';
import Image from 'next/image';
import { Dispatch, SetStateAction } from 'react';
import { useSession } from 'next-auth/react';
import { mycaPosCommonConstants } from '@/constants/mycapos';
import { useStore } from '@/contexts/StoreContext';
import { useRegister } from '@/contexts/RegisterContext';
import TertiaryButton from '@/components/buttons/TertiaryButton';
import { HeaderSettingButton } from '@/components/layouts/header/components/SettingButton';
import { useAccountGroupContext } from '@/contexts/AccountGroupProvider';
import { StaffCode } from '@/utils/staffCode';
import { HeaderMarketFluctuationsButton } from '@/components/layouts/header/components/MarketFluctuationsButton';
import { HeaderAnnouncementButton } from '@/components/layouts/header/components/AnnouncementButton';
import { TaskProgressStatus } from '@/components/layouts/header/components/TaskProgressStatus';
import { TimeText } from '@/components/layouts/header/components/TimeText';
import { CorporationChange } from '@/components/layouts/header/components/CorporationChange';

type Props = {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};
export const HEADER_HEIGHT = '60px';
export const Header = ({ setIsOpen }: Props) => {
  const { data: session } = useSession();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  const { store, setStore, stores } = useStore();
  const { register, setRegister, registers } = useRegister();

  const handleStoreChange = (event: SelectChangeEvent<number>) => {
    const selectedStoreId = event.target.value as number;
    const newStore = stores.find((s) => s.id === selectedStoreId);
    if (newStore) {
      setStore(newStore);
    }
  };

  const handleRegisterChange = (event: SelectChangeEvent<number>) => {
    const selectedRegisterId = event.target.value as number;
    localStorage.setItem('selectedRegisterId', String(selectedRegisterId));

    const newRegister = registers.find((r) => r.id === selectedRegisterId);
    if (newRegister) {
      setRegister(newRegister);
    }
  };

  const { account, resetAccountGroupContext } = useAccountGroupContext();

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'white',
        boxShadow: '0 2px 3px #0000001f',
        height: isTablet ? 'auto' : HEADER_HEIGHT,
        minHeight: HEADER_HEIGHT,
      }}
    >
      <Stack
        direction={isTablet ? 'column' : 'row'}
        justifyContent="space-between"
        padding="12px"
        sx={{ minHeight: '60px' }}
      >
        <Stack direction="row" gap="16px" alignItems="center">
          <IconButton
            sx={{ color: theme.palette.grey[600] }}
            onClick={() => {
              setIsOpen((prev) => !prev);
            }}
          >
            <Menu />
          </IconButton>
          {process.env.NEXT_PUBLIC_DATABASE_KIND == 'production' ? (
            <Image
              src={mycaPosCommonConstants.images.logo}
              alt="logo"
              width={120}
              height={30}
            />
          ) : (
            <Typography>開発モード</Typography>
          )}
        </Stack>

        {/* 右側：スマホでは非表示、タブレットでは2行目に配置 */}
        {!isMobile && (
          <Stack
            direction="row"
            gap={isTablet ? '8px' : '12px'}
            alignItems="center"
            flexWrap={isTablet ? 'wrap' : 'nowrap'}
            sx={{
              mt: isTablet ? 1 : 0,
              justifyContent: isTablet ? 'flex-start' : 'flex-end',
            }}
          >
            <TaskProgressStatus />
            <HeaderAnnouncementButton />
            <HeaderMarketFluctuationsButton />
            <HeaderSettingButton />
            <TimeText />
            {session?.user?.isGod && <CorporationChange />}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ fontSize: isTablet ? '14px' : '16px' }}>
                店舗：
              </Typography>
              {session?.user?.mode === 'admin' ? (
                <Select
                  value={store.id}
                  onChange={handleStoreChange}
                  sx={{
                    minWidth: isTablet ? 100 : 120,
                    minHeight: '33px',
                    height: '33px',
                    fontSize: isTablet ? '14px' : '16px',
                  }}
                >
                  {stores.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.display_name}
                    </MenuItem>
                  ))}
                </Select>
              ) : (
                <Typography sx={{ fontSize: isTablet ? '14px' : '16px' }}>
                  {store.display_name}
                </Typography>
              )}
            </Box>

            {/* レジ選択：管理モードのみ */}
            {session?.user?.mode === 'admin' ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ fontSize: isTablet ? '14px' : '16px' }}>
                  レジ：
                </Typography>
                <Select
                  value={register?.id}
                  onChange={handleRegisterChange}
                  sx={{
                    minWidth: isTablet ? 100 : 120,
                    minHeight: '33px',
                    height: '33px',
                    fontSize: isTablet ? '14px' : '16px',
                  }}
                >
                  {registers.map((r) => (
                    <MenuItem key={r.id} value={r.id}>
                      {r.display_name}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            ) : (
              <Typography sx={{ fontSize: isTablet ? '14px' : '16px' }}>
                レジ：{register?.display_name ?? 'その他端末'}
              </Typography>
            )}
            {session?.user?.mode === 'admin' ? (
              <Typography
                sx={{
                  color: 'primary.main',
                  fontWeight: 600,
                  fontSize: isTablet ? '14px' : '16px',
                  marginLeft: '20px',
                }}
              >
                管理モード
              </Typography>
            ) : (
              <>
                <Typography sx={{ fontSize: isTablet ? '14px' : '16px' }}>
                  担当者：
                  {account?.nick_name?.trim() || account?.display_name}
                </Typography>
                <TertiaryButton
                  onClick={() => {
                    StaffCode.deleteStaffCode();
                    resetAccountGroupContext();
                  }}
                  sx={{ fontSize: isTablet ? '14px' : '16px' }}
                >
                  離席
                </TertiaryButton>
              </>
            )}
          </Stack>
        )}
      </Stack>
    </Box>
  );
};
