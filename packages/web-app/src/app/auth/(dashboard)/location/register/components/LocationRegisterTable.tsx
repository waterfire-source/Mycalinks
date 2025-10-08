import { LocationRegisterTableContent } from '@/app/auth/(dashboard)/location/register/components/LocationRegisterTableContent';
import { LocationProduct } from '@/app/auth/(dashboard)/location/register/page';

type Props = { locationProducts: LocationProduct[] };

export const LocationRegisterTable = ({ locationProducts }: Props) => {
  return <LocationRegisterTableContent locationProducts={locationProducts} />;
};
