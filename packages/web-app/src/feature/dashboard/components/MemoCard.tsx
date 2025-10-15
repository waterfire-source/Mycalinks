import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useMemos } from '@/feature/memo/hooks/useMemos';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  TableContainer,
  TableBody,
  Table,
  TableCell,
  TableRow,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Store } from '@prisma/client';
import { useEffect, useState } from 'react';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { TextField } from '@mui/material';

interface Props {
  store: Store;
}

export const MemoCard = ({ store }: Props) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down(1400)); // 画面幅1400px以下

  const { memos, fetchMemoList, createMemo, updateMemo, deleteMemo } =
    useMemos();

  // モーダル制御用の state
  const [open, setOpen] = useState(false);
  const [selectedMemo, setSelectedMemo] = useState<{
    id?: number;
    content: string;
  }>({
    id: undefined,
    content: '',
  });

  useEffect(() => {
    fetchMemoList();
  }, [fetchMemoList]);

  // モーダルを開く（新規 or 編集）
  const handleOpenModal = (memo?: { id: number; content: string }) => {
    if (memo) {
      setSelectedMemo({ id: memo.id, content: memo.content });
    } else {
      setSelectedMemo({ id: undefined, content: '' });
    }
    setOpen(true);
  };

  // モーダルを閉じる
  const handleClose = () => {
    setOpen(false);
    setSelectedMemo({ id: undefined, content: '' });
  };

  // メモの作成・更新を実行
  const handleSubmitMemo = async () => {
    if (selectedMemo.id) {
      await updateMemo(selectedMemo.id, selectedMemo.content);
    } else {
      await createMemo(selectedMemo.content);
    }
    fetchMemoList(); // メモ一覧を更新
    handleClose();
  };

  return (
    <Card
      sx={{
        border: '1px solid #ccc',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '& .MuiCardContent-root': {
          flexGrow: 1,
          overflow: 'hidden',
        },
      }}
    >
      <CardHeader
        title={
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  bgcolor: 'primary.main',
                  borderRadius: '50%',
                }}
              />
              <Typography
                variant="h6"
                sx={{ fontSize: '1rem', fontWeight: 'bold' }}
              >
                メモ
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: 'primary.main',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                '&:hover': {
                  opacity: 0.7,
                  textDecoration: 'underline',
                },
              }}
              onClick={() => handleOpenModal()}
            >
              <Box component="span" sx={{ fontSize: '1.2rem' }}>
                +
              </Box>
              新規メモを追加
            </Typography>
          </Box>
        }
        sx={{
          borderBottom: '1px solid #ccc',
          bgcolor: 'grey.50',
          p: 1.5,
        }}
      />

      <CardContent
        sx={{
          flex: 1, // 残りスペースを全て使用
          p: 0,
          '&:last-child': {
            pb: 0,
          },
        }}
      >
        <TableContainer
          sx={{
            height: '100%',
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#888',
              borderRadius: '4px',
            },
          }}
        >
          {memos.length > 0 ? (
            <Table size="small" stickyHeader>
              <TableBody>
                {memos.map((memo) => (
                  <TableRow
                    key={memo.id}
                    sx={{
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        width: '80%',
                        p: 1.5,
                        cursor: 'pointer',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                      onClick={() => handleOpenModal(memo)}
                    >
                      <Typography
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.5,
                        }}
                      >
                        {memo.content}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        width: '20%',
                        p: 1,
                        borderLeft: '1px solid #eee',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 1,
                          justifyContent: 'flex-end',
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleOpenModal(memo)}
                          sx={{
                            '&:hover': {
                              color: 'primary.main',
                            },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={async () => {
                            if (
                              window.confirm(
                                'このメモを削除してもよろしいですか？',
                              )
                            ) {
                              await deleteMemo(memo.id);
                              await fetchMemoList();
                            }
                          }}
                          sx={{
                            '&:hover': {
                              color: 'error.main',
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3,
              }}
            >
              <Typography
                color="textSecondary"
                sx={{
                  textAlign: 'center',
                  fontStyle: 'italic',
                }}
              >
                メモはありません
              </Typography>
            </Box>
          )}
        </TableContainer>
      </CardContent>

      <CustomModalWithIcon
        open={open}
        onClose={handleClose}
        title={selectedMemo.id ? 'メモ編集' : 'メモ追加'}
        width="50%"
        height={isSmallScreen ? '50%' : '60%'} // 1400px以下なら50%、それ以上なら80%
        onActionButtonClick={handleSubmitMemo}
        actionButtonText={selectedMemo.id ? 'メモを更新' : 'メモを追加'}
        onCancelClick={handleClose}
        cancelButtonText="キャンセル"
        sx={{
          '& .MuiDialog-paper': {
            maxWidth: '600px',
            width: '90%',
          },
        }}
      >
        <Box p={2}>
          <TextField
            fullWidth
            multiline
            rows={12}
            placeholder="メモを入力してください..."
            value={selectedMemo.content}
            onChange={(e) =>
              setSelectedMemo((prev) => ({ ...prev, content: e.target.value }))
            }
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />
        </Box>
      </CustomModalWithIcon>
    </Card>
  );
};
