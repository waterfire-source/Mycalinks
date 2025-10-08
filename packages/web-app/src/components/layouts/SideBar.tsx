'use client';

import { Dispatch, SetStateAction, useState } from 'react';
import {
  Box,
  useTheme,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
} from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import { PATH } from '@/constants/paths';
import {
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { useStore } from '@/contexts/StoreContext';
import { ConfirmationModal } from '@/components/modals/ConfirmationModal';
import DesktopSidebar from '@/components/layouts/DesktopSidebar';
import MobileSidebar from '@/components/layouts/MobileSidebar';
import { useConfirmationModal } from '@/contexts/ConfirmationModalContext'; // コンテキストのインポート

type Props = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export type MenuItemProps = {
  path: string;
  title: string;
  icon?: JSX.Element;
  showWhenClose: boolean;
  children?: MenuItemProps[];
};

export const Sidebar = ({ isOpen, setIsOpen }: Props) => {
  const { store } = useStore();
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isModalVisible } = useConfirmationModal(); // コンテキストから値を取得

  //確認モーダルの状態
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  const handleOpenCancelModal = (targetPath: string) => {
    setPendingPath(targetPath);
    setIsModalOpen(true);
  };

  const handleConfirmNavigation = () => {
    if (pendingPath) {
      router.push(pendingPath);
      setIsModalOpen(false);
    }
  };

  // PATHの後に数字/文字列が続く形式にマッチする正規表現
  const purchaseReceptionPattern = new RegExp(
    `^${PATH.PURCHASE_RECEPTION.root}/[^/]+/purchase$`,
  );
  const stockPattern = new RegExp(`^${PATH.STOCK.root}/\\d+$`);

  // 現在のページが下記の場合は確認モーダルを表示
  const pathConditions: ((path: string) => boolean)[] = [
    (path) => path.startsWith(PATH.SALE.root), // 販売
    (path) => path === PATH.PURCHASE, // 買取
    (path) => stockPattern.test(path), // 在庫詳細 (`/stock/{任意の数字}` でマッチ)
    (path) => purchaseReceptionPattern.test(path), // 買取査定 (任意の`TransactionID`でマッチ)
    (path) => path.startsWith(PATH.STOCK.bundle.register), // バンドル作成・編集
    (path) => path.startsWith(PATH.STOCK.set.register), // セット作成・編集
    (path) => path === PATH.STOCK.register.pack.root, // パック開封
    (path) => path.startsWith(PATH.STOCK.sale.register), // セール・キャンペーン
    (path) => path === PATH.STOCK.loss.register, // ロス登録
    (path) => path === PATH.ORIGINAL_PACK.create, // オリパ・福袋作成
    (path) => path === PATH.ORIGINAL_PACK.root, // オリパ・解体ページ
    (path) => path.startsWith(PATH.ORIGINAL_PACK.create), // オリパ・福袋補充
    (path) => path === PATH.PURCHASE_TABLE.root, // 買取表
    (path) => path.startsWith(PATH.ARRIVAL.register), // 発注登録
    (path) => path.startsWith(PATH.INVENTORY_COUNT.root), // 棚卸編集
    (path) => path === PATH.STOCK.consign.register, // 委託商品登録
  ];
  const shouldConfirmNavigation = (path: string): boolean => {
    return pathConditions.some((cond) => cond(path));
  };

  const handleMenuClick = (item: MenuItemProps) => {
    if (item.children) {
      setOpenMenus((prev) => ({ ...prev, [item.title]: !prev[item.title] }));
    } else if (isModalVisible && shouldConfirmNavigation(pathname)) {
      handleOpenCancelModal(item.path);
    } else {
      router.push(item.path);
    }
  };

  if (!isOpen) return null;

  const renderMenuItem = (item: MenuItemProps) => {
    // 子メニューを持つ項目やパスが空の項目はリンクにしない
    if (item.children || !item.path) {
      return (
        <ListItemButton
          key={item.title}
          onClick={() => handleMenuClick(item)}
          sx={{
            color:
              pathname === item.path
                ? theme.palette.primary.main
                : theme.palette.grey[700],
            pl: item.children ? 2 : 2,
            pr: 1,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Box display="flex" alignItems="center" flex="1">
            {item.icon ? (
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
            ) : (
              <Box sx={{ color: 'inherit', minWidth: 40 }} />
            )}
            <ListItemText
              primary={item.title}
              primaryTypographyProps={{
                variant: 'caption',
              }}
            />
          </Box>

          {item.children && (
            <Box>
              {openMenus[item.title] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>
          )}
        </ListItemButton>
      );
    }

    // パスがある項目はリンクとして扱う
    return (
      <ListItemButton
        component="a"
        href={item.path}
        role="link"
        aria-label={item.title}
        sx={{
          color:
            item.path.split('?')[0] === pathname
              ? theme.palette.primary.main
              : theme.palette.grey[700],
          pl: 2,
          pr: 1,
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          '&:focus-visible': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: '-2px',
          },
        }}
        onClick={(e) => {
          e.preventDefault();
          handleMenuClick(item);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleMenuClick(item);
          }
        }}
      >
        <Box display="flex" alignItems="center">
          {item.icon && (
            <ListItemIcon sx={{ color: 'inherit', minWidth: 32 }}>
              {item.icon}
            </ListItemIcon>
          )}
          <ListItemText
            primary={item.title}
            primaryTypographyProps={{
              variant: 'caption',
            }}
          />
        </Box>
      </ListItemButton>
    );
  };

  return (
    <>
      {isMobile ? (
        <MobileSidebar
          renderMenuItem={renderMenuItem}
          store={store}
          theme={theme}
          openMenus={openMenus}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
      ) : (
        <DesktopSidebar
          renderMenuItem={renderMenuItem}
          store={store}
          theme={theme}
          openMenus={openMenus}
        />
      )}
      <ConfirmationModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmNavigation}
        title="画面遷移の確認"
        description="入力された内容が破棄されますが、よろしいですか？"
        confirmButtonText="はい"
        cancelButtonText="キャンセル"
      />
    </>
  );
};
