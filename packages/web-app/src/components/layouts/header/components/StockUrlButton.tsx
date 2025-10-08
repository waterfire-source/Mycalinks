import SecondaryButton from '@/components/buttons/SecondaryButton';
import CustomDialog from '@/components/dialogs/CustomDialog';
import { PATH } from '@/constants/paths';
import { useStore } from '@/contexts/StoreContext';
import { Typography, IconButton, SxProps, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useAlert } from '@/contexts/AlertContext';
import { QRCodeCanvas } from 'qrcode.react';
import { urlSafeBase64Encode } from '@/app/guest/[storeId]/stock/base64';
import { useEposDevice } from '@/contexts/EposDeviceContext';

interface Props {
  sx?: SxProps;
}
export const StockUrlButton = ({ sx }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const { serialCode } = useEposDevice();

  const [url, setUrl] = useState('');

  useEffect(() => {
    if (serialCode) {
      const params = {
        storeId: store.id,
        printerSerialNumber: serialCode,
      };

      const encodedParams = urlSafeBase64Encode(JSON.stringify(params));
      const thisUrl = `${process.env.NEXT_PUBLIC_ORIGIN}${PATH.GUEST_STOCK.root(
        encodedParams,
      )}`;
      setUrl(thisUrl);
    }
  }, [serialCode]);

  const handleCopyUrl = () => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setAlertState({
          message: 'URLがクリップボードにコピーされました',
          severity: 'success',
        });
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <>
      <SecondaryButton onClick={() => setIsOpen(true)} sx={sx}>
        在庫URL
      </SecondaryButton>
      <CustomDialog
        isOpen={isOpen}
        title="在庫検索URL発行"
        onClose={() => setIsOpen(false)}
      >
        <Stack direction="column" alignItems="center" gap={2}>
          <QRCodeCanvas value={url} />
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography
              variant="body1"
              sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '300px',
              }}
            >
              {url}
            </Typography>
            <IconButton onClick={handleCopyUrl} aria-label="copy">
              <ContentCopyIcon />
            </IconButton>
          </Stack>
        </Stack>
      </CustomDialog>
    </>
  );
};
