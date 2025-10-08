'use client';

import { AppraisalList } from '@/app/auth/(dashboard)/settings/specialty/components/appraisal/AppraisalList';
import { NormalSpecialtyList } from '@/app/auth/(dashboard)/settings/specialty/components/normal/NormalSpecialtyList';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { Stack } from '@mui/material';
import { DndProvider } from 'react-dnd';
import { MultiBackend } from 'dnd-multi-backend';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { TouchTransition, MouseTransition } from 'dnd-multi-backend';

const DnDBackends = {
  backends: [
    {
      backend: HTML5Backend,
      transition: MouseTransition,
    },
    {
      backend: TouchBackend,
      options: { enableMouseEvents: true },
      transition: TouchTransition,
    },
  ],
};
export default function SpecialtyPage() {
  return (
    <DndProvider backend={MultiBackend} options={DnDBackends}>
      <ContainerLayout title="特殊状態" helpArchivesNumber={2843}>
        <Stack gap={3}>
          <AppraisalList />
          <NormalSpecialtyList />
        </Stack>
      </ContainerLayout>
    </DndProvider>
  );
}
