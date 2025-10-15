import { useState, useEffect, useMemo, useCallback } from 'react';
import { useStore } from '@/contexts/StoreContext';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { Loss_Genre } from '@prisma/client';
import { ChangeLossClassNameModal } from '@/components/modals/ChangeLossClassNameModal';

interface LossClassificationModalProps {
  open: boolean;
  onClose: () => void;
  updateLossGenres: () => Promise<void>;
}

// プロップスで渡されたデータにアクセスするキーのインタフェース
interface AccessKeyDifinition<T> {
  id: keyof T & string;
  store_id: keyof T & string;
  display_name: keyof T & string;
}

// 変更に用いるキーを取り出したインタフェース
interface NecessaryLossGenre {
  id: Loss_Genre['id'];
  store_id: Loss_Genre['store_id'];
  display_name: Loss_Genre['display_name'];
}

// ロス区分を追加するモーダル
export default function LossClassificationModal({
  open,
  onClose,
  updateLossGenres,
}: LossClassificationModalProps) {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [currentLossGenres, setCurrentLossGenres] = useState<
    NecessaryLossGenre[]
  >([]);
  const [editedGenres, setEditedGenres] = useState<NecessaryLossGenre[]>([]);

  const { store } = useStore();

  // モーダルがeditedGenreを読み取るために渡すキーのインタフェース
  const lossGenreAccessKey: AccessKeyDifinition<NecessaryLossGenre> = {
    id: 'id',
    store_id: 'store_id',
    display_name: 'display_name',
  };

  // ロス区分情報を取得する
  useEffect(() => {
    const fetchLossGenres = async () => {
      try {
        const response = await clientAPI.loss.getLossGenres({
          store_id: store.id,
        });
        if (response instanceof CustomError) {
          setAlertState({
            message: `${response.status}:${response.message}`,
            severity: 'error',
          });
          return;
        }
        setEditedGenres(response);
        setCurrentLossGenres(response);
      } catch (error) {
        console.error('ロス区分のデータ取得に失敗しました:', error);
      }
    };

    if (store) {
      fetchLossGenres();
    }
  }, [store, open]);

  // 新しい区分を追加する処理
  const handleAddGenre = useCallback(() => {
    setEditedGenres((prevGenres) => {
      // prevGenres が配列であることを確認
      if (Array.isArray(prevGenres)) {
        return [
          ...prevGenres,
          {
            id: -1, // 新しい区分であることを表す負のID。のちに適切なIDが付与される
            display_name: '',
            store_id: store.id,
            created_at: new Date().toISOString(),
            enabled: true,
            order_number: null,
            code: null,
          },
        ];
      }
      return prevGenres;
    });
  }, [store.id]);

  // 編集された名前を`LossGenres`に反映
  const handleChangeGenreName = useCallback(
    (index: number, newName: string) => {
      setEditedGenres((prev) =>
        prev.map((genre, i) =>
          i === index ? { ...genre, display_name: newName } : genre,
        ),
      );
    },
    [],
  );

  // editedGenreから指定の要素を削除
  const handleDeleteGenre = useCallback((index: number) => {
    if (Array.isArray(editedGenres)) {
      setEditedGenres((prevEditedGenres) =>
        prevEditedGenres.filter((_, i) => i !== index),
      );
    }
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await Promise.all(
        editedGenres
          .filter(
            (editedGenre) =>
              currentLossGenres.some(
                (genre) =>
                  genre.id === editedGenre.id &&
                  genre.display_name !== editedGenre.display_name,
              ) || editedGenre.id === -1,
          )
          .map(async (newGenre) => {
            if (newGenre.id === -1) {
              await clientAPI.loss.createLossGenre({
                store_id: store.id,
                display_name: newGenre.display_name,
              });
            } else {
              await clientAPI.loss.updateLossGenre({
                store_id: store.id,
                id: newGenre.id,
                display_name: newGenre.display_name,
              });
            }
          }),
      );

      await Promise.all(
        currentLossGenres
          .filter(
            (currentGenre) =>
              !editedGenres.some((genre) => genre.id === currentGenre.id),
          )
          .map(async (genreToDelete) => {
            await clientAPI.loss.deleteLossGenre({
              store_id: store.id,
              id: genreToDelete.id,
            });
          }),
      );

      await updateLossGenres();

      onClose();
      setAlertState({
        message: 'ロス区分の更新が完了しました',
        severity: 'success',
      });
    } catch (error) {
      console.error('区分名の保存に失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // モーダルの表示
    <>
      <ChangeLossClassNameModal
        open={open}
        onClose={onClose}
        isLoading={isLoading}
        modalTitle="ロス区分一覧・編集"
        data={editedGenres}
        accessKey={lossGenreAccessKey}
        onChangeName={handleChangeGenreName}
        onAddNew={handleAddGenre}
        onDelete={handleDeleteGenre}
        onSave={handleSave}
      />
    </>
  );
}
