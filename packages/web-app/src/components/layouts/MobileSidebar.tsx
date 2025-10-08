import { useEffect, useState } from 'react';
import { Box, Drawer, IconButton, Stack, List, Collapse } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { PATH } from '@/constants/paths';
import { useRouter } from 'next/navigation';
import {
  Inventory as InventoryIcon,
  DriveFileMove as DriveFileMoveIcon,
} from '@mui/icons-material';
import { Store, RegisterStatus } from '@prisma/client';
import Image from 'next/image';
import { mycaPosCommonConstants } from '@/constants/mycapos';
import { MenuItemProps } from '@/components/layouts/SideBar';
import { useRegister } from '@/contexts/RegisterContext';

const MobileSidebar = ({
  isOpen,
  setIsOpen,
  renderMenuItem,
  store,
  theme,
  openMenus,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  renderMenuItem: (item: MenuItemProps) => JSX.Element;
  store: Store;
  theme: any;
  openMenus: { [key: string]: boolean };
}) => {
  const router = useRouter();
  const { register } = useRegister();
  const [isRegisterOpened, setIsRegisterOpened] = useState<boolean | undefined>(
    undefined,
  );

  // フェッチ後にレジ情報からステータスを設定する
  useEffect(() => {
    if (register) {
      setIsRegisterOpened(register.status === RegisterStatus.OPEN);
    } else {
      // レジが紐づいていない場合はボタンを表示しないようにする
      setIsRegisterOpened(undefined);
    }
  }, [register]);

  const menuItems: MenuItemProps[] = [
    // {
    //   path: PATH.DASHBOARD,
    //   title: 'ダッシュボード',
    //   icon: <DashboardIcon />,
    //   showWhenClose: true,
    // },
    // {
    //   path: PATH.SALE.root,
    //   title: '販売（会計）',
    //   icon: <ShoppingCartIcon />,
    //   showWhenClose: false,
    // },
    // {
    //   path: PATH.PURCHASE,
    //   title: '買取（会計）',
    //   icon: <MonetizationOnIcon />,
    //   showWhenClose: false,
    // },
    // {
    //   path: PATH.PURCHASE_RECEPTION.root,
    //   title: '買取受付一覧',
    //   icon: <ReceiptLongIcon />,
    //   showWhenClose: true,
    // },
    // {
    //   path: PATH.ITEM.root,
    //   title: '商品マスタ',
    //   icon: <StoreIcon />,
    //   showWhenClose: true,
    // },
    {
      path: PATH.STOCK.root,
      title: '在庫',
      icon: <InventoryIcon />,
      showWhenClose: true,
    },
    // {
    //   path: PATH.INVENTORY_COUNT.root,
    //   title: '棚卸',
    //   icon: <AssignmentTurnedInIcon />,
    //   showWhenClose: true,
    // },
    // {
    //   path: PATH.SUPPLIER.root,
    //   title: '仕入れ先',
    //   icon: <DomainIcon />,
    //   showWhenClose: true,
    // },
    // {
    //   path: `${PATH.ARRIVAL.root}?status=NOT_YET`,
    //   title: '発注管理',
    //   icon: <LocalShippingIcon />,
    //   showWhenClose: true,
    // },
    // {
    //   path: PATH.CASH,
    //   title: '入出金',
    //   icon: <PointOfSaleIcon />,
    //   showWhenClose: true,
    // },
    {
      path: PATH.TRANSACTION,
      title: '取引',
      icon: <DriveFileMoveIcon />,
      showWhenClose: true,
    },
    // {
    //   path: '',
    //   title: '顧客',
    //   icon: <PeopleIcon />,
    //   showWhenClose: true,
    //   children: [
    //     { path: PATH.CUSTOMERS.root, title: '顧客管理', showWhenClose: true },
    //   ],
    // },
    // {
    //   path: '',
    //   title: '設定',
    //   icon: <SettingsIcon />,
    //   showWhenClose: true,
    //   children: [
    //     {
    //       path: PATH.SETTINGS.departments,
    //       title: '部門一覧(開発中)',
    //       showWhenClose: true,
    //     },
    //     {
    //       path: PATH.SETTINGS.corporation,
    //       title: '法人情報設定',
    //       showWhenClose: true,
    //     },
    //     {
    //       path: PATH.SETTINGS.store.replace('[store_id]', store?.id.toString()),
    //       title: '店舗アカウント設定',
    //       showWhenClose: true,
    //     },
    //   ],
    // },
  ];

  const filteredMenuItems = store?.opened
    ? menuItems
    : menuItems.filter((item) => item.showWhenClose);

  return (
    <Drawer
      anchor="left"
      open={isOpen}
      onClose={() => setIsOpen(false)}
      sx={{ '& .MuiDrawer-paper': { width: 240, height: '100vh' } }}
    >
      <Stack
        direction="column"
        sx={{
          height: '100%',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
          }}
        >
          <Image
            src={mycaPosCommonConstants.images.logo}
            alt="logo"
            width={120}
            height={30}
          />
          <IconButton
            onClick={() => setIsOpen(false)}
            sx={{ color: theme.palette.grey[600] }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <List component="nav" sx={{ width: '100%', p: 0 }}>
          {filteredMenuItems.map((item) => (
            <Box key={item.title}>
              {renderMenuItem(item)}
              {item.children && (
                <Collapse
                  in={openMenus[item.title]}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    {item.children.map(renderMenuItem)}
                  </List>
                </Collapse>
              )}
            </Box>
          ))}
        </List>

        {/* レジ開け・レジ締め */}
        <Box
          width="100%"
          justifyContent="center"
          display="flex"
          p={2}
          mt="auto"
        >
          <Box>
            {isRegisterOpened === undefined ? null : isRegisterOpened ? (
              <PrimaryButton
                sx={{ width: '100px' }}
                onClick={() => {
                  router.push(PATH.REGISTER.close);
                  setIsOpen(false);
                }}
              >
                レジ締め
              </PrimaryButton>
            ) : (
              <PrimaryButton
                sx={{ width: '100px' }}
                onClick={() => {
                  router.push(PATH.REGISTER.open);
                  setIsOpen(false);
                }}
              >
                レジ開け
              </PrimaryButton>
            )}
          </Box>
        </Box>

        {/* レジ点検: レジ開けが完了している場合のみ表示 */}
        {isRegisterOpened === true && (
          <Box width="100%" justifyContent="center" display="flex" p={2}>
            <Box>
              <SecondaryButton
                sx={{ width: '100px' }}
                onClick={() => {
                  router.push(PATH.REGISTER.check);
                  setIsOpen(false);
                }}
              >
                レジ点検
              </SecondaryButton>
            </Box>
          </Box>
        )}
      </Stack>
    </Drawer>
  );
};

export default MobileSidebar;
