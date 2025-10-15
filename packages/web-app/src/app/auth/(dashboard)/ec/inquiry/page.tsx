'use client';

import { useState, useEffect } from 'react';

import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { InquiryContent } from '@/feature/ec/inquiry/components/InquiryContent';
import { InquiryModal } from '@/feature/ec/inquiry/components/InquiryModal';
import { useInquirySearch } from '@/feature/ec/inquiry/hooks/useInquirySearch';
import { Inquiry } from '@/feature/ec/inquiry/hooks/useInquiry';

export default function InquiryPage() {
  const [isOpen, setIsOpen] = useState(false); // selectedInquiryの有無で判断できるため無くてもいいが、可読性のため設定

  const { inquiries, searchState, setSearchState, performSearch } =
    useInquirySearch();
  const [refreshInquiry, setRefreshInquiry] = useState(false); // リフェッチのためのフラグ

  const [selectedInquiry, setSelectedInquiry] = useState<
    Inquiry['orderContacts'][0] | null
  >(null);

  useEffect(() => {
    performSearch();
  }, [
    searchState.orderId,
    searchState.code,
    searchState.kind,
    searchState.skip,
    searchState.take,
    searchState.orderBy,
    searchState.status,
    searchState.includesMessages,
    performSearch,
  ]);

  useEffect(() => {
    if (!refreshInquiry) return;
    performSearch();
    setRefreshInquiry(false);
  }, [refreshInquiry, performSearch]);

  const handleModalClose = () => {
    setSelectedInquiry(null);
    setIsOpen(false);
  };
  return (
    <>
      <ContainerLayout title="お問い合わせ一覧" helpArchivesNumber={2884}>
        {/* データテーブル部分 */}
        <InquiryContent
          inquiries={inquiries}
          searchState={searchState}
          setSearchState={setSearchState}
          setIsModalOpen={setIsOpen}
          setSelectedInquiry={setSelectedInquiry}
        />
      </ContainerLayout>

      {/* モーダル */}
      {selectedInquiry !== null && (
        <InquiryModal
          isOpen={isOpen}
          onClose={handleModalClose}
          inquiry={selectedInquiry}
          setRefreshInquiry={setRefreshInquiry}
        />
      )}
    </>
  );
}
