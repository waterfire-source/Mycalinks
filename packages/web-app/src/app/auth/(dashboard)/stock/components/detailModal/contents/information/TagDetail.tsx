import React, { useEffect, useState } from 'react';
import { Box, Button, IconButton, TextField, Typography } from '@mui/material';
import EditNote from '@mui/icons-material/EditNote';
import ClearIcon from '@mui/icons-material/Clear';
import TagModal from '@/feature/tag/components/TagModal';

interface Props {
  filteredTags: { tag_id: number; tag_name: string }[];
  visibleTags: boolean[];
  setVisibleTags: React.Dispatch<React.SetStateAction<boolean[]>>;
  canDisplay: boolean;
  setCanDisplay: React.Dispatch<React.SetStateAction<boolean>>;
  fetchProducts: () => Promise<void>;
  storeId: number;
  productId: number;
}

export const TagDetail: React.FC<Props> = ({
  filteredTags,
  visibleTags,
  setVisibleTags,
  canDisplay,
  setCanDisplay,
  fetchProducts,
  storeId,
  productId,
}) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleHideTag = (index: number) => {
    setVisibleTags((prev) =>
      prev.map((visible, i) => (i === index ? false : visible)),
    );
  };

  useEffect(() => {
    setVisibleTags((prev) => {
      if (!filteredTags) return []; // filteredTags が null の場合は空配列にリセット

      // filteredTags の長さが変わった場合、新しい可視状態を初期化
      if (prev.length !== filteredTags.length) {
        return new Array(filteredTags.length).fill(true);
      }

      // 長さが変わっていなければ、元の状態を維持
      return prev;
    });
  }, [filteredTags, setVisibleTags]);

  return (
    <>
      <Box sx={{ width: '95%' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            width: '100%',
          }}
        >
          <Typography>タグ</Typography>
          {/* <Typography variant="caption">（在庫一覧では、選択したタグが代表として表示されます）</Typography> */}
        </Box>
        <Box
          bgcolor={'white'}
          sx={{
            p: 2,
            height: '530px',
            borderRadius: '4px',
            border: 1,
            borderColor: 'divider',
            gap: 1,
          }}
        >
          {filteredTags && filteredTags.length > 0
            ? filteredTags.map((tag, index) =>
                visibleTags[index] ? (
                  <Box
                    key={index}
                    sx={{
                      alignItems: 'center',
                      backgroundColor: 'grey.300',
                      color: 'black',
                      borderRadius: '16px',
                      border: '1px solid',
                      borderColor: 'grey.500',
                      padding: '0 8px',
                      display: 'inline-flex',
                      height: '30px',
                      mt: 1,
                      mr: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography>{tag.tag_name}</Typography>
                      <IconButton
                        onClick={() => handleHideTag(index)}
                        size="small"
                        sx={{ marginLeft: '4px', color: '#666' }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                ) : null,
              )
            : null}
          {canDisplay ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #ccc',
                borderRadius: '16px',
                backgroundColor: '#f0f0f0',
                padding: '0 8px',
                width: '300px',
                height: '30px',
                py: 0.5,
              }}
            >
              <TextField
                size="small"
                sx={{
                  flexGrow: 1,
                  height: '100%',
                  '& .MuiOutlinedInput-root': {
                    height: '100%',
                    border: 'none',
                  },
                  backgroundColor: 'white',
                }}
                InputProps={{
                  sx: { height: '100%' },
                }}
              />
              <IconButton
                onClick={() => setCanDisplay(false)}
                size="small"
                sx={{
                  width: '40px',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666',
                }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </Box>
          ) : null}
          <Box sx={{ alignItems: 'center', display: 'block' }}>
            <Button
              startIcon={<EditNote />}
              sx={{
                backgroundColor: 'grey.300',
                color: 'black',
                borderRadius: '16px',
                border: '1px solid',
                borderColor: 'grey.500',
                px: 2,
                mt: 1,
                height: '30px',
              }}
              // onClick={() => setCanDisplay(true)}
              onClick={handleOpen}
            >
              タグ追加
            </Button>
          </Box>
        </Box>
      </Box>

      {/* モーダル */}
      <TagModal
        productID={productId}
        storeID={storeId}
        initialTags={filteredTags}
        open={open}
        onClose={handleClose}
        fetchItemData={fetchProducts}
      />
    </>
  );
};
