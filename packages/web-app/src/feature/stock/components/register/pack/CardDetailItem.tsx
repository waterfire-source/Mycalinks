import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import NoImg from '@/components/common/NoImg';
import { QuantityControlField } from '@/components/inputFields/QuantityControlField';
import { PackItem } from '@/feature/stock/components/register/pack/StockRegisterList'; // PackItem型をインポート

type Props = {
  cardData?: PackItem;
  quantity: number;
  max_quantity?: number; //最大数量
  onQuantityChange: (newQuantity: number) => void; // 数量変更時のコールバック
};

export const CardDetailItem = ({
  cardData,
  quantity,
  max_quantity,
  onQuantityChange,
}: Props) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 1,
        boxShadow: 3,
        borderRadius: '8px',
        bgcolor: 'background.paper',
        height: '100%',
      }}
    >
      {cardData ? (
        <Box
          sx={{
            width: '100%',
            aspectRatio: '0.71',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <Image
            src={cardData.image_url ?? ''}
            alt="Card Image"
            width={128}
            height={180}
            style={{ objectFit: 'contain' }}
            priority // 画像を高速に読み込む
          />
        </Box>
      ) : (
        <NoImg />
      )}
      <Typography sx={{ fontWeight: 'bold', marginTop: 0 }}>
        {cardData?.display_name}
      </Typography>
      <Typography sx={{ marginBottom: 1 }}>
        {`${cardData?.expansion ?? ''} ${cardData?.cardnumber ?? ''}`}
      </Typography>

      <QuantityControlField
        quantity={quantity}
        maxQuantity={max_quantity}
        onQuantityChange={onQuantityChange} // 親の数量変更処理を渡す
        textFieldProps={{
          sx: {
            '& .MuiInputBase-input': {
              color: quantity >= 1 ? 'red' : 'inherit',
            },
          },
        }}
      />
    </Box>
  );
};
