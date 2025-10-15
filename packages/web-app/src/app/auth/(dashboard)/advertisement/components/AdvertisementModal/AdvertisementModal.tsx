import { createClientAPI, CustomError } from '@/api/implement';
import { AdvertisementTableRowData } from '@/app/auth/(dashboard)/advertisement/components/AdvertisementContent';
import { AdvertisementModalContent } from '@/app/auth/(dashboard)/advertisement/components/AdvertisementModal/AdvertisementModalContent';
import {
  CustomModalWithIcon,
  MenuRenderFn,
} from '@/components/modals/CustomModalWithIcon';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import {
  createOrUpdateAdvertisement,
  useCreateOrUpdateAdvertisement,
} from '@/feature/advertisement/hooks/useCreateOrUpdateAppAdvertisement';
import { Menu, MenuItem } from '@mui/material';
import {
  App_Advertisement,
  App_Advertisement_Image,
  AppAdvertisementDataType,
  AppAdvertisementKind,
} from '@prisma/client';
import React, { useMemo, useState } from 'react';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import CropLandscapeOutlinedIcon from '@mui/icons-material/CropLandscapeOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';

interface Props {
  isOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  eventType?: AppAdvertisementKind;
  selectedRow: AdvertisementTableRowData | null;
  setSelectedRow?: React.Dispatch<
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
}

export const AdvertisementModal = ({
  isOpen,
  setIsModalOpen,
  eventType,
  selectedRow,
  setSelectedRow,
  fetchAdvertisement,
}: Props) => {
  const { store } = useStore();
  const { createOrUpdateAdvertisement } = useCreateOrUpdateAdvertisement();
  const [formData, setFormData] = useState<createOrUpdateAdvertisement>();
  const clientAPI = createClientAPI();
  const { setAlertState } = useAlert();
  const [loading, setLoading] = useState<boolean>(false);
  // モーダルを閉じる処理
  const handleClose = () => {
    if (setSelectedRow) {
      setSelectedRow(null);
    }
    setFormData(undefined);
    fetchAdvertisement();
    setIsModalOpen(false);
  };
  // 告知・案内の削除
  const handleDelete = async () => {
    if (!selectedRow) {
      console.error('selectedRow is undefined');
      return;
    }
    setLoading(true);
    const res = await clientAPI.advertisement.deleteAppAdvertisement({
      storeId: store.id,
      appAdvertisementId: selectedRow?.id,
    });
    if (res instanceof CustomError) {
      setAlertState({ message: res.message, severity: 'error' });
      setLoading(false);
      return;
    }
    setAlertState({ message: '削除しました', severity: 'success' });
    setLoading(false);
    handleClose();
  };
  //  モーダルのアクションボタンを押したときの処理
  const handleClick = async () => {
    if (!formData) return;
    setLoading(true);

    const newData: createOrUpdateAdvertisement = {
      ...formData,
      onPause: selectedRow?.status === 'PUBLISHED',
      asDraft: false,
    };

    try {
      await createOrUpdateAdvertisement(store.id, newData);
      handleClose();
    } catch (e) {
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  // 下書き処理
  const handleDraft = async () => {
    if (!formData) return;
    setLoading(true);

    const newData: createOrUpdateAdvertisement = {
      ...formData,
      asDraft: true,
    };

    try {
      await createOrUpdateAdvertisement(store.id, newData);
      handleClose();
    } catch (e) {
      handleClose();
    } finally {
      setLoading(false);
    }
  };
  // ボタン押下条件
  const isAbleToCreate = useMemo(() => {
    if (!formData) return false;
    return !!(
      formData.displayName &&
      formData.kind &&
      formData.startAt &&
      formData.dataType &&
      ((formData.dataType === AppAdvertisementDataType.TEXT &&
        formData.dataText) ||
        (formData.dataType === AppAdvertisementDataType.IMAGE &&
          formData.dataImages.length > 0))
    );
  }, [formData]);

  const cancelMenu: MenuRenderFn = ({ anchorEl, close }) => (
    <Menu
      anchorEl={anchorEl}
      open={!!anchorEl}
      onClose={close}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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
      <MenuItem onClick={handleDraft} disabled={!isAbleToCreate}>
        下書きとして保存
      </MenuItem>
      <MenuItem onClick={handleClose}>編集内容を破棄</MenuItem>
    </Menu>
  );

  return (
    <CustomModalWithIcon
      open={isOpen}
      onClose={handleClose}
      title={
        (eventType || selectedRow?.kind) === AppAdvertisementKind.PURCHASE_TABLE
          ? '買取表'
          : (eventType || selectedRow?.kind) === AppAdvertisementKind.EVENT
          ? 'イベント'
          : (eventType || selectedRow?.kind) ===
            AppAdvertisementKind.NOTIFICATION
          ? 'お知らせ'
          : 'チケット'
      }
      titleIcon={
        (eventType || selectedRow?.kind) ===
        AppAdvertisementKind.PURCHASE_TABLE ? (
          <AssignmentOutlinedIcon fontSize="small" />
        ) : (eventType || selectedRow?.kind) === AppAdvertisementKind.EVENT ? (
          <EmojiEventsOutlinedIcon fontSize="small" />
        ) : (eventType || selectedRow?.kind) ===
          AppAdvertisementKind.NOTIFICATION ? (
          <CampaignOutlinedIcon fontSize="small" />
        ) : (
          <CropLandscapeOutlinedIcon fontSize="small" />
        )
      }
      onActionButtonClick={handleClick}
      actionButtonText={
        selectedRow &&
        (selectedRow?.status === 'DRAFT' ||
          selectedRow?.status === 'UNPUBLISHED' ||
          selectedRow?.onPause)
          ? '公開開始'
          : selectedRow
          ? '公開停止'
          : eventType === AppAdvertisementKind.PURCHASE_TABLE
          ? '買取表作成'
          : eventType === AppAdvertisementKind.EVENT
          ? 'イベント作成'
          : eventType === AppAdvertisementKind.NOTIFICATION
          ? 'お知らせ作成'
          : 'チケット作成'
      }
      cancelButtonText={'キャンセル'}
      secondActionButtonText={selectedRow ? '削除' : undefined}
      onSecondActionButtonClick={handleDelete}
      loading={loading}
      primaryButtonDisabled={
        selectedRow?.onPause ||
        !isAbleToCreate ||
        selectedRow?.status === 'FINISHED'
      }
      isSecondActionButtonLoading={loading}
      width="80%"
      height={
        (eventType || selectedRow?.kind) ===
          AppAdvertisementKind.NOTIFICATION ||
        (eventType || selectedRow?.kind) === AppAdvertisementKind.TICKET
          ? '85%'
          : '70%'
      }
      cancelMenu={cancelMenu}
    >
      <AdvertisementModalContent
        eventType={eventType}
        setFormData={setFormData}
        selectedRow={selectedRow}
      />
    </CustomModalWithIcon>
  );
};
