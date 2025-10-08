import { AdvertisementAPI } from '@/api/frontend/advertisement/api';
import { AdvertisementTableRowData } from '@/app/auth/(dashboard)/advertisement/components/AdvertisementContent';
import { ColumnDef, CustomTable } from '@/components/tables/CustomTable';
import { useStore } from '@/contexts/StoreContext';
import { useCreateOrUpdateAdvertisement } from '@/feature/advertisement/hooks/useCreateOrUpdateAppAdvertisement';
import { Box, Menu, MenuItem, Typography } from '@mui/material';
import {
  $Enums,
  App_Advertisement,
  App_Advertisement_Image,
  AppAdvertisementStatus,
} from '@prisma/client';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';

interface Props {
  advertisementData?: AdvertisementAPI['getAppAdvertisement']['response'];
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedRow: AdvertisementTableRowData | null;
  setSelectedRow: React.Dispatch<
    React.SetStateAction<AdvertisementTableRowData | null>
  >;
  fetchAdvertisement: () => Promise<
    | {
        appAdvertisements: Array<
          App_Advertisement & {
            data_images: Array<App_Advertisement_Image>;
          }
        >;
      }
    | undefined
  >;
  setEventType: React.Dispatch<
    React.SetStateAction<$Enums.AppAdvertisementKind | undefined>
  >;
}

export const AdvertisementTable = ({
  advertisementData,
  setIsModalOpen,
  selectedRow,
  setSelectedRow,
  fetchAdvertisement,
  setEventType,
}: Props) => {
  const { store } = useStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const { createOrUpdateAdvertisement } = useCreateOrUpdateAdvertisement();

  //行をクリックしたときの処理
  const handleRowClick = (
    row: AdvertisementTableRowData,
    event?: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
  ) => {
    if (!event) return;
    setSelectedRow(row);
    setEventType(row.kind);
    setAnchorEl(event.currentTarget);
  };
  //メニューを閉じる処理
  const handleClose = () => {
    setAnchorEl(null);
  };
  //公開停止処理
  const handleStopClick = async () => {
    if (!selectedRow) return;
    const updatedRow = {
      ...selectedRow,
      onPause: true,
    };

    await createOrUpdateAdvertisement(store.id, updatedRow);
    fetchAdvertisement();
    handleClose();
  };

  const rows: AdvertisementTableRowData[] = useMemo(() => {
    const ads = advertisementData?.appAdvertisements ?? [];

    return ads.map<AdvertisementTableRowData>((element) => ({
      id: element.id,
      displayName: element.display_name,
      status: element.status,
      kind: element.kind,
      startAt: element.start_at ? new Date(element.start_at) : undefined,
      endAt: element.end_at ? new Date(element.end_at) : undefined,
      dataType: element.data_type,
      thumbnailImageUrl: element.thumbnail_image_url ?? undefined,
      dataText: element.data_text ?? undefined,
      dataImages: element.data_images.map((img) => ({
        imageUrl: img.image_url,
      })),
      onPause: element.on_pause,
    }));
  }, [advertisementData]);

  const columns: ColumnDef<AdvertisementTableRowData>[] = [
    {
      header: (
        <Typography textAlign="left" pl={3}>
          タイトル
        </Typography>
      ),
      render: (item) => (
        <Box textAlign="left" pl={3}>
          <Typography>{item.displayName}</Typography>
        </Box>
      ),
    },
    {
      header: <Typography textAlign="left">公開設定</Typography>,
      render: (item) => (
        <Box textAlign="left">
          <Typography
            sx={{
              color:
                item.status === AppAdvertisementStatus.PUBLISHED &&
                !item.onPause
                  ? 'primary.main' // MUI テーマのプライマリカラー
                  : item.status === AppAdvertisementStatus.UNPUBLISHED
                  ? 'secondary.main'
                  : 'black', // MUI テーマのセカンダリテキスト色
            }}
          >
            {item.onPause
              ? AdvertisementPublishStatusType.FINISHED
              : AdvertisementPublishStatusType[item.status]}
          </Typography>
        </Box>
      ),
    },
    {
      header: <Typography textAlign="left">種類</Typography>,
      render: (item) => (
        <Box textAlign="left">
          <Typography>{AdvertisementKindType[item.kind]}</Typography>
        </Box>
      ),
    },
    {
      header: <Typography textAlign="left">掲示開始</Typography>,
      render: (item) =>
        item.startAt ? (
          <Box textAlign="left">
            <Typography>{dayjs(item.startAt).format('YYYY/MM/DD')}</Typography>
            <Typography variant="caption">
              {dayjs(item.startAt).format('HH:mm:ss')}
            </Typography>
          </Box>
        ) : (
          ''
        ),
    },
    {
      header: <Typography textAlign="left">掲示終了</Typography>,
      render: (item) =>
        item.endAt ? (
          <Box textAlign="left">
            <Typography>{dayjs(item.endAt).format('YYYY/MM/DD')}</Typography>
            <Typography variant="caption">
              {dayjs(item.endAt).format('HH:mm:ss')}
            </Typography>
          </Box>
        ) : (
          ''
        ),
    },
    {
      header: <Typography textAlign="left">表示タイプ</Typography>,
      render: (item) => (
        <Box textAlign="left">
          <Typography>{AdvertisementDataType[item.dataType]}</Typography>
        </Box>
      ),
    },
  ];
  return (
    <>
      <CustomTable<AdvertisementTableRowData>
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        onRowClick={handleRowClick}
      />
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
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
        MenuListProps={{
          dense: true,
          sx: {
            padding: 0,
            '& .MuiMenuItem-root': {
              justifyContent: 'center',
              textAlign: 'center',
            },
            '& .MuiMenuItem-root:not(:last-of-type)': {
              borderBottom: `0.5px solid black`,
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (selectedRow) setIsModalOpen(true);
            handleClose();
          }}
        >
          詳細・編集
        </MenuItem>

        {selectedRow?.status ===
          (AppAdvertisementStatus.DRAFT || AppAdvertisementStatus.FINISHED) ||
        selectedRow?.onPause ? undefined : (
          <MenuItem
            onClick={() => {
              if (selectedRow) handleStopClick(); // 公開停止処理
              handleClose();
            }}
          >
            公開停止
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

const AdvertisementPublishStatusType = {
  PUBLISHED: '公開中',
  UNPUBLISHED: '未公開',
  DRAFT: '下書き',
  FINISHED: '公開終了/公開停止中',
} as const;
type AdvertisementPublishStatusType =
  (typeof AdvertisementPublishStatusType)[keyof typeof AdvertisementPublishStatusType];

const AdvertisementKindType = {
  PURCHASE_TABLE: '買取表',
  EVENT: 'イベント',
  NOTIFICATION: 'お知らせ',
  TICKET: 'クーポン',
} as const;
type AdvertisementKindType =
  (typeof AdvertisementKindType)[keyof typeof AdvertisementKindType];

const AdvertisementDataType = {
  IMAGE: '画像',
  TEXT: 'テキスト',
} as const;
type AdvertisementDataType =
  (typeof AdvertisementDataType)[keyof typeof AdvertisementDataType];
