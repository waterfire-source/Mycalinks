'use client';

import {
  Box,
  Typography,
  List,
  ListItem,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { TemplateKind } from '@prisma/client';
import { useErrorAlert } from '@/hooks/useErrorAlert';

interface Template {
  id: number;
  store_id: number;
  kind: TemplateKind;
  display_name: string;
  url: string | null;
  created_at: string;
}

interface TemplateListProps {
  templates: Template[];
  onDelete: (template: Template) => void;
  loading: boolean;
}

export const TemplateList = ({
  templates,
  onDelete,
  loading,
}: TemplateListProps) => {
  const { handleError } = useErrorAlert();

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // 無効な日付の場合はエラーを投げる
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      handleError(error);
      return '日付不明';
    }
  };

  const handleDeleteClick = (template: Template) => {
    try {
      onDelete(template);
    } catch (error) {
      handleError(error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (templates.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          テンプレートが登録されていません
        </Typography>
      </Box>
    );
  }

  return (
    <List>
      {templates.map((template) => (
        <ListItem
          key={template.id}
          sx={{
            alignItems: 'flex-start',
            display: 'flex',
            flexDirection: 'column',
            py: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Typography variant="body1" sx={{ mr: 1 }}>
              {template.display_name}
            </Typography>
            <IconButton
              aria-label="削除"
              onClick={() => handleDeleteClick(template)}
              sx={{
                color: 'gray',
                p: 0.5,
                ml: 1,
              }}
              size="small"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </ListItem>
      ))}
    </List>
  );
};
