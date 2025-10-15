import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  Stack,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import TertiaryButton from '@/components/buttons/TertiaryButton';
import { TagType } from '@/feature/settings/tag/components/TagTable'; // タグの型
import { UseTagParams, useTags } from '@/feature/settings/tag/hooks/useTags';
import { createClientAPI } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import theme from '@/theme';

interface TagModalProps {
  productID: number;
  storeID: number;
  initialTags: Array<{
    tag_id: number;
    tag_name: string;
  }>; // 初期タグデータの型
  open: boolean;
  onClose: () => void;
  fetchItemData: () => void;
}

const TagModal: React.FC<TagModalProps> = ({
  productID,
  storeID,
  initialTags,
  open,
  onClose,
  fetchItemData,
}) => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const { getTags } = useTags();
  const { setAlertState } = useAlert();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); //スマホ用の表示判断

  useEffect(() => {
    if (storeID) {
      fetchTags(storeID);
    }
    // 初期タグを選択済みタグに設定
    setSelectedTags(
      initialTags?.map((tag) => ({
        id: tag.tag_id,
        displayName: tag.tag_name,
        relatedProductCount: 0, // 付与されているタグにはこの情報は不要
        description: '', // 初期データには説明がないため空文字
      })),
    );
  }, [storeID, initialTags]);

  // タグの一覧を取得
  const fetchTags = useCallback(
    async (storeID: number) => {
      const getTagsParams: UseTagParams['getTags'] = {
        storeID: storeID,
      };
      const response = await getTags(getTagsParams);
      if (!response) return;
      console.log('タグ情報取得', response);
      setTags((prevTags: TagType[]) => {
        const newTags: TagType[] = response
          .filter(
            (newTag) => !prevTags.some((prevTag) => prevTag.id === newTag.id),
          )
          .map((tag) => ({
            id: tag.id,
            displayName: tag.displayName,
            relatedProductCount: tag.productsCount,
            description: tag.description,
          }));
        return [...prevTags, ...newTags];
      });
    },
    [getTags],
  );

  const handleSelectTag = (tag: TagType) => {
    if (!selectedTags.some((selected) => selected.id === tag.id)) {
      setSelectedTags((prev) => [...prev, tag]);
    }
  };

  const handleRemoveTag = (tagId: number) => {
    setSelectedTags((prev) => prev.filter((tag) => tag.id !== tagId));
  };

  const handleUpdateTags = async () => {
    // 新しいタグと削除するタグを計算
    const initialTagIDs = initialTags.map((tag) => tag.tag_id);
    const selectedTagIDs = selectedTags.map((tag) => tag.id);

    const tagsToAdd = selectedTagIDs.filter(
      (id) => !initialTagIDs.includes(id),
    );
    const tagsToRemove = initialTagIDs.filter(
      (id) => !selectedTagIDs.includes(id),
    );

    // タグを追加
    if (tagsToAdd.length > 0) {
      try {
        await clientAPI.product.addTagToProduct({
          storeID,
          products: tagsToAdd.map((tagID) => ({
            productID, // 商品IDをリクエストに含める
            tagID, // タグID (定義通りに変更)
          })),
        });
        console.log('タグを追加しました:', tagsToAdd);
      } catch (error) {
        console.error('タグの追加に失敗しました', error);
      }
    }

    // タグを削除
    for (const tagID of tagsToRemove) {
      try {
        await clientAPI.product.removeTagFromProduct({
          storeID,
          productID,
          tagID,
        });
        console.log('タグを削除しました:', tagID);
      } catch (error) {
        console.error('タグの削除に失敗しました', error);
      }
    }
    setAlertState({
      message: 'タグの更新に成功しました。',
      severity: 'success',
    });
    fetchItemData && fetchItemData(); // データを再取得
    onClose(); // モーダルを閉じる
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={{ '& .MuiDialog-paper': { maxHeight: '90vh' } }}
    >
      <DialogTitle
        sx={{
          textAlign: 'center',
          backgroundColor: 'grey.700',
          color: 'text.secondary',
          mb: 2,
        }}
      >
        タグ追加・削除
      </DialogTitle>
      <DialogContent>
        {/* 検索ボックス */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <TextField
            placeholder="タグを検索"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
            sx={{ width: '100%' }}
          />
        </Stack>
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row', // スマホなら縦並び
            gap: 2,
            height: isMobile ? 'auto' : '600px', // スマホ時は高さを自動調整
          }}
        >
          {/* 左側のタグリスト */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              border: '1px solid #ccc',
              borderRadius: 1,
              maxHeight: { xs: '400px', sm: 'none' },
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      backgroundColor: 'grey.700',
                      color: 'text.secondary',
                      textAlign: 'center',
                      width: '20%',
                    }}
                  >
                    タグ名
                  </TableCell>
                  {/* スマホ時に非表示 */}
                  {!isMobile && (
                    <TableCell
                      sx={{
                        backgroundColor: 'grey.700',
                        color: 'text.secondary',
                        textAlign: 'center',
                      }}
                    >
                      備考
                    </TableCell>
                  )}
                  <TableCell
                    sx={{
                      backgroundColor: 'grey.700',
                      color: 'text.secondary',
                      textAlign: 'center',
                      width: '25%',
                    }}
                  ></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tags
                  .filter((tag) =>
                    tag.displayName.toLowerCase().includes(searchTerm.trim()),
                  )
                  .map((tag) => (
                    <TableRow key={tag.id}>
                      <TableCell>
                        {/* Tooltipで備考を表示 */}
                        <Tooltip
                          title={isMobile ? tag.description || '---' : ''}
                          arrow
                        >
                          <Box
                            component="span"
                            sx={{ cursor: isMobile ? 'pointer' : 'default' }}
                          >
                            {tag.displayName}
                          </Box>
                        </Tooltip>
                      </TableCell>
                      {/* スマホ時は備考列を非表示 */}
                      {!isMobile && (
                        <TableCell>{tag.description || '---'}</TableCell>
                      )}
                      <TableCell>
                        {selectedTags?.some(
                          (selected) => selected.id === tag.id,
                        ) ? (
                          <Button disabled>選択済み</Button>
                        ) : (
                          <TertiaryButton onClick={() => handleSelectTag(tag)}>
                            追加
                          </TertiaryButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Box>

          {/* 右側の選択済みタグ */}
          <Box
            sx={{
              flex: 1,
              border: '1px solid #ccc',
              borderRadius: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box
              sx={{
                backgroundColor: 'primary.main',
                color: 'text.secondary',
                textAlign: 'center',
              }}
            >
              <Typography sx={{ my: 2, fontWeight: 'bold' }}>
                追加するタグ
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                overflowY: 'auto',
                flex: 1,
                p: 2,
              }}
            >
              {selectedTags?.map((tag) => (
                <Chip
                  key={tag.id}
                  label={tag.displayName}
                  onDelete={() => handleRemoveTag(tag.id)}
                  sx={{
                    cursor: 'pointer',
                    backgroundColor: 'white',
                    border: 1,
                    borderColor: 'grey.500',
                  }}
                />
              ))}
            </Box>
            <Box
              sx={{
                p: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <PrimaryButton
                onClick={handleUpdateTags}
                sx={{ mt: 2, width: '50%' }}
              >
                更新
              </PrimaryButton>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TagModal;
