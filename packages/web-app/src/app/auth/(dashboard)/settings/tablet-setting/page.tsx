'use client';

import { GenreCategorySetting } from '@/app/auth/(dashboard)/settings/tablet-setting/components/GenreCategorySetting';

import { ContainerLayout } from '@/components/layouts/ContainerLayout';

export default function TabletSettingPage() {
  return (
    <ContainerLayout title="店舗タブレット設定" helpArchivesNumber={27}>
      <GenreCategorySetting />
    </ContainerLayout>
  );
}
