import React, { useState, useEffect } from 'react';
import {
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  Paper,
  Box,
  CircularProgress,
} from '@mui/material';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { styled } from '@mui/material/styles';
import { CustomTab, TabDef } from '@/components/tabs/CustomTab';
import { Item_Category, Item_Genre } from '@prisma/client';
import { useGenre } from '@/feature/genre/hooks/useGenre';
import { useCategory } from '@/feature/category/hooks/useCategory';
import { CannotDeleteGenreDialog } from '@/app/auth/(dashboard)/settings/genre-and-category/components/CannotDeleteGenreDialog';
import { DeleteGenreDialog } from '@/app/auth/(dashboard)/settings/genre-and-category/components/dialog/DeleteGenreDialog';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import { GenreDndTable } from '@/app/auth/(dashboard)/settings/genre-and-category/components/GenreDndTable';
import { useAlert } from '@/contexts/AlertContext';

const CustomTableCell = styled(TableCell)(() => ({
  color: 'gray',
  whiteSpace: 'nowrap',
  backgroundColor: 'white',
}));

interface UIGenre extends Item_Genre {
  displayNameInput: string;
  isUpdating?: boolean;
  order: number;
}

interface UICategory extends Item_Category {
  displayNameInput: string;
  isUpdating?: boolean;
  order: number;
}

interface GenreCategoryTabTableProps {
  onTabChange?: (tabKey: string) => void;
  refreshTrigger?: number;
}

export const GenreCategoryTabTable: React.FC<GenreCategoryTabTableProps> = ({
  onTabChange,
  refreshTrigger = 0,
}) => {
  const { fetchGenreList, updateGenre } = useGenre(true);
  const { fetchCategoryList, updateCategory, deleteCategory } =
    useCategory(true);
  const { setAlertState } = useAlert();
  const [selectedTab, setSelectedTab] = useState<string>('genre');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hideDialogOpen, setHideDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cannotDeleteDialogOpen, setCannotDeleteDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [selectedItemName, setSelectedItemName] = useState('');

  const tabs: TabDef[] = [
    { key: 'genre', value: 'ジャンル' },
    { key: 'category', value: 'カテゴリ' },
  ];

  const [genres, setGenres] = useState<UIGenre[]>([]);
  const [categories, setCategories] = useState<UICategory[]>([]);
  const [hasUnsavedOrderChanges, setHasUnsavedOrderChanges] = useState(false);
  const [isApplyingChanges, setIsApplyingChanges] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsInitialLoading(true);

      try {
        const genreList = await fetchGenreList();
        if (genreList && genreList.itemGenres) {
          const convertedGenres = genreList.itemGenres
            .filter((genre) => !genre.deleted)
            .sort((a, b) => a.order_number - b.order_number)
            .map((genre) => ({
              ...genre,
              displayNameInput: genre.display_name,
              isUpdating: false,
              order: genre.order_number,
            }));
          setGenres(convertedGenres);
        }

        const categoryList = await fetchCategoryList();
        if (categoryList && categoryList?.itemCategories) {
          const convertedCategories = categoryList.itemCategories
            .sort((a, b) => a.order_number - b.order_number)
            .map((cat) => ({
              ...cat,
              displayNameInput: cat.display_name,
              isUpdating: false,
              order: cat.order_number,
            }));
          setCategories(convertedCategories);
        }
      } catch (err) {
        console.error('データ取得エラー:', err);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchInitialData();
  }, [fetchGenreList, fetchCategoryList, refreshTrigger]);

  const handleTabChange = (newValue: string) => {
    setSelectedTab(newValue);
    setHasUnsavedOrderChanges(false); // タブ変更時にリセット
    if (onTabChange) {
      onTabChange(newValue);
    }
  };

  const handleGenreNameChange = (id: number, value: string) => {
    setGenres(
      genres.map((genre) =>
        genre.id === id ? { ...genre, displayNameInput: value } : genre,
      ),
    );
  };

  const handleCategoryNameInputChange = (id: number, value: string) => {
    setCategories(
      categories.map((category) =>
        category.id === id
          ? { ...category, displayNameInput: value }
          : category,
      ),
    );
  };

  const handleDisplayToggleConfirm = (id: number) => {
    const item =
      selectedTab === 'genre'
        ? genres.find((genre) => genre.id === id)
        : categories.find((category) => category.id === id);

    if (!item) return;

    const isCurrentlyDisplayed =
      selectedTab === 'genre'
        ? !(item as UIGenre).hidden
        : !(item as UICategory).hidden;

    if (isCurrentlyDisplayed) {
      setSelectedItemId(id);
      setHideDialogOpen(true);
    } else {
      handleDisplayToggle(id);
    }
  };

  const handleDisplayToggle = async (id: number) => {
    if (selectedTab === 'genre') {
      const genre = genres.find((genre) => genre.id === id);
      if (!genre) return;

      setGenres(
        genres.map((genre) =>
          genre.id === id ? { ...genre, isUpdating: true } : genre,
        ),
      );

      try {
        await updateGenre({
          itemGenreId: id,
          hidden: !genre.hidden,
          order: genre.order,
        });

        setGenres(
          genres.map((genre) =>
            genre.id === id
              ? { ...genre, hidden: !genre.hidden, isUpdating: false }
              : genre,
          ),
        );
      } catch (err) {
        console.error('ジャンル表示状態更新エラー:', err);
        setGenres(
          genres.map((genre) =>
            genre.id === id ? { ...genre, isUpdating: false } : genre,
          ),
        );
      }
    } else {
      const category = categories.find((category) => category.id === id);
      if (!category) return;

      setCategories(
        categories.map((cat) =>
          cat.id === id ? { ...cat, isUpdating: true } : cat,
        ),
      );

      try {
        await updateCategory({
          id: id,
          displayName: category.display_name,
          hidden: !category.hidden,
          orderNumber: category.order,
        });

        setCategories(
          categories.map((cat) =>
            cat.id === id
              ? { ...cat, hidden: !cat.hidden, isUpdating: false }
              : cat,
          ),
        );
      } catch (err) {
        console.error('カテゴリ表示状態更新エラー:', err);
        setCategories(
          categories.map((cat) =>
            cat.id === id ? { ...cat, isUpdating: false } : cat,
          ),
        );
      }
    }
  };

  const handleGenreSave = async (id: number) => {
    const genre = genres.find((genre) => genre.id === id);
    if (
      !genre ||
      !genre.displayNameInput ||
      genre.display_name === genre.displayNameInput
    )
      return;

    setGenres(
      genres.map((genre) =>
        genre.id === id ? { ...genre, isUpdating: true } : genre,
      ),
    );

    try {
      await updateGenre({
        itemGenreId: id,
        displayName: genre.displayNameInput,
        order: genre.order,
      });

      setGenres(
        genres.map((genre) => {
          if (genre.id === id) {
            return {
              ...genre,
              display_name: genre.displayNameInput,
              isUpdating: false,
            };
          }
          return genre;
        }),
      );
    } catch (err) {
      console.error('ジャンル更新エラー:', err);
      setGenres(
        genres.map((genre) =>
          genre.id === id ? { ...genre, isUpdating: false } : genre,
        ),
      );
    }
  };

  const handleCategorySave = async (id: number) => {
    const category = categories.find((category) => category.id === id);
    if (
      !category ||
      !category.displayNameInput ||
      category.display_name === category.displayNameInput
    )
      return;

    setCategories(
      categories.map((cat) =>
        cat.id === id ? { ...cat, isUpdating: true } : cat,
      ),
    );

    try {
      await updateCategory({
        id: id,
        displayName: category.displayNameInput,
        orderNumber: category.order,
      });

      setCategories(
        categories.map((cat) => {
          if (cat.id === id) {
            return {
              ...cat,
              display_name: cat.displayNameInput,
              isUpdating: false,
            };
          }
          return cat;
        }),
      );
    } catch (err) {
      console.error('カテゴリ更新エラー:', err);
      setCategories(
        categories.map((cat) =>
          cat.id === id ? { ...cat, isUpdating: false } : cat,
        ),
      );
    }
  };

  const handleDeleteConfirm = (id: number) => {
    if (selectedTab === 'genre') {
      const genre = genres.find((genre) => genre.id === id);
      if (!genre) return;

      const isSystemGenre =
        genre.handle !== null &&
        genre.handle !== undefined &&
        genre.handle !== '';

      if (isSystemGenre) {
        setCannotDeleteDialogOpen(true);
      } else {
        setSelectedItemId(id);
        setSelectedItemName(genre.display_name);
        setDeleteDialogOpen(true);
      }
    } else {
      const category = categories.find((category) => category.id === id);
      if (!category) return;

      setSelectedItemId(id);
      setSelectedItemName(category.display_name);
      setDeleteDialogOpen(true);
    }
  };

  const handleGenreDelete = async (id: number) => {
    setGenres(
      genres.map((genre) =>
        genre.id === id ? { ...genre, isUpdating: true } : genre,
      ),
    );

    try {
      await updateGenre({
        itemGenreId: id,
        deleted: true,
      });

      setGenres(genres.filter((genre) => genre.id !== id));
    } catch (err) {
      console.error('ジャンル削除エラー:', err);
      setGenres(
        genres.map((genre) =>
          genre.id === id ? { ...genre, isUpdating: false } : genre,
        ),
      );

      if (
        err instanceof Error &&
        err.message.includes('自動生成部門は削除できません')
      ) {
        setCannotDeleteDialogOpen(true);
      }
    }
  };

  const handleCategoryDelete = async (id: number) => {
    setCategories(
      categories.map((cat) =>
        cat.id === id ? { ...cat, isUpdating: true } : cat,
      ),
    );

    try {
      const res = await deleteCategory(id);
      if (res) {
        setCategories(categories.filter((category) => category.id !== id));
      } else {
        setCategories(
          categories.map((cat) =>
            cat.id === id ? { ...cat, isUpdating: false } : cat,
          ),
        );
      }
    } catch (err) {
      console.error('カテゴリ削除エラー:', err);
      setCategories(
        categories.map((cat) =>
          cat.id === id ? { ...cat, isUpdating: false } : cat,
        ),
      );
    }
  };

  const handleNameChange = (id: number, value: string) => {
    if (selectedTab === 'genre') {
      handleGenreNameChange(id, value);
    } else {
      handleCategoryNameInputChange(id, value);
    }
  };

  const handleConfirmHide = () => {
    if (selectedItemId !== null) {
      handleDisplayToggle(selectedItemId);
      setHideDialogOpen(false);
      setSelectedItemId(null);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedItemId !== null) {
      if (selectedTab === 'genre') {
        handleGenreDelete(selectedItemId);
      } else {
        handleCategoryDelete(selectedItemId);
      }
      setDeleteDialogOpen(false);
      setSelectedItemId(null);
    }
  };

  const handleDelete = (id: number) => {
    handleDeleteConfirm(id);
  };

  const handleGenreOrderChange = async (newRows: UIGenre[]) => {
    setGenres(newRows);
    setHasUnsavedOrderChanges(true);
  };

  const handleCategoryOrderChange = async (newRows: UICategory[]) => {
    setCategories(newRows);
    setHasUnsavedOrderChanges(true);
  };

  const applyGenreOrderChanges = async () => {
    for (let i = 0; i < genres.length; i++) {
      const genre = genres[i];
      try {
        await updateGenre({
          itemGenreId: genre.id,
          order: i + 1,
          displayName: genre.display_name,
          hidden: genre.hidden,
        });
      } catch (err) {
        setAlertState({
          message: 'ジャンルの更新に失敗しました',
          severity: 'error',
        });
      }
    }
  };

  const applyCategoryOrderChanges = async () => {
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      try {
        await updateCategory({
          id: category.id,
          displayName: category.display_name,
          hidden: category.hidden,
          orderNumber: i + 1,
        });
      } catch (err) {
        setAlertState({
          message: 'カテゴリの更新に失敗しました',
          severity: 'error',
        });
      }
    }
  };

  const applyOrderChanges = async () => {
    setIsApplyingChanges(true);
    try {
      if (selectedTab === 'genre') {
        await applyGenreOrderChanges();
      } else {
        await applyCategoryOrderChanges();
      }
      setHasUnsavedOrderChanges(false);
    } catch (error) {
      console.error('順序変更の適用エラー:', error);
    } finally {
      setIsApplyingChanges(false);
    }
  };

  const renderGenreRows = () => {
    return (
      <GenreDndTable<UIGenre>
        genres={genres}
        isLoading={isInitialLoading}
        onRowOrderChange={handleGenreOrderChange}
        onNameChange={handleNameChange}
        onSave={handleGenreSave}
        onToggleDisplay={handleDisplayToggleConfirm}
        onDelete={handleDelete}
      />
    );
  };

  const renderCategoryRows = () => {
    return (
      <GenreDndTable<UICategory>
        genres={categories}
        isLoading={isInitialLoading}
        onRowOrderChange={handleCategoryOrderChange}
        onNameChange={handleNameChange}
        onSave={handleCategorySave}
        onToggleDisplay={handleDisplayToggleConfirm}
        onDelete={handleDelete}
      />
    );
  };

  const renderTableContent = () => {
    if (isInitialLoading) {
      return (
        <Box
          sx={{ display: 'flex', justifyContent: 'center', padding: '16px' }}
        >
          <CircularProgress />
        </Box>
      );
    }

    return (
      <Box>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <PrimaryButton
            onClick={applyOrderChanges}
            loading={isApplyingChanges}
            disabled={!hasUnsavedOrderChanges || isApplyingChanges}
            sx={{ minWidth: '120px' }}
          >
            変更を適用
          </PrimaryButton>
        </Box>

        <TableContainer
          component={Paper}
          sx={{
            height: 'calc(100vh - 290px)',
            '& .MuiTable-root': {
              tableLayout: 'fixed',
            },
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'white' }}>
                <CustomTableCell
                  sx={{ width: '45%', paddingLeft: '4%', paddingRight: '10%' }}
                >
                  表示名
                </CustomTableCell>
                <CustomTableCell sx={{ width: '8%', paddingRight: '13%' }}>
                  デフォルト名
                </CustomTableCell>
                <CustomTableCell
                  sx={{ width: '4%', paddingRight: '5%', textAlign: 'center' }}
                >
                  表示
                </CustomTableCell>
                <CustomTableCell
                  sx={{ width: '4%', paddingRight: '4%', textAlign: 'center' }}
                ></CustomTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedTab === 'genre'
                ? renderGenreRows()
                : renderCategoryRows()}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <Box sx={{ pt: 1, height: '100%' }}>
      <CustomTab
        tabs={tabs}
        onTabChange={handleTabChange}
        content={renderTableContent()}
        TabIndicatorProps={{ style: { display: 'none' } }}
      />

      <ConfirmationDialog
        open={hideDialogOpen}
        onClose={() => setHideDialogOpen(false)}
        onConfirm={handleConfirmHide}
        title="注意"
        message="このジャンル・カテゴリに現在属している商品も非表示になります。（販売・買取ができなくなる可能性があります）"
        confirmButtonText="非表示にする"
      />

      <DeleteGenreDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        genreName={selectedItemName}
      />

      <CannotDeleteGenreDialog
        open={cannotDeleteDialogOpen}
        onClose={() => setCannotDeleteDialogOpen(false)}
      />
    </Box>
  );
};
