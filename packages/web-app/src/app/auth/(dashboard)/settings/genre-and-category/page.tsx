'use client';

import { AddCategoryModal } from '@/app/auth/(dashboard)/settings/genre-and-category/components/AddGenreModal';
import { AddGenreModal } from '@/app/auth/(dashboard)/settings/genre-and-category/components/AddGenreModalOpen';
import { GenreCategoryTabTable } from '@/app/auth/(dashboard)/settings/genre-and-category/components/GenreCategoryTabTable';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { Card, Stack } from '@mui/material';
import { useState, useCallback } from 'react';

export default function DepartmentsPage() {
  const [selectedTab, setSelectedTab] = useState<string>('genre');
  const [isAddGenreModalOpen, setIsAddGenreModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTabChange = (tabKey: string) => {
    setSelectedTab(tabKey);
  };

  const handleGenreAdded = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleCategoryAdded = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const renderActions = () => {
    return (
      <Stack gap="12px" direction="row">
        {selectedTab === 'genre' ? (
          <AddGenreModal
            isAddGenreModalOpen={isAddGenreModalOpen}
            setIsAddGenreModalOpen={setIsAddGenreModalOpen}
            onGenreAdded={handleGenreAdded}
          />
        ) : (
          <AddCategoryModal
            isAddCategoryModalOpen={isAddCategoryModalOpen}
            setIsAddCategoryModalOpen={setIsAddCategoryModalOpen}
            onCategoryAdded={handleCategoryAdded}
          />
        )}
      </Stack>
    );
  };

  return (
    <ContainerLayout
      title="ジャンル・カテゴリ設定"
      helpArchivesNumber={887}
      actions={renderActions()}
    >
      <Card
        sx={{ px: '32px', py: '24px', overflowY: 'scroll', height: '100%' }}
      >
        <GenreCategoryTabTable
          onTabChange={handleTabChange}
          refreshTrigger={refreshTrigger}
        />
      </Card>
    </ContainerLayout>
  );
}
