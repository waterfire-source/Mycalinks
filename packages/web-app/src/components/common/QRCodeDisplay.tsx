import { QRCodeSVG } from 'qrcode.react';
import { Box } from '@mui/material';

/**
 * QRコードを表示するコンポーネント
 */
interface Props {
  url: string; // QRコードに埋め込むURL
  size?: number; // QRコードのサイズ(px)。デフォルトは200px
}

export const QRCodeDisplay = ({ url, size = 200 }: Props) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
        backgroundColor: 'white', // QRコードの背景を白に設定
      }}
    >
      <QRCodeSVG
        value={url} // QRコードに埋め込むURL
        size={size} // QRコードのサイズ
        level="M" // QRコードの誤り訂正レベル (L: 7%, M: 15%, Q: 25%, H: 30%)
        includeMargin={true} // QRコードの周りにマージンを付ける
      />
    </Box>
  );
};
