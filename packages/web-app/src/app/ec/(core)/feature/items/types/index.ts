import { EcOrderCartStoreStatus } from '@prisma/client';

export type DetailItem = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  seller: {
    id: number;
    name: string;
    description?: string;
  };
  modelNumber: string;
  rarity: string;
  stock: number;
  status: EcOrderCartStoreStatus;
  condition: {
    label: string;
    value: string;
  };
};
