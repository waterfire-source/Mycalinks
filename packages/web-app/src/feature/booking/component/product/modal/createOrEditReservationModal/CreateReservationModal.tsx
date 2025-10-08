import { useEffect } from 'react';
import { useGetItem } from '@/feature/item/hooks/useGetItem';
import { ItemAPIRes } from '@/api/frontend/item/api';
import { Box } from '@mui/material';
import { FormErrors, ReservationsFormState } from '@/feature/booking';
import { CreateOrEditReservationModalForm } from '@/feature/booking/component/product/modal/createOrEditReservationModal/CreateOrEditReservationModalForm';
import { CreateReservationTable } from '@/feature/booking/component/product/modal/createOrEditReservationModal/CreateReservationTable';

interface Props {
  targetItemId: number | null;
  targetItem?: ItemAPIRes['get']['items'][0];
  setTargetItem: React.Dispatch<
    React.SetStateAction<ItemAPIRes['get']['items'][0] | undefined>
  >;
  targetProduct?: ItemAPIRes['get']['items'][0]['products'][0];
  setTargetProduct?: React.Dispatch<
    React.SetStateAction<
      ItemAPIRes['get']['items'][0]['products'][0] | undefined
    >
  >;
  formData: ReservationsFormState;
  setFormData: React.Dispatch<React.SetStateAction<ReservationsFormState>>;
  errors: FormErrors;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
  isCreate?: boolean;
}

export const CreateReservationModal = ({
  targetItemId,
  targetItem,
  setTargetItem,
  targetProduct,
  setTargetProduct,
  formData,
  setFormData,
  errors,
  setErrors,
}: Props) => {
  const { fetchItem, isLoading } = useGetItem();

  useEffect(() => {
    if (!targetItemId) return;
    const fetch = async () => {
      const res = await fetchItem(targetItemId);
      if (res) {
        const brandNewProduct = res.products.find(
          (product) => product.condition_option_display_name === '新品',
        );
        setTargetProduct?.(brandNewProduct);
        setTargetItem(res);
      }
    };

    fetch();
  }, [fetchItem, setTargetItem, setTargetProduct, targetItemId]);

  return (
    <>
      <CreateReservationTable
        targetItem={targetItem}
        targetProduct={targetProduct}
        isLoading={isLoading}
        formData={formData}
        setFormData={setFormData}
      />
      <Box
        ml={8}
        my="auto"
        display="flex"
        height="calc(100% - 170px)"
        alignItems="center"
      >
        <CreateOrEditReservationModalForm
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          setErrors={setErrors}
        />
      </Box>
    </>
  );
};
