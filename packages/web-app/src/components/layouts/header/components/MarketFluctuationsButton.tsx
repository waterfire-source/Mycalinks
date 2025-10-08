import SecondaryButton from '@/components/buttons/SecondaryButton';
import { useState } from 'react';
import { MarketFluctuationsModal } from '@/feature/marketFluctuationsModal/MarketFluctuationsModal';

export const HeaderMarketFluctuationsButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <SecondaryButton onClick={() => setIsOpen(true)}>
        相場変動
      </SecondaryButton>
      <MarketFluctuationsModal open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
