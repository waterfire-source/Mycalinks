import SecondaryButton from '@/components/buttons/SecondaryButton';
import { Box, Button, Popover, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import Image from 'next/image';
import theme from '@/theme';

interface Props {
  signatureURL: string | undefined | null;
}
export const OpenSignatureConfirmButton = ({ signatureURL }: Props) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  return (
    <>
      <SecondaryButton onClick={handlePopoverOpen}>署名</SecondaryButton>
      <Popover
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        sx={{
          p: 2,
          mt: 1,
        }}
      >
        <Stack width={250} height={320} p={2} gap={2}>
          <Typography color="primary.main">署名表示</Typography>
          {signatureURL ? (
            <Box
              border={`1px solid ${theme.palette.grey[500]}`}
              borderRadius={1}
              sx={{ transform: 'rotate(270deg)', px: 1 }}
            >
              <Image src={signatureURL} alt="署名" width={150} height={200} />
            </Box>
          ) : (
            <Typography width={200} height={150}>
              署名がありません。
            </Typography>
          )}
          <Button
            onClick={() => setAnchorEl(null)}
            color="primary"
            variant="text"
            sx={{ alignSelf: 'flex-end' }}
          >
            閉じる
          </Button>
        </Stack>
      </Popover>
    </>
  );
};
