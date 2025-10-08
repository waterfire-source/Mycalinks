import { ItemSearchState } from '@/feature/item/hooks/useItemSearch';
import { ProductSearchState } from '@/feature/products/hooks/useNewProductSearch';
import { useGetSpecialty } from '@/feature/specialty/hooks/useGetSpecialty';
import {
  FormControl,
  Select,
  MenuItem,
  Typography,
  Theme,
  SxProps,
  InputLabel,
} from '@mui/material';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

type XOR<T, U> =
  | (T & { [K in keyof U]?: never })
  | (U & { [K in keyof T]?: never });

interface ItemSearchProps {
  setItemSearchState: Dispatch<SetStateAction<ItemSearchState>>;
  inputLabel?: string;
  sx?: SxProps<Theme>;
  disabled?: boolean;
}

interface ProductSearchProps {
  setProductSearchState: Dispatch<SetStateAction<ProductSearchState>>;
  inputLabel?: string;
  sx?: SxProps<Theme>;
  disabled?: boolean;
}

type Props = XOR<ItemSearchProps, ProductSearchProps>;

export const SpecialtySelectComponent = (props: Props) => {
  const inputLabel = props.inputLabel ?? '特殊状態';
  const sx = props.sx ?? {};
  const disabled = props.disabled ?? false;
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<null | number>(
    null,
  );

  useEffect(() => {
    if ('setItemSearchState' in props) {
      (props as ItemSearchProps).setItemSearchState((prev) => ({
        ...prev,
        specialty_id: selectedSpecialtyId,
      }));
    } else {
      (props as ProductSearchProps).setProductSearchState((prev) => ({
        ...prev,
        specialty_id: selectedSpecialtyId,
      }));
    }
  }, [selectedSpecialtyId]);

  const { specialties, fetchSpecialty } = useGetSpecialty();
  useEffect(() => {
    fetchSpecialty();
  }, []);

  const onChange = (newId: number) => {
    setSelectedSpecialtyId(newId);
  };

  return (
    <FormControl
      size="small"
      sx={{
        ...sx,
      }}
    >
      <InputLabel sx={{ color: 'text.primary' }}>{inputLabel}</InputLabel>
      <Select
        value={selectedSpecialtyId?.toString() ?? ''}
        disabled={disabled}
        label={inputLabel}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {/* "指定なし"オプション */}
        <MenuItem value="" sx={{ color: 'grey' }}>
          <Typography color="text.primary">指定なし</Typography>
        </MenuItem>

        {/* スペシャルティから選択肢を生成 */}
        {specialties.map((specialty) => (
          <MenuItem key={specialty.id} value={specialty.id}>
            {specialty.display_name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
