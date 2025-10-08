import SecondaryButton from '@/components/buttons/SecondaryButton';
import { CustomInputDialog } from '@/components/dialogs/CustomInputDialog';
import { useCategory } from '@/feature/category/hooks/useCategory';

interface AddCategoryModalProps {
  isAddCategoryModalOpen: boolean;
  setIsAddCategoryModalOpen: (open: boolean) => void;
  onCategoryAdded: () => void;
}

export const AddCategoryModal = ({
  isAddCategoryModalOpen,
  setIsAddCategoryModalOpen,
  onCategoryAdded,
}: AddCategoryModalProps) => {
  const { createCategory } = useCategory();

  const handleAddCategory = async (categoryName: string) => {
    if (!categoryName.trim()) {
      return;
    }

    try {
      const response = await createCategory({
        displayName: categoryName.trim(),
        hidden: false,
      });

      if (response) {
        setIsAddCategoryModalOpen(false);
        onCategoryAdded();
      } else {
        throw new Error('カテゴリの追加に失敗しました');
      }
    } catch (err) {
      console.error('カテゴリ追加エラー:', err);
    }
  };

  const handleOpen = () => {
    setIsAddCategoryModalOpen(true);
  };

  const handleClose = () => {
    setIsAddCategoryModalOpen(false);
  };

  return (
    <>
      <SecondaryButton onClick={handleOpen}>カテゴリを追加</SecondaryButton>

      <CustomInputDialog
        open={isAddCategoryModalOpen}
        onClose={handleClose}
        onAddCustomName={handleAddCategory}
        title="カテゴリを追加"
        inputLabel="カテゴリ名"
        placeholder="カテゴリ名を入力"
        buttonText="カテゴリを追加"
      />
    </>
  );
};
