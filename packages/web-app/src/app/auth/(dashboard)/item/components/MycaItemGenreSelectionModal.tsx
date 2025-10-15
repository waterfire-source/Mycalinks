import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Box, Typography, Grid, Button, Chip } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { useAppGenre } from '@/feature/genre/hooks/useAppGenre';
import { useStore } from '@/contexts/StoreContext';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { ItemCategoryHandle } from '@prisma/client';
import { HelpIcon } from '@/components/common/HelpIcon';

// 選択オプションの型定義
type SelectionOption = 'all' | 'box' | 'card';

interface Props {
  open: boolean;
  onClose: () => void;
  selectedItems: number[];
  setSelectedItems: Dispatch<SetStateAction<number[]>>;
}

export const MycaItemGenreSelectionModal: React.FC<Props> = ({
  open,
  onClose,
  selectedItems,
  setSelectedItems,
}: Props) => {
  const { store } = useStore();
  const { appGenre, fetchAppGenreList } = useAppGenre();
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();

  // 確認用モーダルの状態
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  // 選択肢モーダルの状態
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [selectedGenreForOption, setSelectedGenreForOption] = useState<
    number | null
  >(null);
  // 各ジャンルの選択オプションを管理
  const [genreSelections, setGenreSelections] = useState<
    Map<number, SelectionOption>
  >(new Map());

  // ジャンルを取得
  useEffect(() => {
    if (store.id) fetchAppGenreList(store.id);
  }, [store.id]);

  const handleItemClick = (id: number, isRegistered: boolean) => {
    if (isRegistered) return;

    // 既に選択されている場合は選択を解除
    if (selectedItems.includes(id)) {
      setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));
      setGenreSelections((prev) => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
    } else {
      // 新規選択の場合は選択肢モーダルを開く
      setSelectedGenreForOption(id);
      setIsOptionModalOpen(true);
    }
  };

  // 選択肢モーダルでオプションを選択した時の処理
  const handleOptionSelect = (option: SelectionOption) => {
    if (selectedGenreForOption === null) return;

    setSelectedItems((prev) => [...prev, selectedGenreForOption]);
    setGenreSelections(
      (prev) => new Map(prev.set(selectedGenreForOption, option)),
    );
    setIsOptionModalOpen(false);
    setSelectedGenreForOption(null);
  };

  // オプション名を表示用に変換
  const getOptionDisplayName = (option: SelectionOption): string => {
    switch (option) {
      case 'all':
        return '全ての商品';
      case 'box':
        return '全てのBOX';
      case 'card':
        return '全てのカード';
      default:
        return '';
    }
  };

  const genres = appGenre?.appGenres.map((genre) => {
    const unregisteredCount =
      genre.total_item_count - (genre.posGenre?.total_item_count || 0);
    return {
      id: genre.id,
      title: genre.display_name,
      imageUrl: genre.single_genre_image,
      status: unregisteredCount,
      isRegistered: unregisteredCount === 0,
    };
  });

  // 登録ボタンを押したときの動作（確認モーダルを開く）
  const handleOpenConfirmModal = () => {
    setIsConfirmModalOpen(true);
  };

  // 確認モーダル内での登録処理
  const handleRegisterConfirm = async () => {
    setIsConfirmModalOpen(false);
    await handleRegisterItems();
  };

  const handleRegisterItems = async () => {
    if (!store.id) return;

    try {
      const responses = await Promise.all(
        selectedItems.map(async (itemGenreID) => {
          const genre = appGenre?.appGenres.find((g) => g.id === itemGenreID);
          const selectedOption = genreSelections.get(itemGenreID);

          if (!genre) {
            throw new Error(`ジャンルID ${itemGenreID} が見つかりません`);
          }

          if (!selectedOption) {
            throw new Error(
              `ジャンルID ${itemGenreID} の選択オプションが見つかりません`,
            );
          }

          const posGenreID =
            genre.posGenre?.id ||
            (await (async () => {
              const newGenre = await clientAPI.genre.createMycaGenre({
                storeID: store.id,
                mycaGenreID: genre.id,
              });
              if (newGenre instanceof CustomError) {
                setAlertState({
                  message: `ジャンルID ${itemGenreID} の作成中にエラー: ${newGenre.message}`,
                  severity: 'error',
                });
                throw new Error(`ジャンルID ${itemGenreID} の作成失敗`);
              }
              return newGenre.id;
            })());

          // 選択オプションに応じてtargetCategoryHandlesを設定
          let targetCategoryHandles: ItemCategoryHandle[] | undefined;
          switch (selectedOption) {
            case 'box':
              targetCategoryHandles = [ItemCategoryHandle.BOX];
              break;
            case 'card':
              targetCategoryHandles = [ItemCategoryHandle.CARD];
              break;
            case 'all':
            default:
              targetCategoryHandles = undefined; // 全商品の場合は指定なし
              break;
          }

          const res = await clientAPI.item.importItemsFromApp({
            storeID: store.id,
            itemGenreID: posGenreID,
            targetCategoryHandles,
          });

          if (res instanceof CustomError) {
            setAlertState({
              message: `ジャンルID ${itemGenreID} (${posGenreID}): ${res.status}: ${res.message}`,
              severity: 'error',
            });
            return { success: false, genreID: itemGenreID };
          }

          return { success: true, genreID: itemGenreID };
        }),
      );

      const successCount = responses.filter((res) => res.success).length;

      if (successCount > 0) {
        setSelectedItems([]);
        setGenreSelections(new Map());
        setAlertState({
          message: `${successCount}つのジャンルの商品登録を開始しました。`,
          severity: 'success',
        });
        onClose();
      }
    } catch (error) {
      console.error('登録処理全体でエラー:', error);
      setAlertState({
        message: '商品登録中にエラーが発生しました。もう一度お試しください。',
        severity: 'error',
      });
    }
  };

  return (
    <>
      <CustomModalWithIcon
        open={open}
        onClose={onClose}
        title="指定したジャンルの商品をすべて登録"
        titleInfo={<HelpIcon helpArchivesNumber={176} />}
        width="90%"
        height="85%"
        actionButtonText="登録する"
        onActionButtonClick={handleOpenConfirmModal}
        onCancelClick={onClose}
        cancelButtonText="キャンセル"
      >
        {/* メインのモーダル内容 */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            height: '100%',
            overflowY: 'auto',
            p: 2,
          }}
        >
          <Grid container spacing={2}>
            {genres?.map((genre) => (
              <Grid item xs={2} key={genre.id}>
                <Box
                  onClick={() => handleItemClick(genre.id, genre.isRegistered)}
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    border: '2px solid',
                    borderRadius: '8px',
                    p: 2,
                    boxShadow: 3,
                    height: '120px',
                    justifyContent: 'center',
                    backgroundColor: genre.isRegistered
                      ? 'grey.200'
                      : 'common.white',
                    borderColor: selectedItems?.includes(genre.id)
                      ? 'primary.main'
                      : 'grey.300',
                    cursor: genre.isRegistered ? 'not-allowed' : 'pointer',
                  }}
                >
                  {selectedItems?.includes(genre.id) && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        backgroundColor: 'primary.main',
                        borderRadius: '50%',
                        width: 24,
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 1,
                      }}
                    >
                      <CheckIcon sx={{ color: 'white', fontSize: 18 }} />
                    </Box>
                  )}
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={3}>
                      <Box
                        component="img"
                        src={genre.imageUrl}
                        alt={genre.title}
                        sx={{
                          width: '100%',
                          aspectRatio: '0.71',
                          objectFit: 'contain',
                        }}
                      />
                    </Grid>
                    <Grid item xs={9}>
                      <Typography sx={{ whiteSpace: 'normal' }}>
                        {genre.title}
                      </Typography>
                      <Typography variant="caption" color="primary.main">
                        {`${genre.status}個未登録商品`}
                      </Typography>
                      {selectedItems?.includes(genre.id) &&
                        genreSelections.has(genre.id) && (
                          <Box sx={{ mt: 0.5 }}>
                            <Chip
                              label={getOptionDisplayName(
                                genreSelections.get(genre.id)!,
                              )}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </Box>
                        )}
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </CustomModalWithIcon>

      {/* 選択肢モーダル */}
      <CustomModalWithIcon
        open={isOptionModalOpen}
        width="40%"
        height="40%"
        onClose={() => {
          setIsOptionModalOpen(false);
          setSelectedGenreForOption(null);
        }}
        title="登録タイプを選択"
        cancelButtonText="キャンセル"
        hideButtons
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: 2,
          }}
        >
          <Typography textAlign="center" sx={{ mb: 2 }}>
            どの商品を登録しますか？
          </Typography>
          <Button
            variant="contained"
            fullWidth
            onClick={() => handleOptionSelect('all')}
            sx={{ mb: 1 }}
          >
            全ての商品を登録
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => handleOptionSelect('box')}
            sx={{ mb: 1 }}
          >
            全てのBOXを登録
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => handleOptionSelect('card')}
          >
            全てのカードを登録
          </Button>
        </Box>
      </CustomModalWithIcon>

      {/* 確認用モーダル */}
      <CustomModalWithIcon
        open={isConfirmModalOpen}
        width="40%"
        height="30%"
        onClose={() => setIsConfirmModalOpen(false)}
        title="指定したジャンルの商品をすべて登録"
        actionButtonText="登録する"
        onActionButtonClick={handleRegisterConfirm}
        cancelButtonText="キャンセル"
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <Typography textAlign="center">
            大量の商品が登録される可能性があります。本当に登録しますか？
          </Typography>
        </Box>
      </CustomModalWithIcon>
    </>
  );
};
