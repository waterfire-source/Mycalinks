import React, { useState } from 'react';
import { Box, Chip } from '@mui/material';
import Grey500whiteButton from '@/components/buttons/grey500whiteButton';
import TagModal from '@/feature/tag/components/TagModal';

interface TagManagerProps {
  productID: number;
  storeID: number;
  initialTags: Array<{
    tag_id: number;
    tag_name: string;
  }>; // すでについているタグ
  fetchItemData: () => void;
}

const TagManager: React.FC<TagManagerProps> = ({
  productID,
  storeID,
  initialTags,
  fetchItemData,
}) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <Grey500whiteButton onClick={handleOpen} sx={{ height: '30px' }}>
          新規追加
        </Grey500whiteButton>
        {initialTags?.map((tag) => (
          <Chip key={tag.tag_id} label={tag.tag_name} variant="outlined" />
        ))}
      </Box>

      {/* モーダル */}
      <TagModal
        productID={productID}
        storeID={storeID}
        initialTags={initialTags}
        open={open}
        onClose={handleClose}
        fetchItemData={fetchItemData}
      />
    </>
  );
};

export default TagManager;
