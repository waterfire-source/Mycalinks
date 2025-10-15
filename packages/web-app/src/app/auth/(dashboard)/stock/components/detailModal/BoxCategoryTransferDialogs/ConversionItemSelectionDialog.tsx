import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import { Box, Stack, Typography, Checkbox } from '@mui/material';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { AvailableAction } from '@/app/auth/(dashboard)/stock/hooks/useCheckBoxInfo';
import { useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  actionType: string;
  availableActions: AvailableAction[];
  onActionSelect: (action: AvailableAction) => void;
};

export const ConversionItemSelectionDialog = ({
  open,
  onClose,
  availableActions,
  onActionSelect,
}: Props) => {
  const [selectedActionIndex, setSelectedActionIndex] = useState<number>(-1);

  const handleActionToggle = (index: number) => {
    setSelectedActionIndex(index);
  };

  const handleConfirm = () => {
    if (selectedActionIndex >= 0) {
      onActionSelect(availableActions[selectedActionIndex]);
    }
  };

  const getTitle = () => {
    return '変換元を選択してください';
  };

  // アクションが1つしかない場合はこのダイアログをスキップ
  if (availableActions.length <= 1) {
    return null;
  }

  return (
    <ConfirmationDialog
      open={open}
      onClose={onClose}
      title={getTitle()}
      confirmButtonText="選択"
      onConfirm={handleConfirm}
      confirmButtonDisable={selectedActionIndex < 0}
      content={
        <Box sx={{ minWidth: 400 }}>
          <Typography sx={{ mb: 2 }}>
            変換元として使用するアイテムを選択してください
          </Typography>
          <Stack spacing={1}>
            {availableActions.map((action, index) => {
              const sourceItem = action.sourceInfo.currentItem;
              return (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    p: 2,
                    cursor: 'pointer',
                    backgroundColor:
                      selectedActionIndex === index ? '#f0f8ff' : 'transparent',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                  onClick={() => handleActionToggle(index)}
                >
                  <Checkbox
                    checked={selectedActionIndex === index}
                    onChange={() => handleActionToggle(index)}
                    sx={{ mr: 2 }}
                  />
                  <Box sx={{ width: '60px', height: '60px', mr: 2 }}>
                    <ItemImage imageUrl={sourceItem.image_url || ''} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1">
                      {sourceItem.displayNameWithMeta}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </Box>
      }
    />
  );
};
