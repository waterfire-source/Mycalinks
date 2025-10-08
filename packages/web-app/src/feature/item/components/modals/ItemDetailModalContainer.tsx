import React, { useEffect, useState } from 'react';
import { FormattedItem } from '@/components/dataGrid/RightClickDataGrid';
import { ItemDetailModal } from '@/feature/item/components/modals/ItemDetailModal';
import { useUpdateItem } from '@/feature/item/hooks/useUpdateItem';

interface Props {
  open: boolean;
  onClose: () => void;
  item: FormattedItem;
  selectedStoreID: number;
  refetchItemsAfterUpdate: (isPageSkip?: boolean) => Promise<void>;
}

export const ItemDetailModalContainer: React.FC<Props> = ({
  open,
  onClose,
  item,
  selectedStoreID,
  refetchItemsAfterUpdate,
}) => {
  const [itemData, setItemData] = useState<FormattedItem>(item);
  const { updateItem, isLoading } = useUpdateItem();

  useEffect(() => {
    setItemData(item);
  }, [item]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setItemData((prevData) => ({
      ...prevData,
      [name]: type === 'number' ? Number(value) : String(value),
    }));
  };

  const handleCheckBoxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setItemData((prevData) => ({
      ...prevData,
      [name]: checked,
    }));
  };

  const handleSubmitUpdateItem = async () => {
    const success = await updateItem(selectedStoreID, itemData);
    if (success) {
      refetchItemsAfterUpdate(true);
    }
  };

  const handleImageUploaded = (image_url: any) => {
    setItemData((prevData) => ({
      ...prevData,
      imageUrl: image_url,
    }));
  };

  return (
    <ItemDetailModal
      open={open}
      onClose={onClose}
      itemData={itemData}
      handleInputChange={handleInputChange}
      handleCheckBoxChange={handleCheckBoxChange}
      handleSubmitUpdateItem={handleSubmitUpdateItem}
      handleImageUploaded={handleImageUploaded}
      isLoading={isLoading}
    />
  );
};
