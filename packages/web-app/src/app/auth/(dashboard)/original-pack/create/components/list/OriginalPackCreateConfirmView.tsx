import { OriginalPackConfirmProductList } from '@/app/auth/(dashboard)/original-pack/create/components/confirm/OriginalPackConfirmProductList';
import { OriginalPackConfirmDetailCard } from '@/app/auth/(dashboard)/original-pack/create/components/confirm/OriginalPackConfirmDetailCard';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { Grid } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

interface Props {
  onBack: () => void;
}
export const OriginalPackCreateConfirmView = ({ onBack }: Props) => {
  //補充機能の有無を判定
  const searchParams = useSearchParams();
  const isReplenishment = searchParams.get('replenishment') === 'true';
  const id = searchParams.get('id');

  const containerTitle = useMemo(() => {
    if (isReplenishment) {
      return 'オリパ・福袋・デッキ補充';
    } else if (id) {
      return 'オリパ・福袋・デッキ編集';
    } else {
      return 'オリパ・福袋・デッキ作成';
    }
  }, [isReplenishment, id]);

  return (
    <ContainerLayout title={containerTitle} helpArchivesNumber={559}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        <Grid item xs={7} sx={{ height: '100%' }}>
          <OriginalPackConfirmProductList />
        </Grid>
        <Grid item xs={5} sx={{ height: '100%' }}>
          <OriginalPackConfirmDetailCard onBack={onBack} />
        </Grid>
      </Grid>
    </ContainerLayout>
  );
};
