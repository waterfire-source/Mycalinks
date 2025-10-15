import { useState, useEffect } from 'react';
import { Box, Grid, Typography, CircularProgress } from '@mui/material';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { useStore } from '@/contexts/StoreContext';
import { useSession } from 'next-auth/react';
import { useAppGenre } from '@/feature/genre/hooks/useAppGenre';
import { Item_Genre } from '@prisma/client';
import { useGenre } from '@/feature/genre/hooks/useGenre';
import { CustomInputDialog } from '@/components/dialogs/CustomInputDialog';
import { GenreCard } from '@/app/auth/(dashboard)/settings/genre-and-category/components/GenreCard';

export interface UIGenre {
  id: number;
  display_name: string;
  store_id: number;
  // UI操作用のフラグ
  selected?: boolean;
  // mycaジャンルから継承するUI表示用プロパティ
  single_genre_image?: string;
  image?: string;
  // APIリクエスト用のパラメータ
  myca_genre_id?: number; // Mycaジャンルの場合のみ使用
  posGenre?: {
    id: Item_Genre['id']; //POS上で結びつけられているジャンルがある場合、その情報が入る
    total_item_count: number; //POSに登録されている、アプリに紐づいているこのジャンルのアイテム数
  } | null;
  order_number?: number; // ジャンルを表示する順番
}

interface AddGenreModalProps {
  isAddGenreModalOpen: boolean;
  setIsAddGenreModalOpen: (open: boolean) => void;
  onGenreAdded?: () => void;
}

export const AddGenreModal = ({
  isAddGenreModalOpen,
  setIsAddGenreModalOpen,
  onGenreAdded,
}: AddGenreModalProps) => {
  const { store } = useStore();
  const { data: session } = useSession();
  const { appGenre, fetchAppGenreList } = useAppGenre();
  const { createGenre } = useGenre();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCustomInputDialog, setIsCustomInputDialog] = useState(false);
  const [genres, setGenres] = useState<UIGenre[]>([]);

  const convertAppGenresToItemGenres = () => {
    setIsLoading(true);
    try {
      const convertedGenres: UIGenre[] = (appGenre?.appGenres || []).map(
        (genre) => ({
          id: genre.id,
          display_name: genre.display_name,
          store_id: store.id,
          selected: false,
          single_genre_image: genre.single_genre_image,
          image: genre.image,
          myca_genre_id: genre.id,
          posGenre: genre.posGenre,
        }),
      );

      setGenres(convertedGenres);
    } catch (error) {
      console.error('ジャンルデータの変換に失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAddGenreModalOpen && store.id && !appGenre?.appGenres) {
      fetchAppGenreList(store.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAddGenreModalOpen, store.id, appGenre?.appGenres]);

  useEffect(() => {
    if (isAddGenreModalOpen && store.id && appGenre?.appGenres) {
      if (appGenre.appGenres.length > 0) {
        convertAppGenresToItemGenres();
      } else {
        setIsLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAddGenreModalOpen, store.id, appGenre?.appGenres]);

  const toggleGenreSelection = (id: number) => {
    setGenres(
      genres.map((genre) =>
        genre.id === id ? { ...genre, selected: !genre.selected } : genre,
      ),
    );
  };

  const handleActionButtonClick = async () => {
    setIsLoading(true);
    setError(null);
    const selectedGenres = genres.filter((genre) => genre.selected);

    try {
      for (const genre of selectedGenres) {
        if (!session?.user?.id) {
          throw new Error('ユーザー情報が取得できません');
        }

        const staffAccountId = Number(session.user.id);

        // Mycaアプリのジャンルの場合のみ登録処理
        if (genre.myca_genre_id) {
          await createGenre({
            staffAccountId,
            mycaGenreId: genre.myca_genre_id,
          });
        }
      }

      fetchAppGenreList(store.id);

      if (onGenreAdded) {
        onGenreAdded();
      }

      handleClose();
    } catch (err) {
      console.error('ジャンル追加エラー:', err);
      setError(
        err instanceof Error ? err.message : '不明なエラーが発生しました',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = () => {
    setIsAddGenreModalOpen(true);
  };

  const handleClose = () => {
    setIsAddGenreModalOpen(false);
    setError(null);
  };

  const handleOpenCustomInputDialog = () => {
    setIsCustomInputDialog(true);
  };

  const handleCloseCustomInputDialog = () => {
    setIsCustomInputDialog(false);
  };

  // 独自ジャンルの追加処理
  const handleAddCustomGenre = async (genreName: string) => {
    if (genreName.trim()) {
      setIsLoading(true);
      setError(null);

      try {
        if (!session?.user?.id) {
          throw new Error('ユーザー情報が取得できません');
        }

        const staffAccountId = Number(session.user.id);

        // APIで独自ジャンルを作成
        // TODO:独自ジャンルはdisplayNameがpostで必要なAPIだが、useAppGenreではhandleがないと取得できないので確認する
        // POST処理かfetchAppGenreListのGET処理を見直す必要あり
        await createGenre({
          staffAccountId,
          displayName: genreName,
        });

        await fetchAppGenreList(store.id);

        if (onGenreAdded) {
          onGenreAdded();
        }

        handleCloseCustomInputDialog();
        handleClose();
      } catch (err) {
        console.error('独自ジャンル追加エラー:', err);
        setError(
          err instanceof Error ? err.message : '不明なエラーが発生しました',
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '300px',
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    if (genres.length === 0) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            height: '300px',
          }}
        >
          <Typography variant="body1" sx={{ mb: 2 }}>
            追加できるジャンルがありません
          </Typography>
          <SecondaryButton
            variant="contained"
            onClick={handleOpenCustomInputDialog}
          >
            独自ジャンルを追加
          </SecondaryButton>
        </Box>
      );
    }

    return (
      <>
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <SecondaryButton onClick={handleOpenCustomInputDialog}>
            独自ジャンルを追加
          </SecondaryButton>
        </Box>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            {genres.map((genre) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={genre.id >= 0 ? genre.id : `custom-${genre.display_name}`}
              >
                <GenreCard genre={genre} onSelect={toggleGenreSelection} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </>
    );
  };

  return (
    <>
      <SecondaryButton onClick={handleOpen}>ジャンルを追加</SecondaryButton>

      <CustomModalWithIcon
        open={isAddGenreModalOpen}
        onClose={handleClose}
        title="ジャンルを追加"
        width="90%"
        height="85%"
        actionButtonText="選択したジャンルを追加"
        onActionButtonClick={handleActionButtonClick}
        cancelButtonText="キャンセル"
        loading={isLoading}
      >
        {error && (
          <Box sx={{ color: 'error.main', mt: 2, mb: 2, textAlign: 'center' }}>
            <Typography variant="body2">{error}</Typography>
          </Box>
        )}
        {renderContent()}
      </CustomModalWithIcon>

      <CustomInputDialog
        open={isCustomInputDialog}
        onClose={handleCloseCustomInputDialog}
        onAddCustomName={handleAddCustomGenre}
        title="独自ジャンルを追加"
        inputLabel="ジャンル名"
        placeholder="ジャンル名を入力"
        buttonText="独自ジャンルを追加"
      />
    </>
  );
};
