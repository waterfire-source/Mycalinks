'use client';

import React from 'react';
import { CreateGuestCustomer } from '@/feature/createGuestCustomer';

const Page: React.FC = () => {
  return <CreateGuestCustomer pageTitle="予約受付フォーム" isReservation />;
};

export default Page;
