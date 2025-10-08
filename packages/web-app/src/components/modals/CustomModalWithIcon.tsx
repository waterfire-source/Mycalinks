import {
  Modal,
  Box,
  Typography,
  Theme,
  SxProps,
  Stack,
  ModalProps,
} from '@mui/material';
import { FaTimes } from 'react-icons/fa';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { HelpIcon } from '@/components/common/HelpIcon';
import React, { useState } from 'react';

export type MenuRenderFn = (params: {
  anchorEl: HTMLElement | null;
  close: () => void;
}) => React.ReactNode;

interface CustomModalWithIconProps {
  open: boolean;
  onClose: () => void;
  handleBackdropClick?: (
    event: Record<string, unknown>,
    reason: 'backdropClick' | 'escapeKeyDown',
  ) => void;
  title: React.ReactNode;
  titleIcon?: React.ReactNode;
  titleAddition?: string;
  cancelCustomActionButton?: React.ReactNode;
  titleInfo?: React.ReactNode; // 追加情報
  helpArchivesNumber?: number; // ヘルプアイコンのアーカイブ番号
  children: React.ReactNode;
  width?: number | string;
  height?: number | string;
  sx?: SxProps<Theme>;
  closeButtonText?: string;
  onActionButtonClick?: () => void;
  actionButtonText?: string;
  actionButtonHelpArchivesNumber?: number;
  customActionButton?: React.ReactNode;
  secondCustomActionButton?: React.ReactNode;
  onSecondActionButtonClick?: () => void;
  secondActionButtonHelpArchivesNumber?: number;
  secondActionButtonText?: string;
  thirdActionButtonText?: string;
  onThirdActionButtonClick?: () => void;
  isSecondActionButtonLoading?: boolean;
  loading?: boolean;
  onCancelClick?: () => void;
  cancelButtonText?: string;
  isCancelButtonDisabled?: boolean;
  hideButtons?: boolean;
  isAble?: boolean;
  dataTestId?: string;
  closeButtonDataTestId?: string;
  type?: 'button' | 'submit';
  primaryButtonDisabled?: boolean;
  primaryMenu?: MenuRenderFn;
  secondaryMenu?: MenuRenderFn;
  cancelMenu?: MenuRenderFn;
}

export const CustomModalWithIcon = ({
  open,
  onClose,
  handleBackdropClick,
  title,
  titleIcon,
  titleAddition = '',
  titleInfo,
  helpArchivesNumber,
  children,
  width = 'auto',
  height = 'auto',
  sx,
  onActionButtonClick,
  actionButtonText,
  actionButtonHelpArchivesNumber,
  customActionButton,
  secondCustomActionButton,
  onSecondActionButtonClick,
  secondActionButtonHelpArchivesNumber,
  secondActionButtonText,
  thirdActionButtonText,
  onThirdActionButtonClick,
  onCancelClick,
  cancelButtonText = '入力内容を破棄する',
  isCancelButtonDisabled = false,
  loading = false,
  isSecondActionButtonLoading = false,
  hideButtons = false,
  isAble = true, // デフォルトは押下可能
  dataTestId,
  closeButtonDataTestId,
  type = 'button',
  primaryButtonDisabled = false,
  primaryMenu,
  secondaryMenu,
  cancelMenu,
  cancelCustomActionButton,
}: CustomModalWithIconProps) => {
  // メニューの状態管理
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [currentMenuFn, setCurrentMenuFn] = useState<MenuRenderFn | null>(null);

  const handleInternalClose: ModalProps['onClose'] = (event, reason) => {
    if (anchorEl) {
      closeMenu();
      return;
    }
    if (reason === 'backdropClick' && handleBackdropClick) {
      handleBackdropClick(event, reason);
      return;
    }
    closeMenu();
    onClose();
  };

  const closeMenu = () => {
    setAnchorEl(null);
    setCurrentMenuFn(null);
  };

  const openMenu =
    (menuFn: MenuRenderFn | undefined) =>
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!menuFn) return;
      setAnchorEl(e.currentTarget);
      setCurrentMenuFn(() => menuFn);
    };
  return (
    <Modal open={open} onClose={handleInternalClose} data-testid={dataTestId}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: width,
          height: height,
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          ...sx,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px',
            backgroundColor: 'common.white',
            borderRadius: '4px 4px 0 0',
            color: 'common.black',
            borderBottom: '1px solid',
            borderColor: 'divider',
            position: 'relative',
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          {titleIcon && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginX: '10px',
                fontSize: '3rem',
              }}
            >
              {titleIcon}
            </Box>
          )}
          <Typography
            variant="h1"
            sx={{
              marginLeft: titleIcon ? '0px' : '0',
              color: 'common.black',
              textAlign: 'left',
            }}
          >
            {title}
          </Typography>
          {helpArchivesNumber && (
            <HelpIcon helpArchivesNumber={helpArchivesNumber} />
          )}
          <Typography sx={{ pl: 1, color: 'red' }}>{titleAddition}</Typography>
          {titleInfo}

          <FaTimes
            size={20}
            onClick={anchorEl ? closeMenu : onClose}
            style={{
              position: 'absolute',
              right: '10px',
              color: 'black',
              backgroundColor: 'white',
              cursor: 'pointer',
              borderRadius: '50%',
              padding: '5px',
            }}
            data-testid={closeButtonDataTestId}
          />
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            p: 2,
            overflowY: 'auto',
            backgroundColor: 'grey.100',
          }}
        >
          {children}
        </Box>

        {!hideButtons && (
          <Stack
            flexDirection="row"
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 20px',
              borderTop: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
              gap: '16px',
              borderRadius: '0 0 4px 4px',
              boxShadow: '0px -2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            {anchorEl && currentMenuFn?.({ anchorEl, close: closeMenu })}
            <Box display="flex" gap={2}>
              {secondActionButtonText && (
                <SecondaryButton
                  onClick={
                    secondaryMenu
                      ? openMenu(secondaryMenu)
                      : isAble
                      ? onSecondActionButtonClick
                      : undefined
                  }
                  disabled={!isAble || isSecondActionButtonLoading}
                  loading={isSecondActionButtonLoading}
                >
                  {secondActionButtonText}
                </SecondaryButton>
              )}
              {secondActionButtonText &&
                secondActionButtonHelpArchivesNumber && (
                  <HelpIcon
                    helpArchivesNumber={secondActionButtonHelpArchivesNumber}
                  />
                )}
              {secondCustomActionButton}
            </Box>
            <Stack flexDirection="row">
              {cancelCustomActionButton}
              <PrimaryButton
                variant="text"
                color="error"
                onClick={
                  cancelMenu ? openMenu(cancelMenu) : onCancelClick || onClose
                }
                sx={{
                  fontSize: '12px',
                  marginRight: '10px',
                }}
                disabled={isCancelButtonDisabled}
              >
                {cancelButtonText}
              </PrimaryButton>

              {/* 独自価格をリセットするときに使用 */}
              {thirdActionButtonText && (
                <PrimaryButton
                  onClick={isAble ? onThirdActionButtonClick : undefined}
                  sx={{
                    fontSize: '12px',
                    position: 'relative',
                    marginRight: '10px',
                    backgroundColor: !isAble ? 'grey.500' : undefined,
                    '&:hover': {
                      backgroundColor: !isAble ? 'grey.500' : undefined,
                    },
                  }}
                >
                  {thirdActionButtonText}
                </PrimaryButton>
              )}
              {actionButtonHelpArchivesNumber && (
                <HelpIcon helpArchivesNumber={actionButtonHelpArchivesNumber} />
              )}
              {actionButtonText && (
                <PrimaryButton
                  color={isAble ? 'primary' : 'inherit'}
                  onClick={
                    primaryMenu
                      ? openMenu(primaryMenu)
                      : isAble
                      ? onActionButtonClick
                      : undefined
                  }
                  disabled={!isAble || loading || primaryButtonDisabled}
                  loading={loading}
                  type={type}
                  sx={{
                    fontSize: '12px',
                    position: 'relative',
                    backgroundColor: !isAble ? 'grey.500' : undefined,
                    '&:hover': {
                      backgroundColor: !isAble ? 'grey.500' : undefined,
                    },
                  }}
                >
                  {actionButtonText}
                </PrimaryButton>
              )}
              {customActionButton}
            </Stack>
          </Stack>
        )}
      </Box>
    </Modal>
  );
};
