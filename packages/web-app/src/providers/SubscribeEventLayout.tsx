import { PATH } from '@/constants/paths';
import { useTaskProgress } from '@/contexts/TaskProgressContext';
import { Box, LinearProgress, Stack, Typography } from '@mui/material';
import { AllKindsType } from 'backend-core';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
type Props = {
  children: React.ReactNode;
};
export const SubscribeEventLayout = ({ children }: Props) => {
  const { taskProgress, progress } = useTaskProgress();
  const pathname = usePathname();
  // 対象のPATH
  const targetPaths = [
    PATH.ITEM.root,
    PATH.STOCK.root,
    PATH.ORIGINAL_PACK.root,
    PATH.SETTINGS.condition,
  ];
  // タスクのステータスがPROCESSINGの場合はローディング画面を表示し、操作できないようにする

  // 何かしらの理由でstatusがうまく変更されていない時に緊急でグレースケールを解除するためのフラグ(10回クリックしたら解除)
  const [isEmergencyCount, setIsEmergencyCount] = useState(0);
  if (isEmergencyCount > 10) {
    return <>{children}</>;
  }

  // タスクがなかったら何もしない
  if (taskProgress?.kind === undefined) {
    return <>{children}</>;
  }
  const targetKinds = ['createItem', 'addConditionOption'];
  // タスクの種類がtargetKindsに含まれていない場合は何もしない
  if (!targetKinds.includes(taskProgress.kind as AllKindsType)) {
    return <>{children}</>;
  }
  if (taskProgress.status === 'PROCESSING' && targetPaths.includes(pathname)) {
    return (
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'auto',
        }}
      >
        <Stack
          sx={{
            pointerEvents: 'none',
            opacity: 0.5,
            p: '-24px',
          }}
        >
          {children}
        </Stack>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1300,
          }}
        >
          <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
            商品マスタ更新中
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ width: '80%', mb: 2 }}
            onClick={() => setIsEmergencyCount((prev) => prev + 1)}
          />
          <Typography variant="h6" sx={{ color: 'white' }}>
            {`${Math.round(progress)}%`}
          </Typography>
        </Box>
      </Box>
    );
  }
  // 条件に引っかからない場合は何もしない
  return <>{children}</>;
};
