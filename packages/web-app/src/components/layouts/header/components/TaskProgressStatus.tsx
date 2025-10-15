import { useTaskProgress } from '@/contexts/TaskProgressContext';
import { Stack, Typography } from '@mui/material';
import { ApiEventObj } from 'backend-core';

const progressTextMap = {
  createItem: '商品マスタ追加',
  addConditionOption: '状態追加',
  updateItem: '商品マスタ更新',
  updateProduct: '商品更新',
};

export const TaskProgressStatus = () => {
  const { taskProgress, progress } = useTaskProgress();
  if (!taskProgress) return null;
  const progressText = (taskProgress: ApiEventObj.TaskProgress) => {
    const text =
      progressTextMap[taskProgress.kind as keyof typeof progressTextMap];
    return (
      <Typography variant="body2" color="text.primary">
        {text}中：{progress}%
      </Typography>
    );
  };
  if (taskProgress.status === 'PROCESSING') {
    switch (taskProgress.kind) {
      case 'createItem':
        return progressText(taskProgress);
      case 'addConditionOption':
        return progressText(taskProgress);
      case 'updateItem':
        return progressText(taskProgress);
      case 'updateProduct':
        return progressText(taskProgress);
      default:
        return null;
    }
  }
  if (taskProgress.status === 'ERRORED') {
    return (
      <Stack direction="row" alignItems="center" gap="4px">
        <Typography variant="caption">
          {progressTextMap[taskProgress.kind as keyof typeof progressTextMap]}
          <br />
          処理が途中で失敗してしまいました
        </Typography>
        {/* TODO このコンポーネント表示できるようにしたい */}
        {/* <CircularProgressWithPercent percent={80} color="error" size={16} /> */}
      </Stack>
    );
  }
  return null;
};
