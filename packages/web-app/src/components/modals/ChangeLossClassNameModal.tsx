import { ReactNode } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  IconButton,
  CircularProgress,
  Paper,
  TableHead,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { FaTimes } from 'react-icons/fa';
import Grey500whiteButton from '@/components/buttons/grey500whiteButton';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import TertiaryButtonWithIcon from '@/components/buttons/TertiaryButtonWithIcon';

// モーダルのプロップスインタフェース
interface ChangeClassNameModalProps<T> {
  open: boolean;
  onClose: () => void;
  isLoading?: boolean;
  modalTitle: string;
  data: T[];
  accessKey: AccessKeyDifinition<T>;
  onChangeName: (index: number, newName: string) => void;
  onAddNew: () => void;
  onDelete: (index: number) => void;
  onSave: () => void;
}

// プロップスで渡されたデータにアクセスするキーのインタフェース
export interface AccessKeyDifinition<T> {
  id: keyof T & string;
  store_id: keyof T & string;
  display_name: keyof T & string;
}

export const ChangeLossClassNameModal = <T,>({
  open,
  onClose,
  isLoading,
  modalTitle,
  data,
  accessKey,
  onChangeName,
  onAddNew,
  onDelete,
  onSave,
}: ChangeClassNameModalProps<T>) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          maxWidth: '1920px',
          height: '90%',
          maxHeight: '90vh',
          bgcolor: 'background.paper',
          borderRadius: '4px',
          boxShadow: 24,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* モーダルヘッダー */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px',
            backgroundColor: 'common.white',
            borderRadius: '4px 4px 0 0',
            color: 'text.secondary',
            position: 'relative',
            height: '80px',
            width: '100%',
            borderBottom: '1px, solid',
            borderColor: 'grey.300',
            boxShadow: 2,
          }}
        >
          <Box sx={{ flexGrow: 1, textAlign: 'left', padding: 2 }}>
            <Typography variant="h1" color="common.black">
              {modalTitle}
            </Typography>
          </Box>
          <Button
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: '10px',
              color: 'common.black',
              minWidth: 'auto',
            }}
          >
            <FaTimes size={20} />
          </Button>
        </Box>
        {/* モーダルコンテンツ */}
        {isLoading ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              width: '100%',
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                padding: '20px',
                overflowY: 'auto',
                flexGrow: 1,
                backgroundColor: '#F9F9F9',
              }}
            >
              {/* リストテーブル */}
              <TableContainer
                component={Paper}
                sx={{
                  width: '95%',
                  height: '95%',
                  maxHeight: '1080px',
                  overflow: 'auto',
                  boxShadow: 'none',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#b82a2a' }}>
                      <TableCell
                        sx={{
                          width: '20%',
                          color: '#fff',
                          fontWeight: 'bold',
                          top: 0,
                          zIndex: 1,
                          borderTop: '8px solid #b82a2a',
                          paddingLeft: 10,
                        }}
                      >
                        ロス区分番号
                      </TableCell>
                      <TableCell
                        sx={{
                          width: '65%',
                          color: '#fff',
                          fontWeight: 'bold',
                          top: 0,
                          zIndex: 1,
                          borderTop: '8px solid #b82a2a',
                        }}
                      >
                        ロス区分
                      </TableCell>
                      <TableCell
                        sx={{
                          width: '15%',
                          color: '#fff',
                          fontWeight: 'bold',
                          top: 0,
                          zIndex: 1,
                          borderTop: '8px solid #b82a2a',
                        }}
                      ></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* 現在のリスト */}
                    {data.map((item, index) => (
                      <TableRow key={index} sx={{ height: '30px' }}>
                        <TableCell
                          sx={{
                            paddingLeft: 10,
                          }}
                        >
                          {item[accessKey.id] as ReactNode}
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            value={item[accessKey.display_name]}
                            onChange={(e) =>
                              onChangeName(index, e.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton onClick={() => onDelete(index)}>
                            <DeleteIcon fontSize="large" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 2,
                    paddingBottom: 30,
                  }}
                >
                  <Grey500whiteButton
                    variant="contained"
                    sx={{
                      mt: 2,
                      width: '400px',
                      maxWidth: '100%',
                      alignItems: 'center',
                      color: 'grey.800',
                    }}
                    onClick={onAddNew} // 新しい区分を追加
                  >
                    ロス区分追加
                  </Grey500whiteButton>
                </Box>
                <Box
                  sx={{
                    boxShadow: 5,
                    p: 5,
                  }}
                ></Box>
              </TableContainer>
              {/* 新しい要素を追加するためのボタン */}
            </Box>
            <Box
              sx={{
                padding: 2,
                alignItems: 'center',
                justifyContent: 'right',
                display: 'flex',
                width: '100%',
                borderTop: '1px solid',
                borderColor: 'grey.500',
                boxShadow: 2,
              }}
            >
              <TertiaryButtonWithIcon
                sx={{ marginRight: 1 }}
                onClick={() => onClose()}
              >
                編集を破棄
              </TertiaryButtonWithIcon>
              {/* 保存ボタン */}
              <PrimaryButton sx={{ paddingLeft: 2 }} onClick={onSave}>
                編集内容を保存
              </PrimaryButton>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};
