import { useListArrivalPrice } from '@/feature/products/hooks/useLIstArrivalPrice';
import { MenuItem, Typography } from '@mui/material';
import { Select } from '@mui/material';
import { FormControl } from '@mui/material';
import { useEffect } from 'react';

interface Props {
  productID: number;
  itemCount: number;
  setArrivalPrice: (price: number | undefined) => void;
}

export const ProductArrivalPriceSelect: React.FC<Props> = ({
  productID,
  itemCount,
  setArrivalPrice,
}: Props) => {
  const { arrivalPrices, fetchArrivalPrices } = useListArrivalPrice();
  useEffect(() => {
    fetchArrivalPrices(productID, itemCount);
  }, [fetchArrivalPrices, productID, itemCount]);

  return (
    <FormControl fullWidth>
      <Select
        size="small"
        displayEmpty
        renderValue={(value) =>
          value === undefined ? '指定なし' : `¥${value?.toLocaleString()}`
        }
        onChange={(event) => {
          const value = event.target.value as number | undefined;
          setArrivalPrice(value);
        }}
      >
        <MenuItem value={undefined} sx={{ color: 'grey' }}>
          <Typography color="text.primary">指定なし</Typography>
        </MenuItem>
        {arrivalPrices?.map((price) => (
          <MenuItem key={price} value={price}>
            {`¥${price.toLocaleString()}`}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
