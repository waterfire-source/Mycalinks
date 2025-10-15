import { CategorySelectOnServer } from '@/feature/products/components/searchTable/CategorySelectOnServer';
import { ProductSortSelect } from '@/feature/products/components/searchTable/ProductSortSelect';

import { ProductSearchState } from '@/feature/products/hooks/useNewProductSearch';
import { SpecialtySelect } from '@/feature/specialty/components/SpecialtySelect';
import {
  Specialties,
  useGetSpecialty,
} from '@/feature/specialty/hooks/useGetSpecialty';
import { SelectChangeEvent, Stack } from '@mui/material';
import { useEffect, useState } from 'react';

interface Props {
  searchState: ProductSearchState;
  setSearchState: React.Dispatch<React.SetStateAction<ProductSearchState>>;
}

export const InventoryFilterBox = ({ setSearchState }: Props) => {
  const handleCategoryChange = (event: SelectChangeEvent<string | number>) => {
    setSearchState((prev) => ({
      ...prev,
      itemCategoryId:
        event.target.value === 'all' ? null : Number(event.target.value),
    }));
  };

  const { specialties, fetchSpecialty } = useGetSpecialty();
  useEffect(() => {
    fetchSpecialty();
  }, []);

  const [selectedSpecialty, setSelectedSpecialty] = useState<
    Specialties[0] | null
  >(null);
  useEffect(() => {
    setSearchState((prev) => ({
      ...prev,
      specialtyId: selectedSpecialty?.id ? selectedSpecialty.id : undefined,
    }));
  }, [selectedSpecialty]);

  const handleSpecialtyChange = (e: SelectChangeEvent) => {
    const target = specialties.find(
      (specialty) => specialty.id === Number(e.target.value),
    );

    if (target) setSelectedSpecialty(target);
    else setSelectedSpecialty(null);
  };

  return (
    <Stack
      direction="row"
      gap={1}
      alignItems="center"
      justifyContent="space-between"
      flexWrap="wrap"
      sx={{ my: 2 }}
    >
      <Stack
        direction="row"
        width="100%"
        gap={1}
        justifyContent="space-between"
      >
        <Stack flexDirection="row" gap={0.5}>
          {/* 商品カテゴリ */}
          <CategorySelectOnServer onSelect={handleCategoryChange} />
          {/* 特殊状態 */}
          <SpecialtySelect
            selectedSpecialtyId={selectedSpecialty?.id}
            onSelect={handleSpecialtyChange}
            specialties={specialties}
            sx={{ width: '120px' }}
          />
        </Stack>

        {/* 並び替え */}
        <ProductSortSelect setSearchState={setSearchState} />
      </Stack>
    </Stack>
  );
};
