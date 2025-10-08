import { AdvertisementModal } from '@/app/auth/(dashboard)/advertisement/components/AdvertisementModal/AdvertisementModal';
import { AdvertisementTable } from '@/app/auth/(dashboard)/advertisement/components/AdvertisementTable';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { CustomTab, TabDef } from '@/components/tabs/CustomTab';
import { useStore } from '@/contexts/StoreContext';
import { useAdvertisement } from '@/feature/advertisement/hooks/useAdvertisement';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import CropLandscapeOutlinedIcon from '@mui/icons-material/CropLandscapeOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';

import {
  Box,
  FormControl,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
} from '@mui/material';
import {
  AppAdvertisementDataType,
  AppAdvertisementKind,
  AppAdvertisementStatus,
} from '@prisma/client';
import { useEffect, useState } from 'react';

export interface AdvertisementTableRowData {
  id: number;
  displayName: string;
  status: AppAdvertisementStatus;
  onPause: boolean;
  kind: AppAdvertisementKind;
  startAt?: Date;
  endAt?: Date;
  dataType: AppAdvertisementDataType;
  thumbnailImageUrl?: string;
  dataText?: string;
  dataImages: { imageUrl: string }[];
}

export const AdvertisementContent = () => {
  const { store } = useStore();
  const { results, searchState, fetchAdvertisement, setSearchState } =
    useAdvertisement(store.id);
  useEffect(() => {
    fetchAdvertisement();
  }, [fetchAdvertisement]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [eventType, setEventType] = useState<AppAdvertisementKind | undefined>(
    undefined,
  );
  const [selectedRow, setSelectedRow] =
    useState<AdvertisementTableRowData | null>(null);

  // メニュー展開処理
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setSelectedRow(null);
    setAnchorEl(event.currentTarget);
  };
  // メニューを閉じる処理
  const handleClose = () => {
    setAnchorEl(null);
  };
  // メニューが選択されたときの処理
  const handleSelect = (type: string) => {
    // type によって遷移などを処理する
    setEventType(type as AppAdvertisementKind);
    setIsOpenModal(true); // モーダルを開く
    handleClose();
  };
  // タブ処理
  const tabDefs: TabDef[] = [
    { key: 'all', value: 'すべて' },
    { key: AppAdvertisementKind.PURCHASE_TABLE, value: '買取表' },
    { key: AppAdvertisementKind.EVENT, value: 'イベント' },
    { key: AppAdvertisementKind.NOTIFICATION, value: 'お知らせ' },
    { key: AppAdvertisementKind.TICKET, value: 'クーポン' },
  ];
  const isValidOrderBy = (value: string): value is AppAdvertisementStatus => {
    const values = Object.values(AppAdvertisementStatus);
    return values.includes(value as AppAdvertisementStatus);
  };
  // タブが選択されたときの処理
  const handlePublishStatusChange = (event: SelectChangeEvent<string>) => {
    setSearchState((prev) => ({
      ...prev,
      virtualStatus:
        event.target.value === 'not'
          ? undefined
          : isValidOrderBy(event.target.value)
          ? (event.target.value as AppAdvertisementStatus)
          : undefined,
    }));
  };
  return (
    <ContainerLayout
      title="告知・案内"
      actions={
        <>
          <PrimaryButtonWithIcon
            icon={<AddCircleOutlineIcon />}
            onClick={handleClick}
            sx={{ marginLeft: 5 }}
          >
            新規告知・案内作成
          </PrimaryButtonWithIcon>
          <Menu
            anchorEl={anchorEl}
            open={isMenuOpen}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{
              paper: {
                elevation: 3,
                sx: {
                  minWidth: 150,
                  border: `0.5px solid black`,
                  borderRadius: 2,
                  overflow: 'hidden',
                },
              },
            }}
          >
            <MenuItem
              onClick={() => handleSelect(AppAdvertisementKind.PURCHASE_TABLE)}
              sx={{ width: 120 }}
            >
              <AssignmentOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> 買取表
            </MenuItem>
            <MenuItem onClick={() => handleSelect(AppAdvertisementKind.EVENT)}>
              <EmojiEventsOutlinedIcon fontSize="small" sx={{ mr: 1 }} />{' '}
              イベント
            </MenuItem>
            <MenuItem
              onClick={() => handleSelect(AppAdvertisementKind.NOTIFICATION)}
            >
              <CampaignOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> お知らせ
            </MenuItem>
            <MenuItem onClick={() => handleSelect(AppAdvertisementKind.TICKET)}>
              <CropLandscapeOutlinedIcon fontSize="small" sx={{ mr: 1 }} />{' '}
              チケット
            </MenuItem>
          </Menu>
        </>
      }
    >
      <Stack
        sx={{
          backgroundColor: 'white',
          flex: 1,
          overflow: 'scroll',
        }}
      >
        {/* タブ */}
        <CustomTab
          tabs={tabDefs}
          content={
            <>
              {/* 並び替え */}
              <Box
                display="flex"
                alignItems="center"
                sx={{ m: 1 }}
                gap={2}
                justifyContent="flex-start"
              >
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel sx={{ color: 'black' }}>公開設定</InputLabel>
                  <Select
                    value={
                      searchState.virtualStatus !== undefined
                        ? String(searchState.virtualStatus)
                        : 'all'
                    }
                    onChange={handlePublishStatusChange}
                    label="公開設定"
                  >
                    <MenuItem value="all">すべて</MenuItem>
                    <MenuItem value={AppAdvertisementStatus.PUBLISHED}>
                      公開中
                    </MenuItem>
                    <MenuItem value={AppAdvertisementStatus.UNPUBLISHED}>
                      未公開
                    </MenuItem>
                    <MenuItem value={AppAdvertisementStatus.DRAFT}>
                      下書き
                    </MenuItem>
                    <MenuItem value={AppAdvertisementStatus.FINISHED}>
                      公開終了/公開停止中
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>
              {/* テーブル */}
              <AdvertisementTable
                advertisementData={results}
                setIsModalOpen={setIsOpenModal}
                selectedRow={selectedRow}
                setSelectedRow={setSelectedRow}
                fetchAdvertisement={fetchAdvertisement}
                setEventType={setEventType}
              />
              {/* モーダル */}
              <AdvertisementModal
                isOpen={isOpenModal}
                setIsModalOpen={setIsOpenModal}
                eventType={eventType}
                selectedRow={selectedRow}
                setSelectedRow={setSelectedRow}
                fetchAdvertisement={fetchAdvertisement}
              />
            </>
          }
          onTabChange={(value) =>
            setSearchState((prev) => ({
              ...prev,
              kind:
                value === 'all' ? undefined : (value as AppAdvertisementKind),
            }))
          }
        />
      </Stack>
    </ContainerLayout>
  );
};
