import React, { ReactNode, useMemo } from 'react';
import { Box, Typography, SxProps, Theme, Stack } from '@mui/material';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { DetailCard } from '@/components/cards/DetailCard';

interface CommonCardProps {
  title: string;
  titleIcon?: ReactNode;
  titleAddition?: string;
  titleInfo?: ReactNode;
  children: JSX.Element;
  width?: number | string;
  height?: number | string;
  leftButtonText?: string;
  onLeftButtonClick?: () => Promise<void>;
  rightButtonText?: string;
  onRightButtonClick?: () => Promise<void>;
  loading?: boolean;
  sx?: SxProps<Theme>;
}

export const CommonCard: React.FC<CommonCardProps> = ({
  title,
  titleIcon,
  titleAddition = '',
  titleInfo,
  children,
  width = 'auto',
  height = 'auto',
  leftButtonText,
  onLeftButtonClick,
  rightButtonText,
  onRightButtonClick,
  loading = false,
  sx,
}) => {
  const HeaderContent = useMemo(
    () => (
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        {titleIcon && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1,
            }}
          >
            {titleIcon}
          </Box>
        )}
        <Typography variant="h1" sx={{ m: 0, color: 'common.black' }}>
          {title}
        </Typography>
        {titleAddition && (
          <Typography sx={{ pl: 1, color: 'red' }}>{titleAddition}</Typography>
        )}
        {titleInfo && <Box sx={{ ml: 'auto' }}>{titleInfo}</Box>}
      </Box>
    ),
    [title, titleIcon, titleAddition, titleInfo],
  );

  const FooterContent = useMemo(() => {
    if (!leftButtonText && !rightButtonText) return null;

    return (
      <Stack
        direction="row"
        gap={2}
        justifyContent="flex-end"
        alignItems="center"
        sx={{
          width: '100%',
        }}
      >
        {leftButtonText && onLeftButtonClick && (
          <PrimaryButton onClick={onLeftButtonClick} loading={loading}>
            {leftButtonText}
          </PrimaryButton>
        )}
        {rightButtonText && onRightButtonClick && (
          <PrimaryButton onClick={onRightButtonClick} loading={loading}>
            {rightButtonText}
          </PrimaryButton>
        )}
      </Stack>
    );
  }, [
    leftButtonText,
    onLeftButtonClick,
    rightButtonText,
    onRightButtonClick,
    loading,
  ]);

  return (
    <DetailCard
      title=""
      titleAction={HeaderContent}
      content={children}
      bottomContent={FooterContent || undefined}
      contentSx={{ width, height, ...sx }}
    />
  );
};
