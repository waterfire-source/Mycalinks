import { useEffect, useState } from 'react';
import { Box, Stack, List, Collapse } from '@mui/material';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { PATH } from '@/constants/paths';
import { useRouter } from 'next/navigation';
import {
  Dashboard as DashboardIcon,
  Store as StoreIcon,
  ShoppingCart as ShoppingCartIcon,
  MonetizationOn as MonetizationOnIcon,
  Inventory2Outlined as AllStoreStockIcon,
  Inventory as InventoryIcon,
  PointOfSale as PointOfSaleIcon,
  DriveFileMove as DriveFileMoveIcon,
  LocalShipping as LocalShippingIcon,
  ReceiptLong as ReceiptLongIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  People as PeopleIcon,
  //BarChart as BarChart,
  Settings as SettingsIcon,
  CardGiftcard as CardGiftcardIcon,
  ListAlt as ListAltIcon,
  Museum as MuseumIcon,
  CardMembership as CardMembershipIcon,
  Gavel as GavelIcon,
  BarChart,
  NotificationsNone as NotificationsNoneIcon,
  Language as LanguageIcon,
} from '@mui/icons-material';
import { Store, RegisterStatus } from '@prisma/client';
import { MenuItemProps } from '@/components/layouts/SideBar';
import { HEADER_HEIGHT } from '@/components/layouts/header/Header';
import { Register, useRegister } from '@/contexts/RegisterContext';
import { useAccountGroupContext } from '@/contexts/AccountGroupProvider';
import { policies, PolicyKind } from '@/constants/policies';
import { ConfirmationModal } from '@/components/modals/ConfirmationModal';
import { useSession } from 'next-auth/react';
// コンテキストのインポート
type DesktopSidebarProps = {
  renderMenuItem: (item: MenuItemProps) => JSX.Element;
  store: Store;
  theme: any;
  openMenus: {
    [key: string]: boolean;
  };
};

const DesktopSidebar = ({
  renderMenuItem,
  store,
  theme,
  openMenus,
}: DesktopSidebarProps) => {
  const router = useRouter();
  const { register, resetRegister, registers } = useRegister();
  const [isRegisterOpened, setIsRegisterOpened] = useState<boolean | undefined>(
    undefined,
  );

  const [isCloseRegisterModalVisible, setIsCloseRegisterModalVisible] =
    useState(false);

  const { data: session } = useSession();

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
    {
      path: PATH.DASHBOARD,
      title: 'ダッシュボード',
      icon: <DashboardIcon />,
      showWhenClose: true,
    },
    {
      path: PATH.SALE.root,
      title: '販売（会計）',
      icon: <ShoppingCartIcon />,
      showWhenClose: false,
    },
    {
      path: PATH.PURCHASE,
      title: '買取（会計）',
      icon: <MonetizationOnIcon />,
      showWhenClose: false,
    },
    !process.env.NEXT_PUBLIC_ORIGIN?.includes('public') && {
      path: PATH.PURCHASE_RECEPTION.root,
      title: '買取受付一覧',
      icon: <ReceiptLongIcon />,
      showWhenClose: true,
    },
    {
      path: PATH.ITEM.root,
      title: '商品マスタ',
      icon: <StoreIcon />,
      showWhenClose: true,
    },
    {
      path: '',
      title: '在庫',
      icon: <InventoryIcon />,
      showWhenClose: true,
      children: [
        {
          path: PATH.STOCK.root,
          title: '在庫一覧',
          showWhenClose: true,
        },
        {
          path: PATH.STOCK.register.pack.root,
          title: 'パック開封',
          showWhenClose: true,
        },
        {
          path: PATH.STOCK.bundle.root,
          title: 'バンドル・セット',
          showWhenClose: true,
        },
        {
          path: PATH.STOCK.sale.root,
          title: 'セール',
          showWhenClose: true,
        },
        {
          path: PATH.STOCK.specialPriceStock.root,
          title: '特価在庫',
          showWhenClose: true,
        },
        {
          path: PATH.STOCK.loss.root,
          title: 'ロス',
          showWhenClose: true,
        },

        {
          path: PATH.STOCK.consign.root,
          title: '受託商品',
          showWhenClose: true,
        },
        {
          path: PATH.STOCK.consignUser.root,
          title: '委託者管理',
          showWhenClose: true,
        },
      ],
    },
    {
      path: PATH.ALL_STORE_STOCK.root,
      title: '全店舗在庫',
      icon: <AllStoreStockIcon />,
      showWhenClose: true,
    },
    {
      path: PATH.ORIGINAL_PACK.root,
      title: 'オリパ・福袋',
      icon: <CardGiftcardIcon />,
      showWhenClose: true,
    },
    {
      path: '',
      title: '予約',
      icon: <CardMembershipIcon />,
      showWhenClose: true,
      children: [
        {
          path: PATH.BOOKING.product,
          title: '予約商品',
          showWhenClose: true,
        },
        {
          path: PATH.BOOKING.root,
          title: '受付済み予約一覧',
          showWhenClose: true,
        },
      ],
    },
    {
      path: PATH.PURCHASE_TABLE.root,
      title: '買取表',
      icon: <ListAltIcon />,
      showWhenClose: true,
    },
    {
      path: '',
      title: '発注・出荷',
      icon: <LocalShippingIcon />,
      showWhenClose: true,
      children: [
        {
          path: PATH.ARRIVAL.root,
          title: '発注管理',
          showWhenClose: true,
        },
        {
          path: PATH.STORESHIPMENT.root,
          title: '出荷管理',
          showWhenClose: true,
        },
      ],
    },
    {
      path: PATH.SUPPLIER.root,
      title: '仕入れ先',
      icon: <MuseumIcon />,
      showWhenClose: true,
    },
    {
      path: PATH.CASH,
      title: '入出金',
      icon: <PointOfSaleIcon />,
      showWhenClose: true,
    },
    {
      path: PATH.TRANSACTION,
      title: '取引一覧',
      icon: <DriveFileMoveIcon />,
      showWhenClose: true,
    },
    !process.env.NEXT_PUBLIC_ORIGIN?.includes('public') && {
      path: PATH.INVENTORY_COUNT.root,
      title: '棚卸',
      icon: <AssignmentTurnedInIcon />,
      showWhenClose: true,
    },
    // {
    //   path: PATH.ADVERTISEMENT,
    //   title: '広告・告知',
    //   icon: <AdvertisementIcon />,
    //   showWhenClose: true,
    // },
    {
      path: PATH.APPRAISAL.root,
      title: '鑑定',
      icon: <GavelIcon />,
      showWhenClose: true,
    },
    {
      path: PATH.SALES_ANALYTICS.root,
      title: '売上分析',
      icon: <BarChart />,
      showWhenClose: true,
    },
    !process.env.NEXT_PUBLIC_ORIGIN?.includes('public') && {
      path: '',
      title: '顧客',
      icon: <PeopleIcon />,
      showWhenClose: true,
      children: [
        {
          path: PATH.CUSTOMERS.root,
          title: '顧客管理',
          showWhenClose: true,
        },
      ],
    },
    {
      path: '',
      title: '設定',
      icon: <SettingsIcon />,
      showWhenClose: true,
      children: [
        {
          path: PATH.SETTINGS.cashRegister,
          title: 'レジ設定',
          showWhenClose: true,
        },
        {
          path: PATH.SETTINGS.genreAndCategory,
          title: 'ジャンル・カテゴリ設定',
          showWhenClose: true,
        },
        {
          path: PATH.SETTINGS.condition,
          title: '状態',
          showWhenClose: true,
        },
        {
          path: PATH.SETTINGS.specialty,
          title: '特殊状態',
          showWhenClose: true,
        },
        {
          path: PATH.SETTINGS.wholesalePrice,
          title: '仕入れ値設定',
          showWhenClose: true,
        },

        {
          path: PATH.SETTINGS.corporation,
          title: '法人情報設定',
          showWhenClose: true,
        },
        {
          path: PATH.SETTINGS.store.replace('[store_id]', store?.id.toString()),
          title: '店舗アカウント設定',
          showWhenClose: true,
        },
        {
          path: PATH.SETTINGS.account,
          title: '従業員一覧',
          showWhenClose: true,
        },
        {
          path: PATH.SETTINGS.authority,
          title: '権限',
          showWhenClose: true,
        },
        {
          path: PATH.SETTINGS.point,
          title: 'ポイント設定',
          showWhenClose: true,
        },
        {
          path: PATH.SETTINGS.tabletSetting,
          title: '店舗タブレット設定',
          showWhenClose: true,
        },
        // {
        //   path: PATH.SETTINGS.template,
        //   title: 'テンプレート',
        //   showWhenClose: true,
        // },
      ],
    },

    {
      path: '',
      title: 'EC',
      icon: <LanguageIcon />,
      showWhenClose: true,
      children: [
        {
          path: PATH.EC.list,
          title: '注文',
          showWhenClose: true,
        },
        {
          path: PATH.EC.inquiry,
          title: 'お問い合わせ',
          showWhenClose: true,
        },
        {
          path: PATH.EC.stock,
          title: '出品可能商品',
          showWhenClose: true,
        },
        {
          path: PATH.EC.transaction,
          title: 'EC取引',
          showWhenClose: true,
        },
        {
          path: PATH.EC.settings,
          title: 'EC設定',
          showWhenClose: true,
        },
        {
          path: PATH.EC.about(store?.id.toString()),
          title: 'ショップページ',
          showWhenClose: true,
        },
        {
          path: PATH.EC.external,
          title: '外部連携',
          showWhenClose: true,
        },
        {
          path: PATH.EC.salesAnalytics,
          title: '売上分析',
          showWhenClose: true,
        },
      ],
    },
    session?.user?.isGod && {
      path: PATH.ANNOUNCEMENT,
      title: 'お知らせ投稿',
      icon: <NotificationsNoneIcon />,
      showWhenClose: true,
    },
  ].filter(Boolean) as MenuItemProps[];

  const [uncloseRegisters, setUncloseRegisters] = useState<Register[]>([]);
  useEffect(() => {
    const uncloseRegisters = registers.filter(
      (r) => r.status === RegisterStatus.OPEN && r.is_primary === false,
    );
    setUncloseRegisters(uncloseRegisters);
  }, [registers]);

  /**
   * レジ締めを行う
   */
  const handleClickCloseRegister = async () => {
    //最新の情報を取得

    if (!register || !store) return;

    if (register.is_primary) {
      const _registers = await resetRegister();

      //このレジがメインレジ（is_primary = true）で、レジ金を個別で管理する設定にしてた時、他のレジが閉まっていなかったらエラーモーダルを出す
      if (
        register.is_primary &&
        store.register_cash_manage_by_separately &&
        _registers.some(
          (r) => r.status === RegisterStatus.OPEN && r.is_primary === false,
        )
      ) {
        //エラーモーダルを出す
        setIsCloseRegisterModalVisible(true);
        return;
      }
    }

    router.push(PATH.REGISTER.close);
  };

  // 表示するメニューの制御
  const filteredMenuItems = menuItems.filter((item) => {
    // ストアが開店、かつレジがOpenの場合、すべてのメニューを表示
    if (store?.opened && isRegisterOpened === true) {
      return true;
    }

    // 閉店、もしくは、レジがClosedの場合、特定のメニューのみを表示
    return item.showWhenClose === true;
  });

  const { accountGroup } = useAccountGroupContext();

  //権限の判別がItems単位なので、子要素に対しては権限をかけられない(法人情報設定など)
  const authorityFilteredMenuItems = filteredMenuItems.filter((item) => {
    // 権限があるかどうかでfilterにかける
    const policyArray = Object.values(policies);

    const targetPolicy = policyArray.find((policy) => {
      if (policy.kind !== PolicyKind.PAGE_READ) {
        return false;
      }

      // 子要素があるitemは、子要素のpathと一致するか確認してなかったら親ごと表示しない
      if (item.children) {
        return item.children.some((child) => {
          if (policy.path !== child.path) {
            return false;
          }
          return true;
        });
      }
      // 子要素がないitemは、pathと一致するか確認してなかったら表示しない
      if (policy.path !== item.path) {
        return false;
      }
      return true;
    });
    return targetPolicy ? accountGroup?.[targetPolicy.key] : true;
  });

  // 各要素の高さ
  const SIDEBAR_HEIGHT = `calc(100vh - ${HEADER_HEIGHT})`;
  const BOTTOM_HEIGHT = '150px';
  const CONTENT_HEIGHT = `calc(${SIDEBAR_HEIGHT} - ${BOTTOM_HEIGHT})`;

  return (
    <Stack
      sx={{
        backgroundColor: theme.palette.common.white,
        minWidth: '150px',
        alignItems: 'start',
        gap: theme.spacing(1),
        px: theme.spacing(0.5),
        height: SIDEBAR_HEIGHT,
      }}
    >
      <List
        component="nav"
        sx={{
          width: '100%',
          p: 0,
          height: CONTENT_HEIGHT,
          pt: '24px',
          overflowY: 'scroll',
        }}
      >
        {authorityFilteredMenuItems.map((item) => (
          <Box key={item.path || item.title}>
            {renderMenuItem(item)}
            {item.children && (
              <Collapse in={openMenus[item.title]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.children.map((child) => {
                    if (
                      child.title === '法人情報設定' &&
                      !accountGroup?.update_corporation
                    ) {
                      return null;
                    }
                    return (
                      <Box key={child.path || child.title}>
                        {renderMenuItem(child)}
                      </Box>
                    );
                  })}
                </List>
              </Collapse>
            )}
          </Box>
        ))}
      </List>

      {/* レジ開け・レジ締め */}
      <Stack
        height={BOTTOM_HEIGHT}
        width="100%"
        justifyContent="center"
        display="flex"
        gap={2}
      >
        <Stack width="100%" justifyContent="center" alignItems="center">
          {isRegisterOpened === undefined ? null : isRegisterOpened ? (
            <>
              <PrimaryButton
                sx={{ width: '120px' }}
                onClick={handleClickCloseRegister}
              >
                レジ締め
              </PrimaryButton>
              <ConfirmationModal
                open={isCloseRegisterModalVisible}
                onClose={() => setIsCloseRegisterModalVisible(false)}
                onConfirm={() => setIsCloseRegisterModalVisible(false)}
                title="未締めのレジがあります"
                description={`以下のレジが締められていません\nメインレジ以外の全てのレジ締めを完了させてください\n
                  ${uncloseRegisters.map((r) => r.display_name).join('\n')}
                  `}
                confirmButtonText="確認"
                hideCancelButton
              />
            </>
          ) : (
            <PrimaryButton
              sx={{ width: '120px' }}
              onClick={() => {
                resetRegister();
                router.push(PATH.REGISTER.open);
              }}
            >
              レジ開け
            </PrimaryButton>
          )}
        </Stack>

        {/* レジ点検: レジ開けが完了している場合のみ表示 */}
        <Box width="100%" justifyContent="center" display="flex">
          <Stack gap={1}>
            {isRegisterOpened === true && (
              <SecondaryButton
                sx={{ width: '120px' }}
                onClick={() => {
                  router.push(PATH.REGISTER.check);
                }}
              >
                レジ点検
              </SecondaryButton>
            )}
            <SecondaryButton
              sx={{ width: '120px' }}
              onClick={() => router.push(PATH.REGISTER.checkHistory)}
            >
              レジ点検履歴
            </SecondaryButton>
          </Stack>
        </Box>
      </Stack>
    </Stack>
  );
};

export default DesktopSidebar;
