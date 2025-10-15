import { useState, createContext, useContext, ReactNode } from 'react';
import { useStoreEvent } from '@/contexts/StoreEventContext';
import { ApiEventObj } from 'backend-core/src/event/eventObj';

const TaskProgressContext = createContext<{
  taskProgress: ApiEventObj.TaskProgress | undefined;
}>({
  taskProgress: undefined,
});

export const TaskProgressContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [taskProgress, setTaskProgress] = useState<
    ApiEventObj.TaskProgress | undefined
  >(undefined);

  console.info('タスク進捗: ', taskProgress);

  const handleTaskProgressEvent = (data: ApiEventObj.TaskProgress) => {
    setTaskProgress(data);
  };

  useStoreEvent('taskProgress', handleTaskProgressEvent);

  return (
    <TaskProgressContext.Provider value={{ taskProgress }}>
      {children}
    </TaskProgressContext.Provider>
  );
};

export const useTaskProgress = () => {
  const { taskProgress } = useContext(TaskProgressContext);
  const progress = Math.round(
    taskProgress?.total_processed_task_count
      ? (taskProgress.total_processed_task_count /
          taskProgress.total_queued_task_count) *
          100
      : 0,
  );
  return { taskProgress, progress };
};
