'use client';

import { useState } from 'react';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { OchanokoIntegrationModal } from '@/app/auth/(dashboard)/ec/external/components/OchanokoIntegrationModal';
import { ShopifyIntegrationModal } from '@/app/auth/(dashboard)/ec/external/components/ShopifyIntegrationModal';
import { OchanokoConnectionCard } from '@/app/auth/(dashboard)/ec/external/components/OchanokoConnectionCard';
// import { ShopifyConnectionCard } from '@/app/auth/(dashboard)/ec/external/components/ShopifyConnectionCard';

type IntegrationType = 'ochanoko' | 'shopify' | null;

export default function EcIntegrationPage() {
  // 統一されたモーダル管理
  const [activeModal, setActiveModal] = useState<IntegrationType>(null);
  const handleOpenModal = (type: IntegrationType) => {
    setActiveModal(type);
  };
  const handleCloseModal = () => {
    setActiveModal(null);
  };

  return (
    <>
      <ContainerLayout title="外部EC連携">
        <OchanokoConnectionCard onConnect={() => handleOpenModal('ochanoko')} />
        {/* TODO:Shopify連携 */}
        {/* <ShopifyConnectionCard onConnect={() => handleOpenModal('shopify')} /> */}
      </ContainerLayout>

      {/* おちゃのこネット連携モーダル */}
      <OchanokoIntegrationModal
        open={activeModal === 'ochanoko'}
        onClose={handleCloseModal}
        onSuccess={() => {
          // おちゃのこ側のリフレッシュは各コンポーネント内で管理
          handleCloseModal();
        }}
      />

      {/* Shopify連携モーダル */}
      <ShopifyIntegrationModal
        open={activeModal === 'shopify'}
        onClose={handleCloseModal}
        onSuccess={() => {
          // Shopify側のリフレッシュは各コンポーネント内で管理
          handleCloseModal();
        }}
      />
    </>
  );
}
