import NoImg from '@/components/common/NoImg';
import { Box, Tooltip, Zoom } from '@mui/material';
import Image from 'next/image';

interface Props {
  imageUrl: string | null;
  height?: number;
  fill?: boolean;
}
export const ItemImage = ({ imageUrl, height = 75, fill = false }: Props) => {
  const width = height * 0.71;

  // Check if imageUrl is null, empty, or not a valid URL
  const isValidUrl = (url: string | null): boolean => {
    if (!url) return false;
    try {
      // Check if it's a valid HTTP/HTTPS URL or starts with /
      return (
        url.startsWith('/') ||
        url.startsWith('http://') ||
        url.startsWith('https://')
      );
    } catch {
      return false;
    }
  };

  if (!isValidUrl(imageUrl)) {
    return <NoImg width={width} height={height} />;
  }
  return (
    <Tooltip
      title={
        <Box
          sx={{
            width: 142,
            aspectRatio: '0.71',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Image src={imageUrl!} alt="product" width={142} height={200} />
        </Box>
      }
      arrow
      TransitionComponent={Zoom}
      enterTouchDelay={0}
    >
      {fill ? (
        <Box
          sx={{
            position: 'relative',
            width,
            height,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Image
            src={imageUrl!}
            alt="product"
            fill
            style={{ objectFit: 'contain' }}
            sizes="100%"
          />
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          <Image src={imageUrl!} alt="product" width={width} height={height} />
        </Box>
      )}
    </Tooltip>
  );
};
